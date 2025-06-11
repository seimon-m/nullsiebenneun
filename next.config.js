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
};

export default nextConfig;
