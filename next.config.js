/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {},
  },
  images: {
    domains: ['nullsiebenneun.vercel.app'],
    unoptimized: true, // Required for static export
  },
  output: 'export',
  // Ensure trailing slash for static export
  trailingSlash: true,
  // Optional: Set the base path if your site is served from a subdirectory
  // basePath: '/your-base-path',
};

export default nextConfig;
