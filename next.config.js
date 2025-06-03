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
};

export default nextConfig;
