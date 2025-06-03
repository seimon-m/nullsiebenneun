import { existsSync, mkdirSync, readdirSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const videosDir = join(__dirname, '../public/videos');
const thumbsDir = join(__dirname, '../public/thumbnails');

// Create thumbnails directory if it doesn't exist
if (!existsSync(thumbsDir)) {
  mkdirSync(thumbsDir, { recursive: true });
}

// Get all video files
const videoFiles = readdirSync(videosDir).filter(file => file.endsWith('.mp4'));

console.log(`Found ${videoFiles.length} video files`);

videoFiles.forEach((videoFile, index) => {
  const videoPath = join(videosDir, videoFile);
  const thumbName = basename(videoFile, '.mp4') + '.jpg';
  const thumbPath = join(thumbsDir, thumbName);

  console.log(`[${index + 1}/${videoFiles.length}] Generating thumbnail for ${videoFile}...`);

  try {
    // Extract first frame as thumbnail (1 second in to avoid black frames)
    execSync(`ffmpeg -i "${videoPath}" -ss 00:00:01.000 -vframes 1 -q:v 2 "${thumbPath}"`);
    console.log(`✓ Created ${thumbName}`);
  } catch (error) {
    console.error(`Error generating thumbnail for ${videoFile}:`, error.message);
  }
});

console.log('\nThumbnail generation complete!');
