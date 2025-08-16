# Migration BEAST – Offline Media Generation and Next.js Integration

A production-ready Next.js App Router project for the BEAST dashboard with an offline Python pipeline to generate monthly narration text, TTS audio, captioned videos (MP4/WebM), and WebVTT captions. The system uses pyttsx3 for offline text‑to‑speech, MoviePy+FFmpeg for video muxing, and standard WebVTT captions that play in any modern browser.

- Offline TTS via pyttsx3 using system voices; save_to_file finalized with runAndWait().[1][2][3]
- Videos exported as MP4(H.264/AAC) and optional WebM(VP9/Vorbis) for wide browser support.[4][5][6]
- Captions authored in WebVTT with the required WEBVTT header and hh:mm:ss.mmm timestamps.[7][8][9]

## Contents

- Overview
- Requirements
- Setup
- Generate Media (Python)
- App Integration (Next.js)
- Deploy on Vercel
- File Structure
- Troubleshooting
- Notes on Standards
- License

## Overview

This repo includes:
- A Next.js dashboard (App Router) for BEAST visualizations and media playback.
- Python scripts to auto-generate monthly narration:
  - Text: narration_MXX.txt
  - Audio: narration_MXX.wav (offline TTS)
  - Video: narration_MXX.mp4 and optional narration_MXX.webm
  - Captions: narration_MXX.en.vtt

The pipeline reads months and KPIs from public/data to produce synchronized narration with captions and static backgrounds.

## Requirements

- Node.js (for Next.js app)
- Python 3.9+ with:
  - pyttsx3 (offline TTS; uses system voices)[10][3][1]
  - moviepy (video muxing) and FFmpeg installed on PATH[5][6]
  - pillow (only if auto-generating a fallback background)
- FFmpeg (required by MoviePy)[6]
- WebVTT-compliant players (HTML5  + )

Why these tools:
- pyttsx3 works offline and saves to audio files; saving must be followed by runAndWait().[2][3][1]
- MoviePy’s write_videofile supports explicit codec selection (libx264/aac and VP9/vorbis) to maximize compatibility.[11][5][6]
- WebVTT is the W3C standard for HTML5 captions via the track element.[8][9][7]

## Setup

1) Install Node dependencies
- Standard Next.js workflow (package.json scripts not shown here).

2) Python environment
- pip install pyttsx3 moviepy pillow
- Ensure FFmpeg is installed and available on PATH for MoviePy to export videos.[5][6]

3) Prepare static background
- Create public/media/bg.png (1920x1080 recommended). A fallback image can be auto-generated if pillow is installed.

## Generate Media (Python)

Two scripts are provided:

- scripts/make_bg.py: Generates public/media/bg.png via Pillow (optional).
- scripts/make_media_all.py: Reads public/data/manifest.json and public/data/scripts.json, builds monthly scripts, generates WAV audio via pyttsx3, exports MP4/WebM, and writes WebVTT with proportional timings.

Key Python behaviors:
- TTS: engine.save_to_file(...); engine.runAndWait() finalizes the file; prefer WAV output for reliability on all platforms.[12][3][2]
- Video: MoviePy write_videofile(..., codec="libx264", audio_codec="aac") for MP4 and libvpx-vp9/libvorbis for WebM.[4][6][11][5]
- Captions: WebVTT requires the “WEBVTT” header, cues with “start --> end” and hh:mm:ss.mmm timestamps using dot milliseconds.[9][7][8]

Run:
- python scripts/make_bg.py (optional if bg.png already exists)
- python scripts/make_media_all.py

Outputs (per month):
- media_work/text/narration_MXX.txt
- media_work/audio/narration_MXX.wav
- media_work/video/narration_MXX.mp4
- media_work/video/narration_MXX.webm (optional)
- media_work/video/narration_MXX.en.vtt

Then copy to public/media:
- narration_MXX.mp4, narration_MXX.webm, narration_MXX.en.vtt
- Ensure public/media/bg.png exists.

## App Integration (Next.js)

Use static assets from public/media with absolute paths:

- /media/narration_M10.mp4
- /media/narration_M10.webm
- /media/narration_M10.en.vtt
- /media/bg.png

Render in the page with HTML5 :
- Provide both MP4 and WebM  entries so browsers pick supported formats.[6][5]
- Add  pointing to the WebVTT file, which must start with WEBVTT and use dot-separated milliseconds.[7][8][9]

