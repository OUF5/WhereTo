/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    // Production API URL - baked into the build
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://whereto-815989745598.europe-west1.run.app/v1',
  },
};

module.exports = nextConfig;

