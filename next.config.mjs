/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/collection",
        destination: "/shop",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
