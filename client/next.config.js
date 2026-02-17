/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: process.env.IMAGE_HOSTNAME || "localhost",
        port: process.env.IMAGE_PORT || "8080",
        pathname: "/uploads/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/:slug",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:slug`,
      },
    ];
  },
};

module.exports = nextConfig;
