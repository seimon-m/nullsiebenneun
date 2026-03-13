# nullsiebenneun

Verschiebung zum mithören
oder zum mitnehmen
45x von A nach B
der Raum
zwischen den Stühlen
hinterlässt seine Spuren
im Archiv «nullsiebenneun»

## Overview
A Next.js application that serves as a video archive. The video files are hosted on AWS S3 and delivered via CloudFront to avoid hitting GitHub LFS bandwidth limits and to ensure fast playback across all devices.

## Local Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory and configure your AWS/CloudFront credentials:
```env
NEXT_PUBLIC_CLOUDFRONT_DOMAIN="your-cloudfront-domain.cloudfront.net"
NEXT_PUBLIC_S3_BUCKET_NAME="your-s3-bucket-name"
NEXT_PUBLIC_AWS_REGION="your-aws-region"
```

### 3. Media Files
Local video files should be placed in `public/videos/`. 
*(Note: This folder is deliberately gitignored so large video files are not tracked by the repo, avoiding Git LFS bandwidth limits.)*

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
