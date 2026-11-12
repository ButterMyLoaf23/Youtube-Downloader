# YouTube Downloader

A small Express.js web app based on the original Python prototype. It downloads one user-supplied YouTube video or audio file at a time, streams the finished MP4 or MP3 to the browser, and removes the temporary server file afterward. Frontend CSS and JavaScript live in their own folders under `public/`.

## Requirements

- Node.js 18+
- Python 3.8+ with `yt-dlp` installed: `py -m pip install -U yt-dlp`
- FFmpeg installed and available on PATH

## Run locally

```powershell
npm install
npm start
```

Open http://localhost:3000.

On macOS/Linux, or if `yt-dlp` is already on PATH, set `YTDLP_COMMAND=yt-dlp`. On Windows the default command is `py -m yt_dlp`.

Downloads are handled by an in-memory queue. The default concurrency is one download at a time, with up to ten additional requests waiting. Change the active concurrency with `DOWNLOAD_CONCURRENCY` if needed.

## Important considerations

Use this only for content you own or are authorized to download, and review YouTube's terms and applicable copyright law before deploying it publicly. The current queue is intentionally in memory, so a production deployment should later add authentication, rate limiting, download size/time limits, logging, and a durable queue if jobs need to survive restarts.
