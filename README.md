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

## Deploy to Render

This repository includes a `Dockerfile` that installs Node.js, Python, `yt-dlp`, and FFmpeg together. To deploy it:

1. Push the project to GitHub.
2. In Render, choose **New > Web Service** and connect the GitHub repository.
3. Choose **Docker** as the runtime. Render will detect the root `Dockerfile`.
4. Select the **Free** plan and create the service.
5. After the deploy finishes, open the generated `onrender.com` URL.

The included `render.yaml` can also be used as a Blueprint. The service uses one download at a time by default. Render's free services can sleep after inactivity and have ephemeral storage, which is acceptable here because downloads are temporary and deleted after each response.

## Hosting notes

GitHub Pages and Live Server can display the Windows 95 desktop, icons, animations, and window controls because those are static frontend files. They cannot run the Express server, Python, `yt-dlp`, or FFmpeg, so the download form itself requires the Express app to be running on a backend host. The frontend uses relative asset paths so it also works when GitHub Pages serves the project under a repository subpath.

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
