import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Every cover and the avatar is an SVG generated into `public/` by this
    // project — no remote or user-supplied SVG reaches the optimiser. The CSP
    // below neutralises scripting inside them regardless.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ["image/avif", "image/webp"],

    // Next refuses a local image source carrying a query string unless a
    // pattern here permits it. Omitting `search` means "any query string" —
    // it's compared by strict equality, not as a glob, so `search: "**"` would
    // only ever match a literal `?**`.
    //
    // Uploaded assets need this because older saved values may carry a `?v=`
    // cache-buster. Without it, the page rendering that image returns a 500.
    localPatterns: [{ pathname: "/api/asset/**" }, { pathname: "/images/**" }],
  },

  // Type errors should fail the build. This is the default; it's written out so
  // nobody "fixes" a red build by flipping it later without noticing what they
  // turned off.
  typescript: { ignoreBuildErrors: false },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
