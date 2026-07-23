import { ImageResponse } from "next/og";

import { getContent } from "@/lib/content";

export const alt = "Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social card.
 *
 * Rendered at build time from the same profile data as the page, so the card
 * can never drift from the site. Uses system-safe layout only — `next/og`
 * supports a subset of CSS, and anything exotic fails at render rather than
 * degrading.
 */
/**
 * Rendered per request: it reads content the admin panel can change (the site
 * address), so prerendering it would freeze whatever was true at deploy time.
 */
export const dynamic = "force-dynamic";

export default async function OpenGraphImage() {
  const { profile, stats } = await getContent();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#050816",
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 20% 0%, rgba(124,58,237,0.45), transparent 60%), radial-gradient(ellipse 60% 60% at 95% 100%, rgba(6,182,212,0.32), transparent 60%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top rule + availability */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            {profile.shortName}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 18px",
              borderRadius: 999,
              border: "1px solid rgba(245,158,11,0.4)",
              background: "rgba(245,158,11,0.12)",
              color: "#fcd34d",
              fontSize: 18,
              letterSpacing: 1,
            }}
          >
            <div
              style={{ width: 8, height: 8, borderRadius: 999, background: "#f59e0b" }}
            />
            {profile.availability.label.toUpperCase()}
          </div>
        </div>

        {/* Claim */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 84,
              lineHeight: 1,
              fontWeight: 700,
              letterSpacing: -3,
              color: "white",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Systems that think,</span>
            <span style={{ color: "#a78bfa" }}>ship, and hold up.</span>
          </div>

          <div
            style={{
              marginTop: 28,
              fontSize: 28,
              color: "#94a3b8",
              display: "flex",
              gap: 14,
            }}
          >
            <span style={{ color: "white" }}>{profile.name}</span>
            <span style={{ color: "#475569" }}>/</span>
            <span>{profile.role}</span>
          </div>
        </div>

        {/* Numbers */}
        <div
          style={{
            display: "flex",
            gap: 56,
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: 28,
          }}
        >
          {stats.slice(0, 3).map((stat) => (
            <div key={stat.label} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 40, color: "white", fontWeight: 600 }}>
                {stat.value}
                <span style={{ color: "#7c3aed" }}>{stat.suffix}</span>
              </span>
              <span style={{ fontSize: 18, color: "#64748b", letterSpacing: 1.5 }}>
                {stat.label.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
