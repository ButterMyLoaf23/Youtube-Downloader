FROM node:22-bookworm-slim

WORKDIR /app

# Install the native tools required by yt-dlp for video merging and MP3 conversion.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 python3-venv ffmpeg ca-certificates \
  && python3 -m venv /opt/yt-dlp \
  && /opt/yt-dlp/bin/pip install --no-cache-dir --upgrade yt-dlp \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

ENV YTDLP_COMMAND=/opt/yt-dlp/bin/yt-dlp
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 10000
CMD ["npm", "start"]
