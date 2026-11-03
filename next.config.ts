import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Set by the gateway so the app can live under /<name>; unset serves it at /.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  devIndicators: false,
};

export default nextConfig;
