# nullsiebenneun

Verschiebung zum mithören
oder zum mitnehmen
45x von A nach B
der Raum
zwischen den Stühlen
hinterlässt seine Spuren
im Archiv «nullsiebenneun»

## Overview
A Next.js application that serves as a video archive. All large media (videos under `videos/`, audio under `audio/`) is hosted in a Cloudflare R2 bucket (free plan, no egress fees) and served via its public bucket URL. Thumbnails are small and live in the repo under `public/thumbnails/`.

## Local Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory and set the public base URL of the R2 bucket (the `r2.dev` URL from the Cloudflare dashboard, or a custom domain later):
```env
NEXT_PUBLIC_MEDIA_BASE_URL="https://pub-xxxxxxxxxxxxxxxx.r2.dev"
```
If the variable is unset, media URLs fall back to relative paths and are served from `public/` — handy for local development with local files.

### 3. Media Files
Local video/audio files can be placed in `public/videos/` and `public/audio/`.
*(Both folders are gitignored so large media files are not tracked by the repo or uploaded on every deploy.)*

To upload audio files to R2 (after `npx wrangler login`):
```bash
./scripts/upload-audio-r2.sh <bucket-name>
```

### 4. Generate Thumbnails & Data
If you add new videos, run the helper script to generate thumbnails and update the `lib/data.js` manifest:
```bash
npm run generate-thumbnails
```
*Requires `ffmpeg` to be installed on your machine.*

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