## Deploy on Vercel

- Push to GitHub and import the repo into Vercel.
- Defaults (Framework: Next.js, Build: next build) usually work without extra config.
- Verify:
  - Media files are in public/media with root-relative references like /media/narration_M10.mp4.
  - Captions load in production; open /media/narration_M10.en.vtt directly to verify content.

Vercel aligns with Next.js static serving from public/. No special basePath is needed when deploying at the domain root.

## File Structure

- app/page.tsx — main page rendering the dashboard and video with captions.
- components/VideoPlayer.tsx — small helper component for video+track (optional).
- public/media/ — static assets served at /media/…
  - bg.png
  - narration_MXX.mp4
  - narration_MXX.webm (optional)
  - narration_MXX.en.vtt
- public/data/
  - manifest.json — list of available months
  - scripts.json — KPI-like data referenced by the Python generator
- scripts/
  - make_bg.py — generate bg.png (optional)
  - make_media_all.py — generate TTS, video, and captions for all months

## Troubleshooting

- Audio file not created by pyttsx3:
  - Always call engine.runAndWait() after save_to_file; prefer WAV output to avoid MP3 quirks on some systems.[3][12][2]
- MoviePy export lacks audio or fails:
  - Specify codec="libx264" and audio_codec="aac" for MP4; ensure FFmpeg is installed; for WebM use libvpx-vp9 with libvorbis.[11][4][5][6]
- Captions don’t display:
  - Confirm WebVTT header “WEBVTT”, dot-separated milliseconds, “start --> end” format, cues separated by blank lines, and serve over HTTP/HTTPS (not file://).[8][9][7]
- Browser playback compatibility:
  - Supplying both MP4(H.264/AAC) and WebM(VP9/Vorbis) improves coverage; the browser selects the first supported source.[4][5][6]

## Notes on Standards

- WebVTT formatting rules are defined by W3C; ensure header, timestamp format, and cue structure comply.[9][7][8]
- MP4 and WebM codec parameters used here reflect common, interoperable FFmpeg settings adopted by web platforms.[5][6][11][4]
- pyttsx3 is an offline TTS library leveraging system engines and supports saving synthesized speech to files; runAndWait() is required to finalize output.[1][2][3]

## License

- Include your preferred license here (e.g., MIT), and ensure third-party licenses (e.g., fonts or images used in bg.png) are compatible.

References to external standards and libraries:
- pyttsx3 offline TTS and save_to_file + runAndWait details.[2][3][1]
- MoviePy write_videofile and codec selections.[6][11][5]
- WebVTT specification and usage in HTML5.[7][8][9]
- Optional WebM encoding guidance for FFmpeg.[4]

[1] https://github.com/nateshmbhat/pyttsx3
[2] https://pyttsx3.readthedocs.io/en/latest/engine.html
[3] https://automatetheboringstuff.com/3e/chapter24.html
[4] https://gist.github.com/glen-cheney/278e13915894821e1d6f
[5] https://stackoverflow.com/questions/73161164/moviepy-video-will-not-export-with-the-audio-i-add-to-it
[6] https://zulko.github.io/moviepy/_modules/moviepy/video/VideoClip.html
[7] https://www.w3.org/TR/webvtt1/
[8] https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API/Web_Video_Text_Tracks_Format
[9] https://en.wikipedia.org/wiki/WebVTT
[10] https://pypi.org/project/pyttsx3/
[11] https://github.com/Zulko/moviepy/blob/master/moviepy/video/io/ffmpeg_writer.py
[12] https://www.reddit.com/r/learnpython/comments/18o0ic6/pyttsx3_not_saving_to_file/
[13] https://stackoverflow.com/questions/70930330/how-do-you-make-pyttsx3-actually-wait-after-saving-to-file
[14] https://github.com/nateshmbhat/pyttsx3/issues/71
[15] https://sdks.support.brightcove.com/features/synchronizing-webvtt-captions.html
[16] https://dev.to/mr_nova/text-to-speech-with-python-a-beginners-guide-to-pyttsx3-2pie
[17] https://www.w3.org/2013/07/webvtt.html
[18] https://github.com/Zulko/moviepy/issues/2082
[19] https://pypi.org/project/pyttsx4/
[20] https://www.reddit.com/r/learnpython/comments/i2d0gi/how_to_make_sure_that_i_dont_lose_any_quality_in/
