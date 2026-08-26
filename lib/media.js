// Central media URL helper.
// All large media (videos, audio) is served from Cloudflare R2.
// NEXT_PUBLIC_MEDIA_BASE_URL is the public base URL of the R2 bucket,
// e.g. "https://pub-xxxxxxxxxxxxxxxx.r2.dev" or later "https://media.example.ch".
// When unset (e.g. local dev without R2), paths resolve against /public.
const MEDIA_BASE_URL = (process.env.NEXT_PUBLIC_MEDIA_BASE_URL || '').replace(/\/+$/, '');

// The R2 bucket uses uppercase folder names; local /public uses lowercase.
const R2_PREFIXES = {
  videos: 'VIDEO',
  audio: 'AUDIO',
};

export function getMediaUrl(path) {
  if (!path) return '';
  let mediaPath = path;
  if (MEDIA_BASE_URL) {
    mediaPath = path.replace(
      /^\/(videos|audio)\//,
      (_, folder) => `/${R2_PREFIXES[folder]}/`
    );
  }
  // Encode each segment (filenames contain spaces) but keep the slashes.
  const encoded = mediaPath
    .split('/')
    .map((segment) => encodeURIComponent(segment.trim()))
    .join('/');
  return `${MEDIA_BASE_URL}${encoded.startsWith('/') ? '' : '/'}${encoded}`;
}
