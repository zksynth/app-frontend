/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'cryptologos.cc', 'raw.githubusercontent.com'],
  }
};

module.exports = nextConfig;
