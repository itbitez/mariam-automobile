const isDev = process.env.NODE_ENV !== "production";

// The browser (admin panel) talks to Supabase directly for auth, table reads/writes
// and photo uploads, so its origin has to be allowed in connect-src and img-src.
function supabaseOrigin() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    console.warn("[next.config] NEXT_PUBLIC_SUPABASE_URL is not a valid URL:", raw);
    return null;
  }
}

const SUPABASE = supabaseOrigin();

const csp = [
  "default-src 'self'",
  // Next.js inline scripts (RSC payload) require 'unsafe-inline'. The dev server
  // additionally compiles every client chunk through eval() for HMR, so without
  // 'unsafe-eval' no client JS runs at all and every page renders blank.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  ["img-src 'self' data: blob: https://images.unsplash.com", SUPABASE].filter(Boolean).join(" "),
  "font-src 'self' data:",
  // 'self' plus the Supabase REST/auth/storage origin; ws: covers the dev HMR socket.
  ["connect-src 'self'", SUPABASE, isDev ? "ws: wss:" : null].filter(Boolean).join(" "),
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  // Would rewrite http://localhost subresource requests to https in dev.
  isDev ? null : "upgrade-insecure-requests",
]
  .filter(Boolean)
  .join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  // HSTS is meaningless (and undesirable) on the plain-http dev server.
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
  { key: "Content-Security-Policy", value: csp },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  images: {
    // AVIF first: roughly 25-30% smaller than WebP at the same quality, with
    // WebP as the fallback for browsers that do not accept it.
    formats: ["image/avif", "image/webp"],
    // The layout never renders anything above 1920, so drop the 2048/3840
    // variants that would otherwise be generated and preloaded.
    deviceSizes: [360, 480, 640, 828, 1080, 1280, 1600, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      ...(SUPABASE ? [{ protocol: "https", hostname: new URL(SUPABASE).hostname }] : []),
    ],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
    ];
  },
};

export default nextConfig;
