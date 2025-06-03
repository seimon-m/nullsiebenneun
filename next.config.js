/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      serverActions: {},
    },
    images: {
      domains: ['nullsiebenneun.vercel.app'],
      unoptimized: false,
    },
    // Add this to ensure static files are properly exported
    output: 'export',
    // Remove the webpack configuration as it's not needed with static export
  };

  module.exports = nextConfig;
