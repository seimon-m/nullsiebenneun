#!/usr/bin/env bash
# Compresses original videos to web-friendly H.264 files.
# - caps resolution at 1920px width (keeps aspect ratio)
# - CRF 23 / preset slow, AAC 160k audio
# - moves the moov atom to the front (faststart) so streaming starts instantly
#
# Usage: ./scripts/compress-videos.sh <input-dir> [output-dir]
# Output defaults to public/videos/
set -euo pipefail

IN_DIR="${1:?Usage: $0 <input-dir> [output-dir]}"
OUT_DIR="${2:-$(cd "$(dirname "$0")/.." && pwd)/public/videos}"
mkdir -p "$OUT_DIR"

shopt -s nullglob
files=("$IN_DIR"/*.mp4)
total=${#files[@]}
[ "$total" -gt 0 ] || { echo "No .mp4 files in $IN_DIR"; exit 1; }

i=0
for src in "${files[@]}"; do
  i=$((i + 1))
  name="$(basename "$src")"
  out="$OUT_DIR/$name"
  echo "[$i/$total] $name"
  ffmpeg -hide_banner -loglevel error -y \
    -i "$src" \
    -vf "scale='min(1920,iw)':-2" \
    -c:v libx264 -crf 23 -preset slow -pix_fmt yuv420p \
    -c:a aac -b:a 160k \
    -movflags +faststart \
    "$out"
  in_mb=$(du -m "$src" | cut -f1)
  out_mb=$(du -m "$out" | cut -f1)
  echo "    ${in_mb} MB -> ${out_mb} MB"
done

echo "Done: $total videos compressed to $OUT_DIR"
