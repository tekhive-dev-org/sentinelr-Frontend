/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
  },
  transpilePackages: ['@mui/x-date-pickers', '@mui/material'],
};

module.exports = nextConfig;
