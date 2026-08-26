#!/usr/bin/env bash
# Uploads all local audio files to the Cloudflare R2 bucket under the audio/ prefix.
# Requires wrangler auth: run `npx wrangler login` once before this script.
#
# Usage: ./scripts/upload-audio-r2.sh <bucket-name>
set -euo pipefail

BUCKET="${1:?Usage: $0 <bucket-name>}"
AUDIO_DIR="$(cd "$(dirname "$0")/../public/audio" && pwd)"

count=0
for file in "$AUDIO_DIR"/*.wav; do
  name="$(basename "$file")"
  echo "Uploading audio/$name ..."
  npx wrangler r2 object put "$BUCKET/audio/$name" \
    --file "$file" \
    --content-type "audio/wav" \
    --cache-control "public, max-age=31536000, immutable" \
    --remote
  count=$((count + 1))
done

echo "Done: uploaded $count files to $BUCKET/audio/"
