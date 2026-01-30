/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost', 'uploadthing.com', 'img.clerk.com'],
  },
  async headers() {
    return [
      {
        source: '/api/socket',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
