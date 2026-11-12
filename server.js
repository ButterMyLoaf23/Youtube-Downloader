const express = require('express');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

const app = express();
const port = Number(process.env.PORT) || 3000;
const queueConcurrency = Number(process.env.DOWNLOAD_CONCURRENCY) || 1;

app.disable('x-powered-by');
app.use(express.urlencoded({ extended: false, limit: '16kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const allowedHosts = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
  'www.youtu.be'
]);

function isYouTubeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && allowedHosts.has(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

function runYtDlp(url, outputDir, format) {
  return new Promise((resolve, reject) => {
    // `py -m yt_dlp` works on Windows when yt-dlp was installed with Python.
    // Set YTDLP_COMMAND to `yt-dlp` on systems where it is on PATH.
    const command = process.env.YTDLP_COMMAND || (process.platform === 'win32' ? 'py' : 'yt-dlp');
    const args = process.platform === 'win32' && !process.env.YTDLP_COMMAND
      ? ['-m', 'yt_dlp']
      : [];

    args.push('--no-playlist', '--no-progress', '--restrict-filenames');

    if (format === 'mp3') {
      args.push(
        '-f', 'bestaudio/best',
        '--extract-audio',
        '--audio-format', 'mp3',
        '--audio-quality', '0'
      );
    } else {
      args.push(
        '-f', 'bestvideo+bestaudio/best',
        '--merge-output-format', 'mp4',
        '--remux-video', 'mp4'
      );
    }

    args.push('-o', path.join(outputDir, 'video.%(ext)s'), url);

    const child = spawn(command, args, { windowsHide: true });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `yt-dlp exited with code ${code}`));
      } else {
        resolve();
      }
    });
  });
}

class DownloadQueue {
  constructor(concurrency, maxPending = 10) {
    this.concurrency = Math.max(1, concurrency);
    this.maxPending = maxPending;
    this.active = 0;
    this.pending = [];
  }

  add(task) {
    if (this.pending.length >= this.maxPending) {
      return Promise.reject(new Error('The download queue is full. Please try again shortly.'));
    }

    return new Promise((resolve, reject) => {
      this.pending.push({ task, resolve, reject });
      this.process();
    });
  }

  process() {
    while (this.active < this.concurrency && this.pending.length > 0) {
      const item = this.pending.shift();
      this.active += 1;

      Promise.resolve()
        .then(item.task)
        .then(item.resolve, item.reject)
        .finally(() => {
          this.active -= 1;
          this.process();
        });
    }
  }
}

const downloadQueue = new DownloadQueue(queueConcurrency);

app.post('/download', async (req, res) => {
  const url = String(req.body.url || '').trim();
  const format = req.body.format === 'mp3' ? 'mp3' : 'mp4';
  if (url.length > 2048 || !isYouTubeUrl(url)) {
    return res.status(400).send('Please enter a valid HTTPS YouTube URL.');
  }

  let workDir;
  try {
    const outputPath = await downloadQueue.add(async () => {
      workDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'youtube-downloader-'));
      await runYtDlp(url, workDir, format);

      const files = await fsp.readdir(workDir);
      const outputName = files.find((file) => file.toLowerCase().endsWith(`.${format}`));
      if (!outputName) throw new Error(`The downloader did not produce an ${format.toUpperCase()} file.`);
      return path.join(workDir, outputName);
    });

    res.download(outputPath, `youtube-video.${format}`, async (error) => {
      await fsp.rm(workDir, { recursive: true, force: true });
      if (error && !res.headersSent) res.status(500).send('Download failed.');
    });
  } catch (error) {
    if (workDir) await fsp.rm(workDir, { recursive: true, force: true });
    console.error(error.message);
    const status = error.message.includes('queue is full') ? 429 : 502;
    res.status(status).send(error.message.includes('queue is full')
      ? error.message
      : 'Could not download that video. Check the URL and try again.');
  }
});

app.listen(port, () => {
  console.log(`YouTube Downloader is running at http://localhost:${port}`);
});
