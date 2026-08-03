/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
  },
  transpilePackages: ['@mui/material', '@emotion/react', '@emotion/styled'],
};

module.exports = nextConfig;
