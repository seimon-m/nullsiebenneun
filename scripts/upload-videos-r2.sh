#!/usr/bin/env bash
# Uploads all local video files to the Cloudflare R2 bucket under the VIDEO/ prefix.
# Requires wrangler auth: run `npx wrangler login` once before this script.
#
# Usage: ./scripts/upload-videos-r2.sh <bucket-name> [video-dir]
set -euo pipefail

BUCKET="${1:?Usage: $0 <bucket-name> [video-dir]}"
VIDEO_DIR="${2:-$(cd "$(dirname "$0")/../public/videos" && pwd)}"

count=0
for file in "$VIDEO_DIR"/*.mp4; do
  name="$(basename "$file")"
  echo "Uploading VIDEO/$name ..."
  npx wrangler r2 object put "$BUCKET/VIDEO/$name" \
    --file "$file" \
    --content-type "video/mp4" \
    --cache-control "public, max-age=31536000, immutable" \
    --remote
  count=$((count + 1))
done

echo "Done: uploaded $count files to $BUCKET/VIDEO/"
