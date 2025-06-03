import { existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const videosDir = join(__dirname, '../public/videos');
const audioDir = join(__dirname, '../public/audio');
const thumbsDir = join(__dirname, '../public/thumbnails');
const dataFile = join(__dirname, '../lib/data.js');

// Format file size to human readable format
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

// Create thumbnails directory if it doesn't exist
if (!existsSync(thumbsDir)) {
  mkdirSync(thumbsDir, { recursive: true });
}

// Get all video files
const videoFiles = readdirSync(videosDir).filter(file => file.endsWith('.mp4'));

console.log(`Found ${videoFiles.length} video files`);

// Generate thumbnails and collect file info
const fileInfo = [];

for (const videoFile of videoFiles) {
  const baseName = basename(videoFile, '.mp4');
  const videoPath = join(videosDir, videoFile);
  const audioPath = join(audioDir, `${baseName}.wav`);
  const thumbName = `${baseName}.jpg`;
  const thumbPath = join(thumbsDir, thumbName);

  console.log(`Processing ${baseName}...`);

  try {
    // Generate thumbnail if it doesn't exist
    if (!existsSync(thumbPath)) {
      console.log(`  - Generating thumbnail...`);
      execSync(`ffmpeg -i "${videoPath}" -ss 00:00:01.000 -vframes 1 -q:v 2 "${thumbPath}"`);
    }

    // Get audio file size
    let fileSize = '0 B';
    if (existsSync(audioPath)) {
      const stats = statSync(audioPath);
      fileSize = formatFileSize(stats.size);
    }

    fileInfo.push({
      id: baseName.replace(/\s+/g, ''),
      title: baseName,
      filename: baseName,
      thumbnail: `/thumbnails/${thumbName}`,
      videoUrl: `/videos/${videoFile}`,
      audioUrl: `/audio/${baseName}.wav`,
      fileSize: fileSize
    });

    console.log(`  - Thumbnail: ${thumbName}`);
    console.log(`  - Audio size: ${fileSize}`);
  } catch (error) {
    console.error(`Error processing ${videoFile}:`, error.message);
  }
}

// Update data.js with the new file info
const dataContent = `export const VideoFiles = ${JSON.stringify(fileInfo, null, 2)};

export function getAudioFiles() {
  return VideoFiles.map(({ id, title, filename, audioUrl, fileSize }) => ({
    id,
    title,
    filename,
    audioUrl,
    fileSize,
  }));
}
`;

import('fs').then(fs => {
  fs.writeFileSync(dataFile, dataContent);
  console.log('\n✅ Updated data.js with actual file sizes');
});

console.log('\nThumbnail generation and file size update complete!');
