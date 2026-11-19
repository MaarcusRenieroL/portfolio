import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/** Where site files and published media are served from (Cloudflare R2 custom domain). */
const assets = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_ASSETS_URL || "https://assets.maarcus.dev");
  } catch {
    return new URL("https://assets.maarcus.dev");
  }
})();

const turnstile = process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY ? " https://challenges.cloudflare.com" : "";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com${turnstile}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${assets.origin} https://images.dmca.com`,
  "font-src 'self' data:",
  `media-src 'self' ${assets.origin}`,
  // Uploads go browser → the private R2 bucket (signed URL); drafts' files are served from /media on this site.
  `connect-src 'self'${process.env.R2_ACCOUNT_ID ? ` https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : ""} https://vitals.vercel-insights.com https://va.vercel-scripts.com${isDev ? " ws: wss:" : ""}`,
  `object-src 'self' ${assets.origin}`,
  `frame-src 'self' ${assets.origin}${turnstile}`,
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]),
];

const nextConfig: NextConfig = {
  // Optional: serve the app under a sub-path (e.g. /portfolio). Unset serves it at /.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // `ANALYZE=1 pnpm build` emits browser source maps, for bundle analysis only.
  productionBrowserSourceMaps: process.env.ANALYZE === "1",
  // Dev only: lets a Cloudflare quick tunnel (cloudflared tunnel --url localhost:3000) load dev assets and hot reload.
  allowedDevOrigins: ["*.trycloudflare.com"],
  devIndicators: false,
  poweredByHeader: false,
  // Lets Next's optimizer resize images from the assets domain, like local ones.
  images: { remotePatterns: [{ protocol: "https", hostname: assets.hostname, pathname: "/**" }] },
  experimental: {
    optimizePackageImports: [
      "cmdk",
      "lucide-react",
      "motion/react",
      "@radix-ui/react-select",
      "@radix-ui/react-dialog",
      "@radix-ui/react-popover",
      "@radix-ui/react-tooltip",
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
