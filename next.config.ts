import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
      },
    ],
    domains: [
      'cdn.discordapp.com',
      'media.discordapp.net',
    ]
  },
};

export default nextConfig;
