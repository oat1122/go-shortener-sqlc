/** @type {import('next').NextConfig} */
const nextConfig = {
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
