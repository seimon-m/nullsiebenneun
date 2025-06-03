/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      serverActions: {}, // Changed from true to an empty object
    },
    // Removed headers as they're not compatible with static export
    // output: 'export', // Commented out as it conflicts with dynamic routes
    images: {
      domains: ['nullsiebenneun.vercel.app'],
      unoptimized: false, // Set to false as we're not using static export
    },
    // Webpack configuration for handling video files
    webpack(config) {
      config.module.rules.push({
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        use: {
          loader: 'file-loader',
          options: {
            publicPath: '/_next/static/videos/',
            outputPath: 'static/videos/',
            name: '[name]-[hash].[ext]',
            esModule: false,
          },
        },
      });
      return config;
    },
  };

  export default nextConfig;
