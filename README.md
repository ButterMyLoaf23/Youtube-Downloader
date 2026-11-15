# YouTube Downloader

A small Express.js web app based on the original Python prototype, presented inside a Windows 95-inspired desktop simulator. It downloads one user-supplied YouTube video or audio file at a time, streams the finished MP4 or MP3 to the browser, and removes the temporary server file afterward.

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

## Desktop controls

- Double-click the YouTube Downloader folder to open the app.
- Drag the app by its title bar.
- Use the minimize, maximize, and close buttons in the title bar.
- Restore minimized apps from the taskbar.
- Drag an app window onto the Recycle Bin to close it.
- Double-click YouTube to open YouTube in a new browser tab.
- Click the Internet Explorer taskbar shortcut to open Google in a new browser tab.

The reusable window logic lives in `public/js/windowManager.js`. To add another application later, add a desktop icon and an `.app-window` element, then register it with `WindowManager` in `public/js/app.js`.

## Important considerations

Use this only for content you own or are authorized to download, and review YouTube's terms and applicable copyright law before deploying it publicly. The current queue is intentionally in memory, so a production deployment should later add authentication, rate limiting, download size/time limits, logging, and a durable queue if jobs need to survive restarts.
