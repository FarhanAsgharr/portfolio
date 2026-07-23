# Portfolio — Muhammad Farhan Asghar

A production portfolio site with a built-in admin panel. Dark by default, light supported, animated throughout. Content lives in a database and is edited from a password-protected editor at `/admin` — no code required, and it works from a phone once deployed.

```bash
npm install
npm run dev          # http://localhost:3000
```

It runs immediately with no configuration, showing the example content.

**👉 To make it yours, follow [SETUP.md](./SETUP.md).** It's written step by step and takes about ten minutes.

---

## How content works

Three layers, in priority order:

1. **Database** (`portfolio_content` table) — what the admin panel writes. Used whenever `DATABASE_URL` is set and reachable.
2. **`data/portfolio.ts`** — the content shipped in the repo. Used when there's no database, when the database is unreachable, and as the target of "Reset to example".
3. **`types/index.ts`** — the contract both are checked against, so a malformed edit is a compile error rather than a blank section.

`lib/content.ts` is the single read point. Every page and section goes through it and none of them knows which layer answered.

**If the database goes down, the site stays up** and falls back to the shipped content. Verified, not assumed.

### Uploads

Photos, the résumé and project covers are stored as rows in `portfolio_assets` and served from `/api/asset/<id>`.

Object storage (S3, Vercel Blob) would be the textbook answer, but each adds an account, a set of credentials and a second thing that can break — for a payload of one photo, one PDF and a few covers. Images are downscaled in the browser before upload and capped at 4 MB server-side. If this ever grows into a real media library, `lib/assets.ts` has the only two functions that would need to change.

---

## Admin panel

| | |
| --- | --- |
| **Address** | `/admin` |
| **Sign in** | `ADMIN_PASSWORD` from your environment |
| **Session** | Signed cookie, 7 days, HTTP-only |
| **Protection** | `proxy.ts` gates every `/admin` and `/api/admin` route; each API route re-checks the session itself |

Editing is against an in-memory draft written in one request, so a half-finished edit never reaches the live site. `⌘S` saves; closing the tab with unsaved changes prompts first.

Rotating `ADMIN_SECRET` signs out every session without changing the password.

---

## Architecture

```
app/
  (site)/       the public portfolio — its own layout with all the chrome
  admin/        the editor — deliberately shares nothing but fonts and theme
  api/
    admin/      login, logout, content read/write, upload
    asset/      public asset serving
    contact/    the contact form endpoint
sections/       the twelve page sections, one file each
components/
  admin/        editor shell, form primitives, one panel per tab
  ui/           Button, Card, Badge, Dialog, Reveal, Marquee…
  layout/       navbar, footer, scroll spine, theme toggle
  effects/      ambient background, cursor, preloader, R3F particle field
  providers/    content, theme, smooth scroll, motion
hooks/          media queries, scroll spy, counters, typewriter, magnetic
lib/            db, content, assets, auth, seo, icons, validation, utils
data/           portfolio.ts (example content), blog.ts
types/          the contract everything is checked against
```

The route-group split is the important part: `app/(site)/layout.tsx` owns the navbar, cursor, spine and smooth scrolling; `app/admin/layout.tsx` owns none of it. An admin panel with a custom cursor and hijacked scrolling would be actively worse to use.

### Rendering

Pages that read editable content are `force-dynamic`. Content lives in a database that changes without a redeploy, so a prerendered page would keep serving whatever was true when the site was last deployed — and "I saved it but the site didn't change" is a worse problem than a few milliseconds. The read is a single primary-key lookup, deduplicated per render by React's `cache()`. With no database configured it's a constant and touches nothing.

### Design system

Tokens live in `app/globals.css` under `@theme`. Tailwind v4 is CSS-first — there is no `tailwind.config.ts`. Semantic values sit on `:root` and are overridden under `.dark`, so light and dark are two designed themes rather than an inversion.

Three typefaces, three jobs: **Bricolage Grotesque** for display, **Inter Tight** for reading, **JetBrains Mono** for labels, metrics and node names.

The recurring device is the **spine** — the rail down the left edge with one named node per section. It's the scroll progress indicator, the section navigation and a diagram of the page at once. Section eyebrows (`~/skills`) name the same nodes. That's also why sections aren't numbered: they aren't a sequence, and numbering would imply an order that isn't there.

### Motion

Every reveal goes through `components/ui/reveal.tsx`, so the whole page shares one easing and one distance. `<MotionConfig reducedMotion="user">` makes Framer respect the OS setting globally, and `@media (prefers-reduced-motion: reduce)` collapses the decorative CSS. In that mode the preloader and cursor don't mount and Lenis is never instantiated — the page just scrolls.

The Three.js particle field is dynamically imported with `ssr: false` and rendered only for fine pointers with motion enabled, so it costs nothing on mobile.

---

## Environment

Copy `.env.example` to `.env.local`. Everything is optional; the site degrades honestly without each one.

| Variable | Without it |
| --- | --- |
| `DATABASE_URL` | Site shows example content; admin panel loads but can't save |
| `ADMIN_PASSWORD` | `/admin` shows setup instructions instead of a login |
| `ADMIN_SECRET` | Falls back to signing sessions with the password |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL` | Contact form validates and rate-limits but sends no mail |

---

## Verification

```bash
npx tsc --noEmit    # types
npx eslint .        # lint, including Next 16's React Compiler rules
npm run build       # production build
```

All three are clean. The admin flow has been tested end to end against a real Postgres: login, session forgery rejection, save, upload, image optimisation, reset, and database-outage fallback and recovery.

## Accessibility

Skip link, visible focus rings, real focus traps in the modal and palette (Radix), `aria-current` on active navigation, labelled fields with `aria-invalid` and `aria-describedby`, `role="meter"` on skill bars, and counters that announce their final value rather than every number in between.

## Security notes

- Admin sessions are HMAC-signed over an expiry; tampering with either half fails. Comparisons are constant-time.
- Login is throttled to 8 attempts per 15 minutes per IP; the contact form to 5 per hour.
- Asset ids are constrained to `[a-z0-9-]` so they can't traverse a path, and uploads are restricted by MIME type and size.
- Uploaded SVGs are served under `default-src 'none'; sandbox` so a scripted SVG can't execute in your origin.
- The login and contact rate limiters are in-memory and reset on serverless cold starts. Fine at this scale; move to Redis if you ever need them to hold hard.
