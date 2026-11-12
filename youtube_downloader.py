# When you run this program it will ask you to paste the Youtube url for the video you want to download
# Paste that URL in and press enter
# It will now give you a list of available formats to download
# Example: ID: 137 | Resolution: 1080p | Extension: mp4 | Size: 42.95 MB
# after looking through the available formats to download it will ask you to enter the format ID to download
# In the example I gave above you would enter the ID: 137 and it will start the download process for that format
# Then it will ask where you want the video to be saved to on your computer
# Enter your desired location you wish for the video to be downloaded (ex: C:\Users\username\Downloads)
# The program will now download the youtube video and audio and save it to the location you entered
import os
from yt_dlp import YoutubeDL

def list_formats(url):
    try:
        ydl_opts = {
            'quiet': True,
            'ffmpeg_location': r'C:\Users\bosto\Desktop\ffmpeg\ffmpeg-master-latest-win64-gpl\bin'  # Replace with your actual FFmpeg path
        }
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            formats = info.get('formats', [])
            print("\nAvailable formats:")
            for fmt in formats:
                resolution = fmt.get('format_note', 'Unknown')
                ext = fmt.get('ext', 'Unknown')
                format_id = fmt.get('format_id', 'Unknown')
                filesize = fmt.get('filesize', None)

                # This is to handle unknown or non-numeric filesizes
                try:
                    filesize_mb = f"{int(filesize) / 1024 / 1024:.2f} MB" if filesize else "Unknown size"
                except (ValueError, TypeError):
                    filesize_mb = "Unknown size"

                print(f"ID: {format_id} | Resolution: {resolution} | Extension: {ext} | Size: {filesize_mb}")
            return formats
    except Exception as e:
        print(f"Error listing formats: {e}")
        return []

def download_video(url, format_id, save_path='.'):
    try:
        ydl_opts = {
            'format': 'bestvideo+bestaudio/best',  # this will automatically choose the best video and audio file to use
            'merge_output_format': 'mp4',  
            'ffmpeg_location': r'C:\Users\bosto\Desktop\ffmpeg\ffmpeg-master-latest-win64-gpl\bin',  # Path to FFmpeg
            'outtmpl': f'{save_path}/%(title)s.%(ext)s',
            'noplaylist': True, 
            'postprocessors': [{
                'key': 'FFmpegVideoConvertor',
                'preferedformat': 'mp4',
            }],
        }
        with YoutubeDL(ydl_opts) as ydl:
            print("Downloading and merging streams...")
            ydl.download([url])
            print(f"Download completed successfully. File saved to: {save_path}")
    except Exception as e:
        print(f"Error downloading video: {e}")

def main():
    url = input("Enter the YouTube video URL: ").strip()
    formats = list_formats(url)
    if formats:
        format_id = input("Enter the format ID to download (from the list above): ").strip()
        save_path = input("Enter the folder path to save the video (default is current directory): ").strip() or '.'
        download_video(url, format_id, save_path)

if __name__ == "__main__":
    main()
