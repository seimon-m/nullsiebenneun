/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export
  output: 'export',
  
  // Disable server-side rendering for static export
  trailingSlash: true,
  
  // Configure images for static export
  images: {
    unoptimized: true,
    domains: ['nullsiebenneun.vercel.app'],
  },
  
  // Enable experimental features if needed
  experimental: {
    serverActions: true,
  },
  
  // Optional: Set the base path if your site is served from a subdirectory
  // basePath: '/your-base-path',
};

export default nextConfig;
