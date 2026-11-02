#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

APP_VIDEO="$(cat recordings/latest.txt)"
EXP_VIDEO="$(cat recordings/explorer-latest.txt)"
BUILD_DIR="recordings/build"
mkdir -p "$BUILD_DIR"

# 0–5s: title card.
ffmpeg -y -ss 0 -t 5 -i "$APP_VIDEO" -an \
  -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -r 25 \
  -video_track_timescale 90000 "$BUILD_DIR/01-title.mp4"

# 5–7s: hold the title card while the voiceover introduces RelayCrew, then cut
# to the fully loaded app instead of showing the page-load fade.
ffmpeg -y -ss 4.9 -i "$APP_VIDEO" -frames:v 1 "$BUILD_DIR/title.png"
ffmpeg -y -loop 1 -i "$BUILD_DIR/title.png" -t 2 -r 25 -an \
  -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p \
  -video_track_timescale 90000 "$BUILD_DIR/02-title-hold.mp4"

# 7–55s: live app, Studio export, completed pipeline.
ffmpeg -y -ss 7 -t 48 -i "$APP_VIDEO" -an \
  -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -r 25 \
  -video_track_timescale 90000 "$BUILD_DIR/03-app.mp4"

# 4–15s: Arc explorer transaction top (hash, status, 1 USDC transfer).
ffmpeg -y -ss 4 -t 11 -i "$EXP_VIDEO" -an \
  -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -r 25 \
  -video_track_timescale 90000 "$BUILD_DIR/04-explorer-top.mp4"

# 16–22s: Token transfers tab showing the 1 USDC ERC-20 transfer.
ffmpeg -y -ss 16 -t 6 -i "$EXP_VIDEO" -an \
  -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -r 25 \
  -video_track_timescale 90000 "$BUILD_DIR/05-explorer-token.mp4"

# 25–35s: end card.
ffmpeg -y -ss 25 -t 10 -i "$EXP_VIDEO" -an \
  -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -r 25 \
  -video_track_timescale 90000 "$BUILD_DIR/06-end.mp4"

cat > "$BUILD_DIR/concat.txt" <<EOF
file '01-title.mp4'
file '02-title-hold.mp4'
file '03-app.mp4'
file '04-explorer-top.mp4'
file '05-explorer-token.mp4'
file '06-end.mp4'
EOF

ffmpeg -y -f concat -safe 0 -i "$BUILD_DIR/concat.txt" -c copy \
  "$BUILD_DIR/video-noaudio.mp4"

# The title card occupies the first 5 seconds; the voiceover is padded to the
# full 82-second runtime so the end card is not cut off.
ffmpeg -y -i "$BUILD_DIR/video-noaudio.mp4" -i voiceover.mp3 \
  -filter_complex "[1:a]adelay=5000|5000,apad=pad_dur=5[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest \
  -movflags +faststart relaycrew_demo.mp4

echo "Wrote $(pwd)/relaycrew_demo.mp4"
ffprobe -v error -show_entries format=duration,size \
  -show_entries stream=index,codec_name,codec_type,width,height,r_frame_rate \
  -of default=noprint_wrappers=1 relaycrew_demo.mp4
