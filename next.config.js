/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      serverActions: true,
    },
    async headers() {
      return [
        {
          source: '/videos/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ],
        },
      ];
    },
    api: {
      bodyParser: {
        sizeLimit: '10mb',
      },
    },
  };

  export default nextConfig;
