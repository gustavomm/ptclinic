# Vyta Site Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild vytafisioterapia.com.br from a single landing page into a 19-route, SEO-optimised site on Next 15 App Router, matching the Claude Design comp, without breaking the Google Ads conversion event.

**Architecture:** Migrate `pages/` → `app/` incrementally on the `redesign-2026` branch. All routes statically generated. A single NAP source (`content/clinic.ts`, `content/units.ts`) feeds the footer, the unit pages and the JSON-LD, so contact data cannot drift. Every WhatsApp CTA goes through one `WhatsAppLink` component that emits the GTM class and calls a tracking stub. Motion is CSS-only.

**Tech Stack:** Next 15 (App Router, RSC), React 19, TypeScript, Tailwind 3.4, `next/font`, `next-mdx-remote/rsc` + `gray-matter`, `iconoir-react`, shadcn/ui (`Sheet`, `Accordion` only), Vitest + Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-08-07-vyta-landing-redesign-design.md`

## Execution Order

**Tasks are numbered by topic, not by execution order.** Run them in this sequence:

```
1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13 → 17 → 14 → 15 → 16 → 18 → 19 → 20 → 21 → 22
```

Task 17 (MDX pipeline) must precede Task 14 (speciality pages), because Task 14 imports `getPostMeta` from `lib/blog.ts`.

## Global Constraints

Every task's requirements implicitly include this section.

- **`/whatsapp` must keep its exact URL and redirect behaviour.** It is the Google Ads `Lead WhatsApp` conversion event (page load). R$55,50/day depends on it.
- **The GTM classes must survive:** `.redirect-whatsapp`, `.redirect-phone`, `.redirect-email`, `.redirect-instagram`.
- **Every old URL 301s.** No route may 404. See Task 3 for the full map.
- **All user-facing copy is Portuguese (pt-BR).** `<html lang="pt-BR">`.
- **No hex colours in components.** Semantic Tailwind tokens only.
- **`subtle` is `#746E64`, not the comp's `#8a8378`** — the comp value fails WCAG AA at 3.48:1.
- **Body text floor 16px. Tap targets ≥44px. `prefers-reduced-motion` honoured on every animation.**
- **No GSAP, no Lottie, no `framer-motion`.** CSS + IntersectionObserver only.
- **Clinical copy is draft.** Never invent a clinical claim or a named author byline. Where the spec's §12 leaves authorship open, use the provisional co-signature and leave a comment.
- **Do not deploy to production.** Gustavo triggers that.

**Contact constants** (single source, never inline these):
`+5511989172311` · `contato@vytafisioterapia.com.br` · `https://instagram.com/vytafisioterapia` · WhatsApp deep link `https://wa.me/message/FJNBBFEBI6V5O1`

---

## File Structure

| Path | Responsibility |
|---|---|
| `app/layout.tsx` | html/body, fonts, GTM, Nav, Footer, WhatsApp FAB |
| `app/page.tsx` | Landing — composes section components |
| `app/whatsapp/route.ts` | Conversion redirect |
| `app/especialidades/[slug]/page.tsx` | 7 speciality pages |
| `app/unidades/[slug]/page.tsx` | 2 unit pages |
| `app/pilates/page.tsx` | Pilates |
| `app/blog/page.tsx`, `app/blog/[slug]/page.tsx` | Blog |
| `app/sitemap.ts`, `app/robots.ts` | Generated from route data |
| `content/clinic.ts` | NAP + social. Single source of truth |
| `content/units.ts` | Both units: address, geo, hours, images |
| `content/team.ts` | Vyvyan + Tainá, credentials |
| `content/specialities.ts` | 7 specialities, expanded copy |
| `content/blog/*.mdx` | 6 posts |
| `lib/schema.ts` | JSON-LD builders. Pure functions |
| `lib/seo.ts` | Metadata builders. Pure functions |
| `lib/blog.ts` | MDX loading, frontmatter, sorting |
| `components/WhatsAppLink.tsx` | The only WhatsApp CTA in the codebase |
| `components/ui/*` | Button Card Eyebrow SectionHeading Reveal Prose |
| `components/layout/*` | Nav MobileMenu Footer TopBar |
| `components/sections/*` | 11 landing/page sections |
| `e2e/*.spec.ts` | Playwright conversion + redirect guards |

**Dependency removal is deferred to the task that kills the last consumer.** `daisyui`, `swiper`, `react-slick`, `@types/react-slick`, `tailwind-gradient-mask-image` stay installed until Task 15 removes the legacy `pages/speciality/[slug].tsx`. `nextjs-redirect` dies in Task 3.

---

## Task 1: Test infrastructure

**Files:**
- Create: `vitest.config.ts`, `vitest.setup.ts`, `playwright.config.ts`, `lib/__tests__/smoke.test.ts`
- Modify: `package.json`, `.gitignore`

**Interfaces:**
- Consumes: nothing
- Produces: `npm test` (Vitest, unit), `npm run test:e2e` (Playwright against a production build). All later tasks rely on these two scripts.

- [ ] **Step 1: Install dev dependencies**

```bash
npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test
npx playwright install chromium
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    exclude: ["**/node_modules/**", "**/e2e/**"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 3: Create `vitest.setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Create `playwright.config.ts`**

`webServer` builds and starts the real production server, because redirects defined in `next.config.js` do not apply in dev-only contexts and we must test what ships.

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: { baseURL: "http://localhost:3000", trace: "on-first-retry" },
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
```

- [ ] **Step 5: Add scripts to `package.json`**

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test",
  "typecheck": "tsc --noEmit"
}
```

- [ ] **Step 6: Write a smoke test that fails**

`lib/__tests__/smoke.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { formatPhone } from "../format";

describe("formatPhone", () => {
  it("formats an E.164 Brazilian mobile for display", () => {
    expect(formatPhone("+5511989172311")).toBe("(11) 98917-2311");
  });
});
```

- [ ] **Step 7: Run it and confirm it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `../format`.

- [ ] **Step 8: Create `lib/format.ts`**

```ts
/** Formats an E.164 Brazilian mobile (+55DDNNNNNNNNN) for display. */
export function formatPhone(e164: string): string {
  const digits = e164.replace(/\D/g, "");
  const national = digits.startsWith("55") ? digits.slice(2) : digits;
  const ddd = national.slice(0, 2);
  const rest = national.slice(2);
  const head = rest.length === 9 ? rest.slice(0, 5) : rest.slice(0, 4);
  const tail = rest.slice(head.length);
  return `(${ddd}) ${head}-${tail}`;
}
```

- [ ] **Step 9: Run tests, confirm pass**

Run: `npm test`
Expected: PASS, 1 test.

- [ ] **Step 10: Add Playwright artifacts to `.gitignore`**

```
/test-results/
/playwright-report/
/playwright/.cache/
```

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "test: add Vitest and Playwright infrastructure"
```

---

## Task 2: Next 15 upgrade and App Router skeleton

**Files:**
- Create: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Delete: `pages/index.tsx`, `pages/_app.tsx`, `pages/_document.tsx`, `pages/api/hello.ts`, `styles/globals.css`
- Modify: `package.json`, `tsconfig.json`, `next.config.js`

**Interfaces:**
- Consumes: nothing
- Produces: a working App Router root layout carrying GTM and Vercel Analytics. Later tasks add sections into `app/page.tsx`.

`pages/whatsapp.tsx` and `pages/speciality/[slug].tsx` stay for now — Tasks 3 and 15 replace them. App Router and Pages Router coexist legally as long as no path collides.

- [ ] **Step 1: Upgrade Next and React**

```bash
npm i next@15 react@19 react-dom@19
npm i -D @types/react@19 @types/react-dom@19
npm i @next/third-parties
```

- [ ] **Step 2: Move the stylesheet**

```bash
git mv styles/globals.css app/globals.css
```

Then strip the carousel rules — `.slick-*` and `.swiper-*` selectors are dead once Task 11 replaces the carousels, and nothing in `app/` uses them. Leave only:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html { scroll-behavior: smooth; }
  section { scroll-margin-top: 5rem; }
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 3: Create `app/layout.tsx`**

`GoogleTagManager` from `@next/third-parties` replaces the four hand-written `<Script>` blocks in the old `_app.tsx`. It injects both the script and the `<noscript>` iframe, so the manual iframe in the old `index.tsx` is no longer needed.

```tsx
import type { Metadata } from "next";
import { GoogleTagManager } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vyta Fisioterapia e Pilates",
  description:
    "Fisioterapia e Pilates com atendimento individual, em duas unidades em São Paulo.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <GoogleTagManager gtmId="GTM-NNBD3887" />
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

The two `gtag` GA4 properties (`G-VSSZW88J6E`, `G-V5YCCVYQRR`) from the old `_app.tsx` are **intentionally dropped here** — `docs/google-ads-estado-2026-08-06.md` flags "Duas GA4 ativas: decidir qual é a fonte de verdade" as an open decision, and both should be configured inside GTM rather than hard-coded. Note this in the commit message so it is not silently lost.

- [ ] **Step 4: Create a placeholder `app/page.tsx`**

```tsx
export default function Home() {
  return <main />;
}
```

- [ ] **Step 5: Delete the superseded Pages Router files**

```bash
git rm pages/index.tsx pages/_app.tsx pages/_document.tsx pages/api/hello.ts
git rm components/Hero.tsx components/SpecialitiesCarousel.tsx components/PilatesCarousel.tsx
```

`components/Navbar.tsx`, `components/StaffProfile.tsx`, `components/SpecialityCard.tsx`, `components/DropdownMenu.tsx` and `components/icons/*` stay until Task 15 — `pages/speciality/[slug].tsx` still imports Navbar.

- [ ] **Step 6: Verify the build**

Run: `npm run typecheck && npm run build`
Expected: build succeeds. `/` and `/speciality/<slug>` and `/whatsapp` all present in the route list.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: migrate to Next 15 App Router

GTM moves to @next/third-parties. The two hard-coded GA4 properties
(G-VSSZW88J6E, G-V5YCCVYQRR) are deliberately NOT carried over — the Ads
audit flags the duplicate-GA4 question as undecided, and both belong
inside GTM rather than in application code.
EOF
)"
```

---

## Task 3: Conversion route and redirect map — the critical guard

This task exists early and on its own because it protects the spec's highest-severity risk. Everything after it is guarded by these tests.

**Files:**
- Create: `app/whatsapp/route.ts`, `e2e/conversion.spec.ts`, `e2e/redirects.spec.ts`
- Delete: `pages/whatsapp.tsx`
- Modify: `next.config.js`, `package.json`

**Interfaces:**
- Consumes: nothing
- Produces: `/whatsapp` as a 307 redirect route; the full 301 map in `next.config.js`. Task 8's `WhatsAppLink` targets `/whatsapp`.

- [ ] **Step 1: Write the failing E2E conversion test**

`e2e/conversion.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

const WHATSAPP_DEEPLINK = "https://wa.me/message/FJNBBFEBI6V5O1";

test.describe("Google Ads conversion route", () => {
  test("/whatsapp redirects to the WhatsApp deep link", async ({ request }) => {
    const res = await request.get("/whatsapp", { maxRedirects: 0 });
    expect([301, 302, 307, 308]).toContain(res.status());
    expect(res.headers()["location"]).toBe(WHATSAPP_DEEPLINK);
  });

  test("/whatsapp is reachable and not a 404", async ({ request }) => {
    const res = await request.get("/whatsapp", { maxRedirects: 0 });
    expect(res.status()).not.toBe(404);
  });
});
```

- [ ] **Step 2: Write the failing E2E redirect test**

`e2e/redirects.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

const MAP: Array<[string, string]> = [
  ["/speciality/neurofuncional", "/especialidades/fisioterapia-neurologica"],
  ["/speciality/oncologica", "/especialidades/fisioterapia-oncologica"],
  ["/speciality/ortopedica", "/especialidades/fisioterapia-ortopedica"],
  ["/speciality/gerontologia", "/especialidades/fisioterapia-para-idosos"],
  ["/speciality/respiratoria", "/especialidades/fisioterapia-respiratoria"],
  [
    "/speciality/condicionamento-fisico",
    "/especialidades/fisioterapia-pre-e-pos-cirurgica",
  ],
  ["/speciality/drenagem-linfatica", "/especialidades/drenagem-linfatica"],
  ["/speciality/pilates", "/pilates"],
];

test.describe("legacy URL redirects", () => {
  for (const [from, to] of MAP) {
    test(`${from} 301s to ${to}`, async ({ request }) => {
      const res = await request.get(from, { maxRedirects: 0 });
      expect(res.status()).toBe(308);
      expect(res.headers()["location"]).toBe(to);
    });
  }
});
```

Next emits **308** for `permanent: true`, not 301. Both are permanent redirects and Google treats them equivalently; the test asserts what Next actually does.

- [ ] **Step 3: Run the E2E suite and confirm both fail**

Run: `npm run test:e2e`
Expected: redirect tests FAIL (404 or no location header). The conversion test may pass via the legacy `pages/whatsapp.tsx` — that is fine, it must keep passing after Step 5.

- [ ] **Step 4: Create `app/whatsapp/route.ts`**

```ts
import { redirect } from "next/navigation";

export const dynamic = "force-static";

const WHATSAPP_DEEPLINK = "https://wa.me/message/FJNBBFEBI6V5O1";

export function GET() {
  redirect(WHATSAPP_DEEPLINK);
}
```

- [ ] **Step 5: Delete the legacy page and its dependency**

```bash
git rm pages/whatsapp.tsx
npm uninstall nextjs-redirect
```

- [ ] **Step 6: Add the redirect map to `next.config.js`**

```js
/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: { formats: ["image/avif", "image/webp"] },
  async redirects() {
    return [
      ["/speciality/neurofuncional", "/especialidades/fisioterapia-neurologica"],
      ["/speciality/oncologica", "/especialidades/fisioterapia-oncologica"],
      ["/speciality/ortopedica", "/especialidades/fisioterapia-ortopedica"],
      ["/speciality/gerontologia", "/especialidades/fisioterapia-para-idosos"],
      ["/speciality/respiratoria", "/especialidades/fisioterapia-respiratoria"],
      [
        "/speciality/condicionamento-fisico",
        "/especialidades/fisioterapia-pre-e-pos-cirurgica",
      ],
      ["/speciality/drenagem-linfatica", "/especialidades/drenagem-linfatica"],
      ["/speciality/pilates", "/pilates"],
    ].map(([source, destination]) => ({ source, destination, permanent: true }));
  },
};
```

- [ ] **Step 7: Temporarily stub the destination routes so redirects resolve**

Redirect targets do not exist yet. Create minimal stubs so the E2E suite can assert the redirect without a 404 at the destination. These are replaced in Tasks 14–16.

`app/especialidades/[slug]/page.tsx`:

```tsx
export function generateStaticParams() {
  return [
    "fisioterapia-neurologica",
    "fisioterapia-oncologica",
    "fisioterapia-ortopedica",
    "fisioterapia-para-idosos",
    "fisioterapia-respiratoria",
    "fisioterapia-pre-e-pos-cirurgica",
    "drenagem-linfatica",
  ].map((slug) => ({ slug }));
}

export default function SpecialityPage() {
  return <main />;
}
```

`app/pilates/page.tsx`:

```tsx
export default function PilatesPage() {
  return <main />;
}
```

- [ ] **Step 8: Run the E2E suite, confirm all pass**

Run: `npm run test:e2e`
Expected: PASS — 2 conversion tests, 8 redirect tests.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: move /whatsapp to App Router and add legacy 308 redirect map

E2E guards the Ads conversion route and all eight legacy URLs."
```

---

## Task 4: Design tokens, fonts and Tailwind config

**Files:**
- Modify: `tailwind.config.js`, `app/layout.tsx`, `app/globals.css`
- Create: `lib/fonts.ts`

**Interfaces:**
- Consumes: nothing
- Produces: Tailwind tokens `surface surface-alt line ink ink-deep accent accent-deep accent-warm muted subtle`; font CSS variables `--font-display` (Cormorant Garamond) and `--font-sans` (Jost); the `font-display` / `font-sans` Tailwind families; fluid type utilities `text-display-xl|lg|md`.

- [ ] **Step 1: Create `lib/fonts.ts`**

```ts
import { Cormorant_Garamond, Jost } from "next/font/google";

export const display = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const sans = Jost({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500"],
  variable: "--font-sans",
  display: "swap",
});
```

- [ ] **Step 2: Wire fonts into `app/layout.tsx`**

Replace the `<html>` opening tag:

```tsx
<html lang="pt-BR" className={`${display.variable} ${sans.variable}`}>
```

and add `import { display, sans } from "@/lib/fonts";`. Give `<body>` the base classes:

```tsx
<body className="bg-surface text-ink font-sans font-light antialiased">
```

- [ ] **Step 3: Rewrite `tailwind.config.js`**

daisyUI stays in `plugins` for now — `pages/speciality/[slug].tsx` still uses `btn` classes until Task 15.

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./content/**/*.{md,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        surface: "#FAF6F0",
        "surface-alt": "#F3EDE4",
        line: "#E3DCD2",
        ink: "#2C3A3D",
        "ink-deep": "#1A2224",
        accent: "#3a7883",
        "accent-deep": "#a8543c",
        "accent-warm": "#db7f66",
        muted: "#5d6664",
        // NOT the comp's #8a8378 — that is 3.48:1 on surface and fails WCAG AA.
        subtle: "#746E64",
      },
      fontSize: {
        "display-xl": ["clamp(2.5rem, 1.5rem + 4.5vw, 5.25rem)", { lineHeight: "1.02", fontWeight: "300" }],
        "display-lg": ["clamp(2rem, 1.3rem + 3.2vw, 3.75rem)", { lineHeight: "1.05", fontWeight: "300" }],
        "display-md": ["clamp(1.75rem, 1.3rem + 1.8vw, 2.75rem)", { lineHeight: "1.15", fontWeight: "300" }],
        "display-sm": ["clamp(1.375rem, 1.15rem + 1vw, 2rem)", { lineHeight: "1.15", fontWeight: "400" }],
      },
      letterSpacing: { eyebrow: "0.28em", brand: "0.32em", hero: "0.46em" },
      maxWidth: { shell: "80rem" },
    },
  },
  plugins: [require("daisyui")],
  daisyui: { themes: [{ mytheme: { primary: "#3a7883", secondary: "#db7f66", accent: "#94999c", neutral: "#2C3A3D", "base-100": "#FAF6F0" } }] },
};
```

- [ ] **Step 4: Write a contrast regression test**

This encodes *why* `subtle` deviates from the comp, so nobody "fixes" it back.

`lib/__tests__/contrast.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { contrastRatio } from "../contrast";

describe("palette contrast", () => {
  it("subtle text on surface meets WCAG AA for normal text", () => {
    expect(contrastRatio("#746E64", "#FAF6F0")).toBeGreaterThanOrEqual(4.5);
  });

  it("documents that the original comp value failed", () => {
    expect(contrastRatio("#8a8378", "#FAF6F0")).toBeLessThan(4.5);
  });

  it("muted text on surface meets WCAG AA", () => {
    expect(contrastRatio("#5d6664", "#FAF6F0")).toBeGreaterThanOrEqual(4.5);
  });
});
```

- [ ] **Step 5: Run it, confirm it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `../contrast`.

- [ ] **Step 6: Create `lib/contrast.ts`**

```ts
function channel(v: number): number {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG 2.1 contrast ratio between two hex colours. Range 1–21. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}
```

- [ ] **Step 7: Run tests and build**

Run: `npm test && npm run build`
Expected: PASS, 4 tests. Build succeeds.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add design tokens, self-hosted fonts and fluid type scale"
```

---

## Task 5: Content layer — the NAP single source of truth

**Files:**
- Create: `content/clinic.ts`, `content/units.ts`, `content/team.ts`, `content/__tests__/content.test.ts`

**Interfaces:**
- Consumes: `formatPhone` from `lib/format.ts`
- Produces:
  - `clinic: Clinic` — `{ name, legalName, phoneE164, phoneDisplay, email, instagram, whatsappUrl, siteUrl }`
  - `units: Unit[]` — `{ slug, name, shortName, street, district, city, state, postalCode, geo: {lat,lng}, mapsUrl, mapEmbedUrl, image, openingHours: OpeningHours[] | null }`
  - `team: Member[]` — `{ slug, name, role, crefito, bio, image, education[] }`
  - `getUnit(slug)`, `getMember(slug)`

`openingHours` is `null` until the clinic supplies real hours (spec §12 item 4). Task 6's schema builder must omit `openingHoursSpecification` when it is null rather than inventing times.

- [ ] **Step 1: Write the failing tests**

`content/__tests__/content.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { clinic } from "../clinic";
import { units, getUnit } from "../units";
import { team } from "../team";

describe("clinic", () => {
  it("exposes a display phone derived from the E.164 number", () => {
    expect(clinic.phoneE164).toBe("+5511989172311");
    expect(clinic.phoneDisplay).toBe("(11) 98917-2311");
  });

  it("has an absolute site URL with no trailing slash", () => {
    expect(clinic.siteUrl).toBe("https://www.vytafisioterapia.com.br");
  });
});

describe("units", () => {
  it("has exactly two units", () => {
    expect(units).toHaveLength(2);
  });

  it("looks up a unit by slug", () => {
    expect(getUnit("consolacao")?.district).toBe("Consolação");
    expect(getUnit("pinheiros")?.district).toBe("Pinheiros");
  });

  it("carries real coordinates for both units", () => {
    for (const u of units) {
      expect(u.geo.lat).toBeLessThan(-23);
      expect(u.geo.lng).toBeLessThan(-46);
    }
  });

  it("leaves opening hours null until the clinic supplies them", () => {
    for (const u of units) expect(u.openingHours).toBeNull();
  });
});

describe("team", () => {
  it("has two members, each with a CREFITO", () => {
    expect(team).toHaveLength(2);
    for (const m of team) expect(m.crefito).toMatch(/^Crefito 3: \d+F$/);
  });
});
```

- [ ] **Step 2: Run, confirm fail**

Run: `npm test`
Expected: FAIL — modules not found.

- [ ] **Step 3: Create `content/clinic.ts`**

```ts
import { formatPhone } from "@/lib/format";

const PHONE_E164 = "+5511989172311";

export const clinic = {
  name: "Vyta Fisioterapia e Pilates",
  legalName: "Vyta Fisioterapia",
  tagline: "Fisioterapia & Pilates",
  phoneE164: PHONE_E164,
  phoneDisplay: formatPhone(PHONE_E164),
  email: "contato@vytafisioterapia.com.br",
  instagram: "https://instagram.com/vytafisioterapia",
  instagramHandle: "@vytafisioterapia",
  /** Deep link used by the /whatsapp redirect. Never link to it directly — use WhatsAppLink. */
  whatsappUrl: "https://wa.me/message/FJNBBFEBI6V5O1",
  siteUrl: "https://www.vytafisioterapia.com.br",
} as const;

export type Clinic = typeof clinic;
```

- [ ] **Step 4: Create `content/units.ts`**

```ts
export type OpeningHours = {
  days: string[];
  opens: string;
  closes: string;
};

export type Unit = {
  slug: string;
  name: string;
  shortName: string;
  street: string;
  district: string;
  city: string;
  state: string;
  postalCode: string;
  geo: { lat: number; lng: number };
  mapsUrl: string;
  mapEmbedUrl: string;
  image: string;
  /** null until the clinic supplies real hours — see spec §12 item 4. */
  openingHours: OpeningHours[] | null;
};

export const units: Unit[] = [
  {
    slug: "consolacao",
    name: "Unidade Consolação",
    shortName: "Consolação",
    street: "Rua Frei Caneca, 1212 — Conjunto 53",
    district: "Consolação",
    city: "São Paulo",
    state: "SP",
    postalCode: "01307-002",
    geo: { lat: -23.559993, lng: -46.66116 },
    mapsUrl: "https://maps.google.com/?q=Vyta+Fisioterapia+Frei+Caneca+1212",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d427.96519633859407!2d-46.66115957244263!3d-23.559992771406215!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce592d449e10dd%3A0x9fb98fcb63eab6f4!2sVyta%20Fisioterapia!5e0!3m2!1sen!2sbr!4v1678887676221!5m2!1sen!2sbr",
    image: "/sala2.jpg",
    openingHours: null,
  },
  {
    slug: "pinheiros",
    name: "Unidade Fradique",
    shortName: "Pinheiros",
    street: "Rua Fradique Coutinho, 380",
    district: "Pinheiros",
    city: "São Paulo",
    state: "SP",
    postalCode: "05416-000",
    geo: { lat: -23.563253, lng: -46.688716 },
    mapsUrl:
      "https://maps.google.com/?q=Vyta+Fisioterapia+Fradique+Coutinho+380",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1445059856637!2d-46.688715823961424!3d-23.563252978798484!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce57c57e3ccf37%3A0xec2878cdd908125f!2sVyta%20Fisioterapia%20e%20Pilates%20-%20Unidade%20Fradique!5e0!3m2!1sen!2sbr!4v1756327748591!5m2!1sen!2sbr",
    image: "/sala4.jpg",
    openingHours: null,
  },
];

export function getUnit(slug: string): Unit | undefined {
  return units.find((u) => u.slug === slug);
}
```

**Verify the postal codes before committing.** They are inferred from the street addresses, not read from a source. If unverifiable, set them to `""` and have `lib/schema.ts` omit `postalCode` — a wrong postal code in `LocalBusiness` schema is worse than an absent one.

- [ ] **Step 5: Create `content/team.ts`**

```ts
export type Member = {
  slug: string;
  name: string;
  role: string;
  crefito: string;
  bio: string;
  image: string;
  education: string[];
};

export const team: Member[] = [
  {
    slug: "vyvyan-maximo-andrade",
    name: "Vyvyan Maximo Andrade",
    role: "Neurofuncional",
    crefito: "Crefito 3: 293919F",
    bio: "Trabalha com quem precisa reaprender um movimento — depois de um AVC, de uma cirurgia de coluna, de um diagnóstico que mudou o passo.",
    image: "/vyvyan-3.webp",
    education: [
      "Graduada em Fisioterapia pela Universidade de São Paulo (USP)",
      "Residência em Neurologia e Neurocirurgia pelo Hospital São Paulo (Unifesp)",
    ],
  },
  {
    slug: "taina-horacio-peixoto",
    name: "Tainá Horacio Peixoto",
    role: "Oncológica",
    crefito: "Crefito 3: 293916F",
    bio: "Acompanha pacientes durante e depois do tratamento oncológico, quando o corpo cobra o preço da cura.",
    image: "/taina-3.webp",
    education: [
      "Graduada em Fisioterapia pela Universidade de São Paulo (USP)",
      // Verbatim from the live site. Do not "correct" the institution name —
      // it is a credential claim about a real person; only the clinic changes it.
      "Residência em Oncologia pelo Hospital AC Camargo Cancer Center",
    ],
  },
];

export function getMember(slug: string): Member | undefined {
  return team.find((m) => m.slug === slug);
}
```

- [ ] **Step 6: Run tests, confirm pass**

Run: `npm test`
Expected: PASS, 10 tests.

- [ ] **Step 7: Remove the dead team asset**

```bash
git rm public/rita.jpeg
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add clinic, units and team content as single source of NAP truth"
```

---

## Task 6: JSON-LD schema builders

**Files:**
- Create: `lib/schema.ts`, `lib/__tests__/schema.test.ts`, `components/JsonLd.tsx`

**Interfaces:**
- Consumes: `clinic`, `units`, `team`
- Produces: `organizationSchema()`, `websiteSchema()`, `unitSchema(unit)`, `personSchema(member)`, `breadcrumbSchema(items)`, `faqSchema(items)`, `articleSchema(post)`, `medicalWebPageSchema(args)` — all returning plain JSON-LD objects. `<JsonLd data={…} />` renders one.

- [ ] **Step 1: Write the failing tests**

`lib/__tests__/schema.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  organizationSchema,
  unitSchema,
  breadcrumbSchema,
  faqSchema,
  personSchema,
} from "../schema";
import { units } from "@/content/units";
import { team } from "@/content/team";
import { clinic } from "@/content/clinic";

describe("organizationSchema", () => {
  it("is a MedicalBusiness with the clinic phone and Instagram", () => {
    const s = organizationSchema();
    expect(s["@type"]).toBe("Physiotherapy");
    expect(s.telephone).toBe(clinic.phoneE164);
    expect(s.sameAs).toContain(clinic.instagram);
  });
});

describe("unitSchema", () => {
  it("carries a PostalAddress and GeoCoordinates", () => {
    const s = unitSchema(units[0]);
    expect(s.address["@type"]).toBe("PostalAddress");
    expect(s.address.addressLocality).toBe("São Paulo");
    expect(s.geo.latitude).toBeCloseTo(-23.559993, 5);
  });

  it("omits openingHoursSpecification when hours are unknown", () => {
    const s = unitSchema(units[0]);
    expect(s).not.toHaveProperty("openingHoursSpecification");
  });

  it("includes openingHoursSpecification when hours exist", () => {
    const withHours = {
      ...units[0],
      openingHours: [{ days: ["Monday"], opens: "07:00", closes: "20:00" }],
    };
    const s = unitSchema(withHours);
    expect(s.openingHoursSpecification).toHaveLength(1);
    expect(s.openingHoursSpecification[0].opens).toBe("07:00");
  });
});

describe("personSchema", () => {
  it("exposes CREFITO as an occupational credential", () => {
    const s = personSchema(team[0]);
    expect(s["@type"]).toBe("Person");
    expect(s.hasCredential.credentialCategory).toBe("Crefito 3: 293919F");
  });
});

describe("breadcrumbSchema", () => {
  it("numbers positions from 1 and absolutises URLs", () => {
    const s = breadcrumbSchema([
      { name: "Início", path: "/" },
      { name: "Pilates", path: "/pilates" },
    ]);
    expect(s.itemListElement[0].position).toBe(1);
    expect(s.itemListElement[1].item).toBe(`${clinic.siteUrl}/pilates`);
  });
});

describe("faqSchema", () => {
  it("builds Question/Answer pairs", () => {
    const s = faqSchema([{ question: "O que é?", answer: "Isto." }]);
    expect(s["@type"]).toBe("FAQPage");
    expect(s.mainEntity[0].acceptedAnswer.text).toBe("Isto.");
  });
});
```

- [ ] **Step 2: Run, confirm fail**

Run: `npm test`
Expected: FAIL — `../schema` not found.

- [ ] **Step 3: Create `lib/schema.ts`**

```ts
import { clinic } from "@/content/clinic";
import { units, type Unit } from "@/content/units";
import { team, type Member } from "@/content/team";

const abs = (path: string) =>
  path.startsWith("http") ? path : `${clinic.siteUrl}${path}`;

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Physiotherapy",
    "@id": `${clinic.siteUrl}/#organization`,
    name: clinic.name,
    url: clinic.siteUrl,
    telephone: clinic.phoneE164,
    email: clinic.email,
    sameAs: [clinic.instagram],
    medicalSpecialty: "PhysicalTherapy",
    location: units.map((u) => ({ "@id": `${clinic.siteUrl}/unidades/${u.slug}#unit` })),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${clinic.siteUrl}/#website`,
    url: clinic.siteUrl,
    name: clinic.name,
    inLanguage: "pt-BR",
    publisher: { "@id": `${clinic.siteUrl}/#organization` },
  };
}

export function unitSchema(unit: Unit) {
  const address: Record<string, string> = {
    "@type": "PostalAddress",
    streetAddress: unit.street,
    addressLocality: unit.city,
    addressRegion: unit.state,
    addressCountry: "BR",
  };
  if (unit.postalCode) address.postalCode = unit.postalCode;

  const base = {
    "@context": "https://schema.org",
    "@type": "Physiotherapy",
    "@id": `${clinic.siteUrl}/unidades/${unit.slug}#unit`,
    name: `${clinic.name} — ${unit.shortName}`,
    url: abs(`/unidades/${unit.slug}`),
    telephone: clinic.phoneE164,
    email: clinic.email,
    image: abs(unit.image),
    address,
    geo: {
      "@type": "GeoCoordinates",
      latitude: unit.geo.lat,
      longitude: unit.geo.lng,
    },
    hasMap: unit.mapsUrl,
    parentOrganization: { "@id": `${clinic.siteUrl}/#organization` },
  };

  // Omitted rather than invented when hours are unknown — spec §12 item 4.
  if (!unit.openingHours) return base;

  return {
    ...base,
    openingHoursSpecification: unit.openingHours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
  };
}

export function personSchema(member: Member) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${clinic.siteUrl}/#${member.slug}`,
    name: member.name,
    jobTitle: "Fisioterapeuta",
    description: member.bio,
    image: abs(member.image),
    alumniOf: member.education.map((e) => ({
      "@type": "EducationalOrganization",
      name: e,
    })),
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: member.crefito,
    },
    worksFor: { "@id": `${clinic.siteUrl}/#organization` },
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}

export function faqSchema(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function medicalWebPageSchema(args: {
  title: string;
  description: string;
  path: string;
  condition: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: args.title,
    description: args.description,
    url: abs(args.path),
    inLanguage: "pt-BR",
    about: { "@type": "MedicalCondition", name: args.condition },
    publisher: { "@id": `${clinic.siteUrl}/#organization` },
  };
}

export function articleSchema(post: {
  title: string;
  description: string;
  slug: string;
  date: string;
  image: string;
  authorSlugs: string[];
}) {
  const authors = post.authorSlugs
    .map((s) => team.find((m) => m.slug === s))
    .filter((m): m is Member => Boolean(m));

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    url: abs(`/blog/${post.slug}`),
    image: abs(post.image),
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: "pt-BR",
    author: authors.map((a) => ({ "@id": `${clinic.siteUrl}/#${a.slug}` })),
    publisher: { "@id": `${clinic.siteUrl}/#organization` },
  };
}
```

- [ ] **Step 4: Create `components/JsonLd.tsx`**

```tsx
export function JsonLd({ data }: { data: object | object[] }) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <>
      {payload.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
```

- [ ] **Step 5: Run tests, confirm pass**

Run: `npm test`
Expected: PASS, 18 tests.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add typed JSON-LD builders driven by the NAP source"
```

---

## Task 7: SEO metadata builders

**Files:**
- Create: `lib/seo.ts`, `lib/__tests__/seo.test.ts`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `clinic`
- Produces: `buildMetadata({ title, description, path, image?, type? }): Metadata` and `SITE_TITLE_TEMPLATE`. Every route's `generateMetadata` calls `buildMetadata`.

- [ ] **Step 1: Write the failing tests**

`lib/__tests__/seo.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildMetadata } from "../seo";
import { clinic } from "@/content/clinic";

describe("buildMetadata", () => {
  it("sets an absolute canonical from the path", () => {
    const m = buildMetadata({
      title: "Pilates",
      description: "d",
      path: "/pilates",
    });
    expect(m.alternates?.canonical).toBe(`${clinic.siteUrl}/pilates`);
  });

  it("mirrors title and description into OpenGraph", () => {
    const m = buildMetadata({ title: "Pilates", description: "d", path: "/pilates" });
    expect(m.openGraph?.title).toBe("Pilates");
    expect(m.openGraph?.description).toBe("d");
    expect(m.openGraph?.locale).toBe("pt_BR");
  });

  it("marks the home path canonical as the bare site URL", () => {
    const m = buildMetadata({ title: "Home", description: "d", path: "/" });
    expect(m.alternates?.canonical).toBe(clinic.siteUrl);
  });

  it("defaults OpenGraph type to website and allows article", () => {
    expect(buildMetadata({ title: "t", description: "d", path: "/" }).openGraph?.type).toBe("website");
    expect(
      buildMetadata({ title: "t", description: "d", path: "/blog/x", type: "article" })
        .openGraph?.type,
    ).toBe("article");
  });
});
```

- [ ] **Step 2: Run, confirm fail**

Run: `npm test`
Expected: FAIL — `../seo` not found.

- [ ] **Step 3: Create `lib/seo.ts`**

```ts
import type { Metadata } from "next";
import { clinic } from "@/content/clinic";

export const SITE_TITLE_TEMPLATE = `%s · ${clinic.name}`;

export function buildMetadata(args: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
}): Metadata {
  const canonical =
    args.path === "/" ? clinic.siteUrl : `${clinic.siteUrl}${args.path}`;
  const image = args.image ?? "/opengraph-image";

  return {
    title: args.title,
    description: args.description,
    alternates: { canonical },
    openGraph: {
      title: args.title,
      description: args.description,
      url: canonical,
      siteName: clinic.name,
      locale: "pt_BR",
      type: args.type ?? "website",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: args.title,
      description: args.description,
      images: [image],
    },
  };
}
```

- [ ] **Step 4: Set `metadataBase` and the title template in `app/layout.tsx`**

Replace the `metadata` export:

```tsx
export const metadata: Metadata = {
  metadataBase: new URL(clinic.siteUrl),
  title: {
    default: `${clinic.name} — Fisioterapia e Pilates em São Paulo`,
    template: SITE_TITLE_TEMPLATE,
  },
  description:
    "Fisioterapia e Pilates com atendimento individual conduzido por fisioterapeutas. Duas unidades em São Paulo: Consolação e Pinheiros.",
  robots: { index: true, follow: true },
};
```

Add the sitewide JSON-LD inside `<body>`, above `{children}`:

```tsx
<JsonLd data={[organizationSchema(), websiteSchema()]} />
```

- [ ] **Step 5: Run tests and build**

Run: `npm test && npm run build`
Expected: PASS, 22 tests. Build succeeds.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add metadata builders and sitewide JSON-LD"
```

---

## Task 8: WhatsAppLink — the single conversion component

**Files:**
- Create: `components/WhatsAppLink.tsx`, `lib/tracking.ts`, `components/__tests__/WhatsAppLink.test.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: `<WhatsAppLink service from variant? className? children />`. Renders `<a href="/whatsapp" class="redirect-whatsapp …">`. Every WhatsApp CTA in every later task uses this and nothing else.

`trackWhatsAppClick` is the stub that Phase 2 of `docs/plano-atribuicao-leads.md` fills in.

- [ ] **Step 1: Write the failing tests**

`components/__tests__/WhatsAppLink.test.tsx`:

```tsx
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WhatsAppLink } from "../WhatsAppLink";
import * as tracking from "@/lib/tracking";

afterEach(cleanup);

describe("WhatsAppLink", () => {
  it("points at /whatsapp so the Ads conversion event fires", () => {
    render(<WhatsAppLink service="geral" from="/">Agendar</WhatsAppLink>);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/whatsapp");
  });

  it("carries the GTM class", () => {
    render(<WhatsAppLink service="geral" from="/">Agendar</WhatsAppLink>);
    expect(screen.getByRole("link")).toHaveClass("redirect-whatsapp");
  });

  it("keeps the GTM class when extra classes are passed", () => {
    render(
      <WhatsAppLink service="geral" from="/" className="mt-4">Agendar</WhatsAppLink>,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveClass("redirect-whatsapp");
    expect(link).toHaveClass("mt-4");
  });

  it("calls the tracking stub with service and origin on click", async () => {
    const spy = vi.spyOn(tracking, "trackWhatsAppClick").mockImplementation(() => {});
    render(<WhatsAppLink service="pilates" from="/pilates">Agendar</WhatsAppLink>);
    await userEvent.click(screen.getByRole("link"));
    expect(spy).toHaveBeenCalledWith({ service: "pilates", from: "/pilates" });
    spy.mockRestore();
  });
});
```

- [ ] **Step 2: Run, confirm fail**

Run: `npm test`
Expected: FAIL — modules not found.

- [ ] **Step 3: Create `lib/tracking.ts`**

```ts
export type WhatsAppClick = {
  /** Which service the visitor was looking at: "geral", "pilates", a speciality slug. */
  service: string;
  /** Path the click originated from. */
  from: string;
};

/**
 * Stub. Phase 2 of docs/plano-atribuicao-leads.md fills this in with the
 * lead_code generation and the POST to /api/lead. Deliberately does nothing
 * today so that the call sites already exist when that work lands.
 */
export function trackWhatsAppClick(_click: WhatsAppClick): void {}
```

- [ ] **Step 4: Create `components/WhatsAppLink.tsx`**

```tsx
"use client";

import { trackWhatsAppClick } from "@/lib/tracking";

const VARIANTS = {
  primary:
    "bg-accent-deep text-white hover:bg-accent-deep/90",
  warm: "bg-accent-warm text-ink-deep hover:bg-accent-warm/90",
  teal: "bg-accent text-white hover:bg-accent/90",
  bare: "",
} as const;

export function WhatsAppLink({
  service,
  from,
  variant = "primary",
  className = "",
  children,
}: {
  service: string;
  from: string;
  variant?: keyof typeof VARIANTS;
  className?: string;
  children: React.ReactNode;
}) {
  const base =
    variant === "bare"
      ? ""
      : "inline-flex items-center justify-center min-h-[44px] px-8 rounded-full text-base font-medium transition-colors";

  return (
    <a
      href="/whatsapp"
      className={`redirect-whatsapp ${base} ${VARIANTS[variant]} ${className}`.trim()}
      onClick={() => trackWhatsAppClick({ service, from })}
    >
      {children}
    </a>
  );
}
```

- [ ] **Step 5: Run tests, confirm pass**

Run: `npm test`
Expected: PASS, 26 tests.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add WhatsAppLink as the single WhatsApp CTA with tracking stub"
```

---

## Task 9: UI primitives

**Files:**
- Create: `components/ui/Reveal.tsx`, `components/ui/Button.tsx`, `components/ui/Eyebrow.tsx`, `components/ui/SectionHeading.tsx`, `components/ui/Section.tsx`, `components/ui/Prose.tsx`, `components/ui/__tests__/Reveal.test.tsx`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `<Reveal as? delay? className? children />` — fade + rise on scroll into view, no-op under `prefers-reduced-motion`
  - `<Button href variant? className? children />` — `primary | outline | ghost`
  - `<Eyebrow>text</Eyebrow>` — uppercase tracked label
  - `<SectionHeading eyebrow? title lead? tone? className? />` — no `align`
    prop; an earlier draft of this line listed one, but no task ever uses it.
  - `<Section id? tone? className? children />` — `tone: surface | surface-alt | ink`
  - `<Prose>` — long-form typography wrapper

- [ ] **Step 1: Write the failing Reveal test**

`components/ui/__tests__/Reveal.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Reveal } from "../Reveal";

beforeEach(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      constructor(private cb: IntersectionObserverCallback) {}
    },
  );
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: false,
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Reveal", () => {
  it("renders its children", () => {
    render(<Reveal>conteúdo</Reveal>);
    expect(screen.getByText("conteúdo")).toBeInTheDocument();
  });

  it("starts hidden when motion is allowed", () => {
    render(<Reveal>conteúdo</Reveal>);
    expect(screen.getByText("conteúdo")).toHaveAttribute("data-revealed", "false");
  });

  it("renders immediately visible when reduced motion is requested", () => {
    vi.stubGlobal("matchMedia", (q: string) => ({
      matches: true,
      media: q,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    render(<Reveal>conteúdo</Reveal>);
    expect(screen.getByText("conteúdo")).toHaveAttribute("data-revealed", "true");
  });
});
```

- [ ] **Step 2: Run, confirm fail**

Run: `npm test`
Expected: FAIL — `../Reveal` not found.

- [ ] **Step 3: Create `components/ui/Reveal.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

export function Reveal({
  as: Tag = "div",
  delay = 0,
  className = "",
  children,
}: {
  as?: "div" | "section" | "article" | "li";
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setRevealed(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setRevealed(true);
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      data-revealed={revealed}
      style={{ transitionDelay: delay ? `${delay}ms` : undefined }}
      className={`transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none data-[revealed=false]:translate-y-8 data-[revealed=false]:opacity-0 data-[revealed=true]:translate-y-0 data-[revealed=true]:opacity-100 ${className}`}
    >
      {children}
    </Tag>
  );
}
```

Note: the initial server render emits `data-revealed="false"`, so content is hidden before hydration. Because every route is statically generated and crawlers execute JS, this does not hide content from Google — but it does mean the reveal must never wrap the `<h1>` of a page in a way that delays LCP. Task 11 keeps the hero headline outside `Reveal` for that reason.

- [ ] **Step 4: Create the remaining primitives**

`components/ui/Section.tsx`:

```tsx
const TONES = {
  surface: "bg-surface text-ink",
  "surface-alt": "bg-surface-alt text-ink",
  ink: "bg-ink text-surface",
} as const;

export function Section({
  id,
  tone = "surface",
  className = "",
  children,
}: {
  id?: string;
  tone?: keyof typeof TONES;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`w-full ${TONES[tone]} ${className}`}>
      <div className="mx-auto max-w-shell px-6 py-20 md:px-8 md:py-28">
        {children}
      </div>
    </section>
  );
}
```

`components/ui/Eyebrow.tsx`:

```tsx
export function Eyebrow({
  children,
  tone = "deep",
}: {
  children: React.ReactNode;
  tone?: "deep" | "warm";
}) {
  const color = tone === "warm" ? "text-accent-warm" : "text-accent-deep";
  return (
    <div className={`mb-4 text-xs uppercase tracking-eyebrow ${color}`}>
      {children}
    </div>
  );
}
```

`components/ui/SectionHeading.tsx`:

```tsx
import { Eyebrow } from "./Eyebrow";

export function SectionHeading({
  eyebrow,
  title,
  lead,
  tone = "ink",
  className = "",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: string;
  tone?: "ink" | "surface";
  className?: string;
}) {
  const titleColor = tone === "surface" ? "text-surface" : "text-ink";
  const leadColor = tone === "surface" ? "text-surface/80" : "text-muted";
  return (
    <div className={className}>
      {eyebrow && <Eyebrow tone={tone === "surface" ? "warm" : "deep"}>{eyebrow}</Eyebrow>}
      <h2 className={`font-display text-display-lg text-balance ${titleColor}`}>
        {title}
      </h2>
      {lead && (
        <p className={`mt-5 max-w-2xl text-lg font-light leading-relaxed ${leadColor}`}>
          {lead}
        </p>
      )}
    </div>
  );
}
```

`components/ui/Button.tsx`:

```tsx
import Link from "next/link";

const VARIANTS = {
  primary: "bg-accent-deep text-white hover:bg-accent-deep/90",
  teal: "bg-accent text-white hover:bg-accent/90",
  outline: "border border-surface/60 text-surface hover:bg-surface/10",
  outlineInk: "border border-line text-ink hover:bg-ink/5",
} as const;

export function Button({
  href,
  variant = "primary",
  className = "",
  children,
}: {
  href: string;
  variant?: keyof typeof VARIANTS;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-[44px] items-center justify-center rounded-full px-8 text-base transition-colors ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
```

`components/ui/Prose.tsx`:

```tsx
export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-2xl text-base font-light leading-relaxed text-muted [&_a]:text-accent [&_a:hover]:text-accent-deep [&_h2]:mb-4 [&_h2]:mt-12 [&_h2]:font-display [&_h2]:text-display-sm [&_h2]:text-ink [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-2xl [&_h3]:text-ink [&_li]:mb-3 [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-5 [&_strong]:font-medium [&_strong]:text-ink [&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-6">
      {children}
    </div>
  );
}
```

- [ ] **Step 5: No action — `text-balance` is already available**

This step originally said to add `.text-balance` / `.text-pretty` rules to
`app/globals.css`. **Do not.** Tailwind 3.4.17 ships both as native utilities
(verified at `node_modules/tailwindcss/src/corePlugins.js:1597-1598`), so the
`className="text-balance"` and `className="text-pretty"` usages throughout
Tasks 11–18 already work. Adding class rules would be dead CSS; adding
element-level rules (`p { text-wrap: pretty }`) would impose a sitewide
typographic default that belongs to no single task.

- [ ] **Step 6: Run tests and build**

Run: `npm test && npm run build`
Expected: PASS, 29 tests. Build succeeds.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add UI primitives with reduced-motion-aware Reveal"
```

---

## Task 10: Layout chrome — TopBar, Nav, MobileMenu, Footer

**Files:**
- Create: `components/layout/TopBar.tsx`, `components/layout/Nav.tsx`, `components/layout/MobileMenu.tsx`, `components/layout/Footer.tsx`, `components/layout/Logo.tsx`, `components/layout/WhatsAppFab.tsx`, `components/ui/sheet.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `clinic`, `units`, `WhatsAppLink`
- Produces: the persistent chrome rendered by `app/layout.tsx`. `NAV_ITEMS` is exported from `components/layout/Nav.tsx` and reused by `Footer` and `MobileMenu`.

The PT/EN toggle from the comp is **not** built — the EN version is out of scope per spec §2.

- [ ] **Step 1: Add the shadcn Sheet primitive**

```bash
npx shadcn@latest add sheet
npm i iconoir-react
```

If the shadcn CLI prompts for configuration, choose: TypeScript yes, `app/globals.css` as the stylesheet, `@/components` and `@/lib/utils` aliases, no CSS variables (we use Tailwind tokens directly).

- [ ] **Step 2: Create `components/layout/Logo.tsx`**

The comp recolours a PNG via CSS mask, which lets one asset render in any token colour.

```tsx
export function Logo({
  size = 42,
  className = "bg-ink",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label="Vyta"
      className={`block flex-none ${className}`}
      style={{
        width: size,
        height: size,
        maskImage: "url('/LOGOTIPO 002.webp')",
        WebkitMaskImage: "url('/LOGOTIPO 002.webp')",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}
```

- [ ] **Step 3: Create `components/layout/TopBar.tsx`**

```tsx
export function TopBar() {
  return (
    <div className="flex w-full items-center justify-center gap-3 bg-ink px-6 py-2 text-center text-[11px] font-light uppercase tracking-eyebrow text-surface">
      <span>Duas unidades em São Paulo</span>
      <span className="opacity-40" aria-hidden>·</span>
      <span>Consolação</span>
      <span className="opacity-40" aria-hidden>·</span>
      <span>Pinheiros</span>
    </div>
  );
}
```

- [ ] **Step 4: Create `components/layout/Nav.tsx`**

```tsx
import Link from "next/link";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { clinic } from "@/content/clinic";

export const NAV_ITEMS = [
  { href: "/especialidades", label: "Especialidades" },
  { href: "/pilates", label: "Pilates" },
  { href: "/#quem-somos", label: "Quem somos" },
  { href: "/unidades/consolacao", label: "Unidades" },
  { href: "/blog", label: "Conteúdo" },
] as const;

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-line bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-shell items-center justify-between gap-6 px-6 py-3 md:px-8">
        <Link href="/" className="flex flex-none items-center gap-4">
          <Logo size={40} />
          <span className="hidden h-8 w-px bg-line sm:block" aria-hidden />
          <span className="hidden pl-[0.32em] text-[9px] uppercase tracking-brand text-ink sm:block">
            {clinic.tagline}
          </span>
        </Link>

        <div className="hidden items-center gap-7 text-sm lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="text-ink hover:text-accent-deep">
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-none items-center gap-3">
          <WhatsAppLink service="geral" from="nav" variant="teal" className="hidden px-6 text-sm sm:inline-flex">
            Agendar
          </WhatsAppLink>
          <MobileMenu />
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 5: Create `components/layout/MobileMenu.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "iconoir-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NAV_ITEMS } from "./Nav";
import { WhatsAppLink } from "@/components/WhatsAppLink";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Abrir menu"
        className="flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-ink/5 lg:hidden"
      >
        <Menu width={22} height={22} />
      </SheetTrigger>
      <SheetContent side="right" className="w-[86vw] max-w-sm border-line bg-surface">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <div className="mt-10 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex min-h-[44px] items-center border-b border-line py-3 font-display text-2xl text-ink"
            >
              {item.label}
            </Link>
          ))}
          <WhatsAppLink service="geral" from="mobile-menu" variant="teal" className="mt-8 w-full">
            Agendar no WhatsApp
          </WhatsAppLink>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

`NAV_ITEMS` is imported from a server component into a client component. That is legal — it is a plain serialisable constant, not a component.

- [ ] **Step 6: Create `components/layout/Footer.tsx`**

All four GTM classes appear here, which is why the E2E class guard in Task 22 can assert them on every page.

```tsx
import Link from "next/link";
import { Logo } from "./Logo";
import { clinic } from "@/content/clinic";
import { units } from "@/content/units";
import { team } from "@/content/team";
import { NAV_ITEMS } from "./Nav";

export function Footer() {
  return (
    <footer className="w-full border-t border-line bg-surface">
      <div className="mx-auto grid max-w-shell gap-10 px-6 py-16 md:grid-cols-2 md:px-8 lg:grid-cols-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Logo size={40} />
            <span className="h-8 w-px bg-line" aria-hidden />
            <span className="pl-[0.32em] text-[9px] uppercase tracking-brand text-ink">
              {clinic.tagline}
            </span>
          </div>
          <p className="max-w-xs text-sm font-light leading-relaxed text-subtle">
            Atendimento particular, individual e baseado em evidências. Emitimos
            recibo para reembolso.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="mb-1 text-[11px] uppercase tracking-eyebrow text-subtle">Clínica</div>
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="text-[15px] font-light text-ink hover:text-accent">
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <div className="mb-1 text-[11px] uppercase tracking-eyebrow text-subtle">Unidades</div>
          {units.map((u) => (
            <Link key={u.slug} href={`/unidades/${u.slug}`} className="text-[15px] font-light text-ink hover:text-accent">
              {u.street}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <div className="mb-1 text-[11px] uppercase tracking-eyebrow text-subtle">Contato</div>
          <a href="/whatsapp" className="redirect-whatsapp text-[15px] font-light text-ink hover:text-accent">
            WhatsApp
          </a>
          <a href={`tel:${clinic.phoneE164}`} className="redirect-phone text-[15px] font-light text-ink hover:text-accent">
            {clinic.phoneDisplay}
          </a>
          <a href={`mailto:${clinic.email}`} className="redirect-email break-all text-[15px] font-light text-ink hover:text-accent">
            {clinic.email}
          </a>
          <a
            href={clinic.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="redirect-instagram text-[15px] font-light text-ink hover:text-accent"
          >
            {clinic.instagramHandle}
          </a>
        </div>
      </div>

      <div className="mx-auto flex max-w-shell flex-wrap justify-between gap-4 border-t border-line px-6 py-6 md:px-8">
        <span className="text-[13px] font-light text-subtle">
          © {new Date().getFullYear()} {clinic.name}
        </span>
        <span className="text-[13px] font-light text-subtle">
          {team.map((m) => m.crefito.replace("Crefito 3: ", "")).join(" · ")}
        </span>
      </div>
    </footer>
  );
}
```

- [ ] **Step 7: Create `components/layout/WhatsAppFab.tsx`**

```tsx
import Image from "next/image";
import { WhatsAppLink } from "@/components/WhatsAppLink";

export function WhatsAppFab() {
  return (
    <WhatsAppLink
      service="geral"
      from="fab"
      variant="bare"
      className="fixed bottom-6 right-5 z-40 block h-14 w-14 drop-shadow-lg md:bottom-8 md:right-8"
    >
      <Image src="/whatsapp.webp" alt="Falar no WhatsApp" width={56} height={56} />
    </WhatsAppLink>
  );
}
```

- [ ] **Step 8: Compose them into `app/layout.tsx`**

Inside `<body>`, wrap `{children}`:

```tsx
<JsonLd data={[organizationSchema(), websiteSchema()]} />
<TopBar />
<Nav />
{children}
<Footer />
<WhatsAppFab />
<Analytics />
```

Also delete the "Website by Gustavo Moreira" footer from the old `_app.tsx` — it is gone with that file already; do not reintroduce it.

- [ ] **Step 9: Verify**

Run: `npm test && npm run build && npm run test:e2e`
Expected: all pass. Then `npm run dev` and check the nav at 375px, 768px and 1440px, and tab through the mobile menu with the keyboard.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: add site chrome — top bar, nav, mobile sheet, footer, WhatsApp FAB"
```

---

## Task 11: Landing sections — Hero, Manifesto, ComoFunciona

**Files:**
- Create: `components/sections/Hero.tsx`, `components/sections/Manifesto.tsx`, `components/sections/ComoFunciona.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `WhatsAppLink`, `Button`, `Section`, `SectionHeading`, `Reveal`, `Logo`
- Produces: three exported section components composed by `app/page.tsx`.

**Copy is draft** (spec §12 item 2) — reproduce the comp's wording exactly so the clinic reviews the real text.

- [ ] **Step 1: Create `components/sections/Hero.tsx`**

The `<h1>` sits **outside** `Reveal` and the background image carries `priority` — this is the LCP element and must not wait on hydration.

```tsx
import Image from "next/image";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { WhatsAppLink } from "@/components/WhatsAppLink";

export function Hero() {
  return (
    <section id="topo" className="relative flex min-h-[85svh] w-full items-center justify-center overflow-hidden">
      <Image
        src="/pilates3.jpeg"
        alt="Estúdio da Vyta Fisioterapia"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/65 to-ink/90"
        aria-hidden
      />
      <div className="relative flex max-w-4xl flex-col items-center px-6 py-24 text-center md:px-8">
        <Logo size={88} className="bg-surface" />
        <span className="my-6 block h-px w-16 bg-accent-warm" aria-hidden />
        <span className="pl-[0.46em] text-xs uppercase tracking-hero text-surface">
          Fisioterapia &amp; Pilates
        </span>
        <h1 className="mt-10 font-display text-display-xl text-balance text-surface">
          Cuidar do movimento é <em className="italic">cuidar da vida</em>
        </h1>
        <p className="mt-6 max-w-xl text-lg font-light leading-relaxed text-surface/85 text-pretty">
          Uma clínica onde cada sessão — inclusive as de Pilates — é conduzida
          por fisioterapeuta. Avaliação longa, plano escrito para o seu corpo, e
          alguém que acompanha a sua evolução de perto.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <WhatsAppLink service="geral" from="hero">Agendar no WhatsApp</WhatsAppLink>
          <Button href="#como-funciona" variant="outline">Como funciona</Button>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `components/sections/Manifesto.tsx`**

```tsx
import { Reveal } from "@/components/ui/Reveal";

const STATS = [
  {
    figure: "1 : 1",
    text: "Atendimento individual do começo ao fim. Sem sala cheia, sem esteira de paciente, sem estagiário assumindo a sua sessão.",
  },
  {
    figure: "100%",
    text: "Das aulas de Pilates conduzidas por fisioterapeutas — quem entende de lesão orientando cada exercício, cada carga, cada respiração.",
  },
  {
    figure: "8",
    text: "Especialidades sob o mesmo teto — do pós-operatório à reabilitação neurológica, da oncologia ao condicionamento.",
  },
];

export function Manifesto() {
  return (
    <section className="w-full border-b border-line bg-surface">
      <div className="mx-auto grid max-w-shell gap-10 px-6 py-16 md:px-8 md:py-20 lg:grid-cols-3 lg:gap-0">
        {STATS.map((stat, i) => (
          <Reveal
            key={stat.figure}
            delay={i * 90}
            className={`lg:px-10 ${i === 0 ? "lg:pl-0" : ""} ${
              i < STATS.length - 1 ? "lg:border-r lg:border-line" : "lg:pr-0"
            }`}
          >
            <div className="font-display text-5xl font-light leading-none text-accent">
              {stat.figure}
            </div>
            <p className="mt-4 text-base font-light leading-relaxed text-muted">
              {stat.text}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create `components/sections/ComoFunciona.tsx`**

```tsx
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const STEPS = [
  {
    n: "01",
    title: "Conversa",
    text: "Você conta o que está sentindo pelo WhatsApp. A gente responde qual especialidade faz sentido e qual unidade fica melhor para você — sem compromisso.",
  },
  {
    n: "02",
    title: "Avaliação",
    text: "Uma sessão inteira para escutar, examinar e testar. Saímos dela com um objetivo escrito — seu, não nosso — e o número de sessões estimado até chegar lá.",
  },
  {
    n: "03",
    title: "Tratamento",
    text: "Sessões individuais com a mesma fisioterapeuta. O plano é revisto sempre que o seu corpo muda — e ele muda, é esse o ponto.",
  },
  {
    n: "04",
    title: "Continuidade",
    text: "Alta não é fim de linha. A maioria segue no Pilates para manter o que conquistou — com quem já conhece a sua história clínica.",
  },
];

export function ComoFunciona() {
  return (
    <Section id="como-funciona" tone="surface-alt">
      <SectionHeading
        className="mb-14 max-w-3xl"
        eyebrow="Como funciona"
        title={
          <>
            Quatro passos entre a primeira mensagem e{" "}
            <em className="italic">voltar a se mover sem medo</em>
          </>
        }
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => {
          const last = i === STEPS.length - 1;
          return (
            <Reveal
              key={step.n}
              delay={i * 80}
              className={`flex min-h-[17rem] flex-col gap-4 border p-8 ${
                last ? "border-ink bg-ink" : "border-line bg-surface"
              }`}
            >
              <div className="text-xs font-medium tracking-[0.2em] text-accent-warm">
                {step.n}
              </div>
              <h3 className={`font-display text-3xl ${last ? "text-surface" : "text-ink"}`}>
                {step.title}
              </h3>
              <p className={`text-[15px] font-light leading-relaxed ${last ? "text-surface/75" : "text-muted"}`}>
                {step.text}
              </p>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
```

- [ ] **Step 4: Compose into `app/page.tsx`**

```tsx
import { Hero } from "@/components/sections/Hero";
import { Manifesto } from "@/components/sections/Manifesto";
import { ComoFunciona } from "@/components/sections/ComoFunciona";

export default function Home() {
  return (
    <main>
      <Hero />
      <Manifesto />
      <ComoFunciona />
    </main>
  );
}
```

- [ ] **Step 5: Verify**

Run: `npm run build && npm run dev`
Check at 375px, 768px, 1440px. Confirm the hero headline is legible at 375px and the 4-up step grid collapses to 1-up then 2-up.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add hero, manifesto and como-funciona landing sections"
```

---

## Task 12: Speciality content model and grid

**Files:**
- Create: `content/specialities.ts`, `content/__tests__/specialities.test.ts`, `components/sections/EspecialidadesGrid.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `Section`, `SectionHeading`, `Reveal`
- Produces:
  - `Speciality` = `{ slug, title, cardTitle, image, summary, cardText, intro, forWhom: string[], howItWorks: string, faq: {question,answer}[], condition, relatedPosts: string[] }`
  - `specialities: Speciality[]` (7), `getSpeciality(slug)`
  - `<EspecialidadesGrid />` — 8 cards (7 specialities + a Pilates card linking to `/pilates`)

Copy is migrated from the existing `constants/specialities.ts` plus the comp's card text. `intro` and `faq` are new and must be drafted from existing material — **do not invent clinical claims**; derive strictly from what `constants/specialities.ts` already says.

- [ ] **Step 1: Write the failing tests**

`content/__tests__/specialities.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { specialities, getSpeciality } from "../specialities";

describe("specialities", () => {
  it("has seven entries and none is pilates", () => {
    expect(specialities).toHaveLength(7);
    expect(specialities.map((s) => s.slug)).not.toContain("pilates");
  });

  it("uses the new Portuguese slugs", () => {
    expect(specialities.map((s) => s.slug)).toEqual([
      "fisioterapia-neurologica",
      "fisioterapia-oncologica",
      "fisioterapia-ortopedica",
      "fisioterapia-para-idosos",
      "fisioterapia-respiratoria",
      "fisioterapia-pre-e-pos-cirurgica",
      "drenagem-linfatica",
    ]);
  });

  it("gives every speciality FAQ entries for FAQPage schema", () => {
    for (const s of specialities) {
      expect(s.faq.length).toBeGreaterThanOrEqual(3);
      for (const f of s.faq) {
        expect(f.question.length).toBeGreaterThan(0);
        expect(f.answer.length).toBeGreaterThan(0);
      }
    }
  });

  it("gives every speciality a meta description under 160 characters", () => {
    for (const s of specialities) {
      expect(s.summary.length).toBeLessThanOrEqual(160);
    }
  });

  it("looks up by slug", () => {
    expect(getSpeciality("drenagem-linfatica")?.cardTitle).toBe("Drenagem linfática");
    expect(getSpeciality("nope")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run, confirm fail**

Run: `npm test`
Expected: FAIL — `../specialities` not found.

- [ ] **Step 3: Create `content/specialities.ts`**

Build all seven entries.

> **⚠️ The worked example below is a SHAPE reference, not a content reference.**
> Its `faq` entries failed their own rule and were rejected during implementation:
> the neuroplasticity answer asserted a prognosis ("ganhos de função continuam
> possíveis na fase crônica") that appears nowhere in `constants/specialities.ts`,
> and the "estimativa de número de sessões" answer asserted a clinic policy the
> speciality source never states. Both were fabricated clinical claims on a page
> published under a CREFITO registration.
>
> Copy the **structure** from this example. Derive all actual `faq`, `intro` and
> `summary` content strictly from `git show edfe4ec:constants/specialities.ts`.
> If a sentence is not supported there, cut it.

The shape, with the first worked as the structural pattern:

```ts
export type Speciality = {
  slug: string;
  title: string;
  cardTitle: string;
  image: string;
  /** Meta description. Must stay ≤160 chars. */
  summary: string;
  cardText: string;
  intro: string;
  forWhom: string[];
  howItWorks: string;
  faq: Array<{ question: string; answer: string }>;
  /** schema.org MedicalCondition name. */
  condition: string;
  /** Blog post slugs to cross-link. */
  relatedPosts: string[];
};

export const specialities: Speciality[] = [
  {
    slug: "fisioterapia-neurologica",
    title: "Fisioterapia Neurofuncional",
    cardTitle: "Neurofuncional",
    image: "/neuro.webp",
    summary:
      "Fisioterapia neurofuncional em São Paulo: recuperação de função motora e autonomia após AVC, lesão medular, Parkinson e cirurgias neurológicas.",
    cardText:
      "Recuperar função motora e autonomia após AVC, lesão medular, Parkinson e cirurgias neurológicas.",
    intro:
      "A fisioterapia neurofuncional trabalha a função motora e a qualidade de vida em distúrbios neurológicos. O objetivo não é abstrato: é voltar a levantar da cadeira sozinho, a segurar um copo, a caminhar sem apoio.",
    forWhom: [
      "Pacientes com lesões neurológicas: após AVC, lesão medular, esclerose múltipla, paralisia cerebral, lesões cerebrais traumáticas.",
      "Pacientes com distúrbios de movimento: doença de Parkinson, distonias e ataxias.",
      "Crianças com atraso no desenvolvimento motor: atrasos no início da marcha, dificuldades de equilíbrio e coordenação.",
      "Pacientes em pós-operatório de cirurgias de coluna e cerebral.",
      "Adultos e idosos com comprometimento neuromuscular: dor ou formigamento nos membros ou na face, fraqueza muscular, fadiga e cãibras.",
    ],
    howItWorks:
      "Uma avaliação detalhada e com foco na queixa será realizada e, junto com o paciente, definiremos um objetivo a ser atingido. Sendo assim, um tratamento específico e individualizado será realizado, por meio de técnicas e exercícios terapêuticos, buscando melhorar a funcionalidade, mobilidade, equilíbrio e qualidade de vida dos pacientes.",
    faq: [
      {
        question: "Quanto tempo dura a reabilitação neurofuncional?",
        answer:
          "Depende da lesão, do tempo desde o evento e dos objetivos definidos na avaliação. Saímos da primeira sessão com uma estimativa de número de sessões, revista conforme a evolução.",
      },
      {
        question: "A fisioterapia neurofuncional funciona anos depois do AVC?",
        answer:
          "Sim. A neuroplasticidade — a capacidade do cérebro de se reorganizar — não se encerra nos primeiros meses. Ganhos de função continuam possíveis na fase crônica.",
      },
      {
        question: "As sessões são individuais?",
        answer:
          "Sim. Todo atendimento na Vyta é individual, com a mesma fisioterapeuta acompanhando o caso.",
      },
    ],
    condition: "Distúrbios neurológicos",
    relatedPosts: ["fisioterapia-apos-avc"],
  },
  // … six more, same shape
];

export function getSpeciality(slug: string): Speciality | undefined {
  return specialities.find((s) => s.slug === slug);
}
```

Complete the remaining six from `constants/specialities.ts`, in this order and with these identities:

| slug | title | cardTitle | image | condition | relatedPosts |
|---|---|---|---|---|---|
| `fisioterapia-oncologica` | Fisioterapia Oncológica | Oncológica | `/onco.webp` | Câncer | `fisioterapia-oncologica-tratamento-cancer`, `fisioterapia-cuidados-paliativos` |
| `fisioterapia-ortopedica` | Fisioterapia Ortopédica | Ortopédica | `/ortop.webp` | Lesões musculoesqueléticas | — |
| `fisioterapia-para-idosos` | Fisioterapia em Gerontologia | Gerontologia | `/geronto.webp` | Envelhecimento e quedas | — |
| `fisioterapia-respiratoria` | Fisioterapia Respiratória | Respiratória | `/resp.webp` | Doenças respiratórias crônicas | `fisioterapia-respiratoria-dpoc` |
| `fisioterapia-pre-e-pos-cirurgica` | Fisioterapia Pré e Pós-Cirúrgica | Pré e pós-cirúrgico | `/cond.webp` | Recuperação cirúrgica | — |
| `drenagem-linfatica` | Drenagem Linfática | Drenagem linfática | `/drenagem.webp` | Linfedema | `fisioterapia-incontinencia-urinaria` |

`forWhom` and `howItWorks` copy transfers verbatim from `constants/specialities.ts`. Write three FAQ entries each, derived only from that existing material.

- [ ] **Step 4: Create `components/sections/EspecialidadesGrid.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { specialities } from "@/content/specialities";

export function EspecialidadesGrid() {
  return (
    <Section id="especialidades">
      <div className="mb-14 flex flex-wrap items-end justify-between gap-8">
        <SectionHeading
          className="max-w-2xl"
          eyebrow="Especialidades"
          title="Oito frentes, uma forma de trabalhar"
        />
        <p className="max-w-sm text-base font-light leading-relaxed text-muted">
          Cada especialidade tem técnica própria, mas todas partem do mesmo
          lugar: avaliar antes de tratar, e tratar uma pessoa — não um
          diagnóstico.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {specialities.map((s, i) => (
          <Reveal key={s.slug} delay={(i % 4) * 70}>
            <Link
              href={`/especialidades/${s.slug}`}
              className="group flex h-full flex-col overflow-hidden border border-line bg-white text-ink"
            >
              <div className="h-44 overflow-hidden">
                <Image
                  src={s.image}
                  alt={s.title}
                  width={480}
                  height={320}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-6">
                <h3 className="font-display text-2xl">{s.cardTitle}</h3>
                <p className="text-sm font-light leading-relaxed text-muted">{s.cardText}</p>
              </div>
            </Link>
          </Reveal>
        ))}

        <Reveal delay={210}>
          <Link
            href="/pilates"
            className="group flex h-full flex-col overflow-hidden border border-accent bg-accent text-surface"
          >
            <div className="h-44 overflow-hidden">
              <Image
                src="/pilates4.jpeg"
                alt="Pilates na Vyta"
                width={480}
                height={320}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-6">
              <h3 className="font-display text-2xl text-white">Pilates</h3>
              <p className="text-sm font-light leading-relaxed text-white/85">
                Força, mobilidade e controle — sempre com fisioterapeuta ao lado.
                Ver a sala →
              </p>
            </div>
          </Link>
        </Reveal>
      </div>
    </Section>
  );
}
```

- [ ] **Step 5: Add to `app/page.tsx`** after `<ComoFunciona />`.

- [ ] **Step 6: Run tests and build**

Run: `npm test && npm run build`
Expected: PASS, 34 tests. Build succeeds.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add speciality content model and landing grid"
```

---

## Task 13: Landing sections — Pilates, Founders, PullQuote, Unidades, ContactCTA

**Files:**
- Create: `components/sections/PilatesSection.tsx`, `components/sections/Founders.tsx`, `components/sections/PullQuote.tsx`, `components/sections/UnidadesSection.tsx`, `components/sections/ContactCTA.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `Section`, `SectionHeading`, `Reveal`, `WhatsAppLink`, `Button`, `team`, `units`, `Logo`
- Produces: five section components; `app/page.tsx` becomes the full landing page.

- [ ] **Step 1: Create `components/sections/PilatesSection.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppLink } from "@/components/WhatsAppLink";

const POINTS = [
  "Grupos reduzidos, aparelhos completos",
  "Avaliação postural antes da primeira aula",
  "Transição natural para quem sai da reabilitação",
];

export function PilatesSection() {
  return (
    <Section id="pilates" tone="ink">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <Eyebrow tone="warm">Pilates</Eyebrow>
          <h2 className="font-display text-display-lg text-balance text-surface">
            Todas as aulas com <em className="italic">fisioterapeuta</em>. Sempre.
          </h2>
          <p className="mt-6 text-[17px] font-light leading-relaxed text-surface/80">
            É a diferença que ninguém vê no Instagram e todo mundo sente na
            terceira semana: quem corrige a sua postura conhece a sua lesão, sabe
            o que a sua cirurgia limitou e entende por que aquele ombro ainda dói.
          </p>
          <p className="mt-5 text-[17px] font-light leading-relaxed text-surface/80">
            Fortalecimento de core, alinhamento postural, mobilidade e
            consciência corporal — dosados para o seu corpo de hoje.
          </p>
          <ul className="mt-8 flex flex-col gap-3 border-t border-surface/20 pt-6">
            {POINTS.map((p) => (
              <li key={p} className="flex items-baseline gap-3 text-base font-light text-surface/90">
                <span className="text-accent-warm" aria-hidden>·</span>
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-9 flex flex-wrap gap-3">
            <WhatsAppLink service="pilates" from="landing-pilates" variant="warm">
              Agendar aula experimental
            </WhatsAppLink>
            <Link href="/pilates" className="inline-flex min-h-[44px] items-center rounded-full border border-surface/60 px-8 text-base text-surface hover:bg-surface/10">
              Conhecer o Pilates
            </Link>
          </div>
        </Reveal>

        <Reveal delay={120} className="grid grid-cols-2 grid-rows-2 gap-3">
          <Image src="/pilates1.jpeg" alt="Sala de Pilates da Vyta" width={480} height={640} sizes="(max-width: 1024px) 50vw, 25vw" className="row-span-2 h-full w-full object-cover" />
          <Image src="/pilates2.jpeg" alt="Aparelho de Pilates" width={480} height={320} sizes="(max-width: 1024px) 50vw, 25vw" className="h-full w-full object-cover" />
          <Image src="/pilates4.jpeg" alt="Aula de Pilates conduzida por fisioterapeuta" width={480} height={320} sizes="(max-width: 1024px) 50vw, 25vw" className="h-full w-full object-cover" />
        </Reveal>
      </div>
    </Section>
  );
}
```

- [ ] **Step 2: Create `components/sections/Founders.tsx`**

```tsx
import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { team } from "@/content/team";

export function Founders() {
  return (
    <Section id="quem-somos">
      <SectionHeading
        className="mb-14 max-w-3xl"
        eyebrow="Quem somos"
        title={<>Duas fisioterapeutas que <em className="italic">atendem</em> — não só assinam</>}
        lead="A Vyta nasceu de uma amizade formada na graduação e do mesmo incômodo: reabilitação boa não cabe em vinte minutos. Aqui, quem fundou a clínica é quem senta com você na avaliação."
      />
      <div className="grid gap-12 md:grid-cols-2">
        {team.map((m, i) => (
          <Reveal key={m.slug} delay={i * 100} className="flex flex-col gap-6">
            <div className="h-[26rem] overflow-hidden bg-surface-alt">
              <Image
                src={m.image}
                alt={m.name}
                width={640}
                height={840}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="h-full w-full object-cover object-top"
              />
            </div>
            <div>
              <h3 className="font-display text-display-sm text-ink">{m.name}</h3>
              <div className="mb-4 mt-1 text-[13px] uppercase tracking-eyebrow text-accent-deep">
                {m.role}
              </div>
              <p className="text-base font-light leading-relaxed text-muted">{m.bio}</p>
              <ul className="mt-4 flex flex-col gap-1">
                {m.education.map((e) => (
                  <li key={e} className="text-[15px] font-light text-muted">{e}</li>
                ))}
              </ul>
              <div className="mt-4 text-[13px] font-light text-subtle">{m.crefito}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 3: Create `components/sections/PullQuote.tsx`**

Flag in a code comment that this claim needs clinical sign-off (spec §12 item 2).

```tsx
import { Reveal } from "@/components/ui/Reveal";

/**
 * DRAFT COPY — this asserts the clinic does not accept health insurance.
 * Must be confirmed by Vyvyan and Tainá before launch. Spec §12 item 2.
 */
export function PullQuote() {
  return (
    <section className="w-full border-y border-line bg-surface-alt">
      <Reveal className="mx-auto max-w-3xl px-6 py-24 text-center md:px-8">
        <p className="font-display text-display-md text-balance text-ink">
          “A gente não atende plano de saúde porque não conseguiria fazer, em
          vinte minutos, o que a sua recuperação exige em{" "}
          <em className="italic">uma hora inteira</em>.”
        </p>
        <div className="mt-7 text-xs uppercase tracking-eyebrow text-subtle">
          Vyvyan &amp; Tainá · fundadoras
        </div>
      </Reveal>
    </section>
  );
}
```

- [ ] **Step 4: Create `components/sections/UnidadesSection.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { units } from "@/content/units";

export function UnidadesSection() {
  return (
    <Section id="localizacao" tone="surface-alt">
      <SectionHeading className="mb-14 max-w-2xl" eyebrow="Unidades" title="Consolação e Pinheiros" />
      <div className="grid gap-8 md:grid-cols-2">
        {units.map((u, i) => (
          <Reveal key={u.slug} delay={i * 100} className="border border-line bg-surface">
            <div className="h-64 overflow-hidden">
              <Image src={u.image} alt={u.name} width={720} height={480} sizes="(max-width: 768px) 100vw, 50vw" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col gap-3 p-8">
              <h3 className="font-display text-3xl text-ink">{u.name}</h3>
              <p className="text-base font-light leading-relaxed text-muted">
                {u.street}
                <br />
                {u.district}, {u.city} · {u.state}
              </p>
              <Link href={`/unidades/${u.slug}`} className="text-[15px] text-accent hover:text-accent-deep">
                Ver a unidade →
              </Link>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 5: Create `components/sections/ContactCTA.tsx`**

```tsx
import Image from "next/image";
import { Logo } from "@/components/layout/Logo";
import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { clinic } from "@/content/clinic";

export function ContactCTA() {
  return (
    <section id="contato" className="relative w-full overflow-hidden">
      <Image src="/sala3.jpg" alt="Clínica Vyta" fill sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-ink/90" aria-hidden />
      <Reveal className="relative mx-auto flex max-w-3xl flex-col items-center px-6 py-28 text-center md:px-8">
        <Logo size={68} className="bg-surface" />
        <span className="my-7 block h-px w-14 bg-accent-warm" aria-hidden />
        <h2 className="font-display text-display-lg text-balance text-surface">
          Conta pra gente o que está <em className="italic">te incomodando</em>
        </h2>
        <p className="mt-6 max-w-lg text-lg font-light leading-relaxed text-surface/80">
          Responder leva alguns minutos e não custa nada. A gente diz qual
          especialidade faz sentido, qual unidade fica melhor e quanto tempo
          costuma levar.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <WhatsAppLink service="geral" from="contato">Falar no WhatsApp</WhatsAppLink>
          <a
            href={`tel:${clinic.phoneE164}`}
            className="redirect-phone inline-flex min-h-[44px] items-center rounded-full border border-surface/60 px-8 text-base text-surface hover:bg-surface/10"
          >
            {clinic.phoneDisplay}
          </a>
        </div>
      </Reveal>
    </section>
  );
}
```

- [ ] **Step 6: Finish `app/page.tsx`**

```tsx
import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { Manifesto } from "@/components/sections/Manifesto";
import { ComoFunciona } from "@/components/sections/ComoFunciona";
import { EspecialidadesGrid } from "@/components/sections/EspecialidadesGrid";
import { PilatesSection } from "@/components/sections/PilatesSection";
import { Founders } from "@/components/sections/Founders";
import { PullQuote } from "@/components/sections/PullQuote";
import { UnidadesSection } from "@/components/sections/UnidadesSection";
import { ContactCTA } from "@/components/sections/ContactCTA";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Fisioterapia e Pilates em São Paulo",
  description:
    "Fisioterapia e Pilates com atendimento individual conduzido por fisioterapeutas. Consolação e Pinheiros, São Paulo.",
  path: "/",
});

export default function Home() {
  return (
    <main>
      <Hero />
      <Manifesto />
      <ComoFunciona />
      <EspecialidadesGrid />
      <PilatesSection />
      <Founders />
      <PullQuote />
      <UnidadesSection />
      <ContactCTA />
    </main>
  );
}
```

The `BlogTeasers` section is added in Task 18, once posts exist.

- [ ] **Step 7: Verify**

Run: `npm test && npm run build && npm run test:e2e`
Then `npm run dev` and review the full landing at 375px, 768px and 1440px.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: complete landing page sections"
```

---

## Task 14: Speciality pages

**Files:**
- Create: `app/especialidades/page.tsx`, `components/sections/FaqAccordion.tsx`
- Modify: `app/especialidades/[slug]/page.tsx` (replacing the Task 3 stub)

**Interfaces:**
- Consumes: `specialities`, `getSpeciality`, `buildMetadata`, schema builders, `WhatsAppLink`
- Produces: 7 static speciality pages plus an `/especialidades` index. `<FaqAccordion items />` is reused by Task 16.

- [ ] **Step 1: Add the shadcn Accordion**

```bash
npx shadcn@latest add accordion
```

- [ ] **Step 2: Create `components/sections/FaqAccordion.tsx`**

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FaqAccordion({
  items,
}: {
  items: Array<{ question: string; answer: string }>;
}) {
  return (
    <Accordion type="single" collapsible className="w-full max-w-2xl">
      {items.map((item, i) => (
        <AccordionItem key={item.question} value={`item-${i}`} className="border-line">
          <AccordionTrigger className="py-5 text-left font-display text-xl text-ink hover:no-underline">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="pb-5 text-base font-light leading-relaxed text-muted">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
```

- [ ] **Step 3: Replace `app/especialidades/[slug]/page.tsx`**

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { JsonLd } from "@/components/JsonLd";
import { specialities, getSpeciality } from "@/content/specialities";
import { getPostMeta } from "@/lib/blog";
import { units } from "@/content/units";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqSchema, medicalWebPageSchema } from "@/lib/schema";

export function generateStaticParams() {
  return specialities.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = getSpeciality(slug);
  if (!s) return {};
  return buildMetadata({
    title: s.title,
    description: s.summary,
    path: `/especialidades/${s.slug}`,
    image: s.image,
  });
}

export default async function SpecialityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = getSpeciality(slug);
  if (!s) notFound();

  const related = s.relatedPosts.map(getPostMeta).filter(Boolean);

  return (
    <main>
      <JsonLd
        data={[
          medicalWebPageSchema({
            title: s.title,
            description: s.summary,
            path: `/especialidades/${s.slug}`,
            condition: s.condition,
          }),
          faqSchema(s.faq),
          breadcrumbSchema([
            { name: "Início", path: "/" },
            { name: "Especialidades", path: "/especialidades" },
            { name: s.title, path: `/especialidades/${s.slug}` },
          ]),
        ]}
      />

      <Section tone="surface-alt">
        <nav aria-label="Trilha" className="mb-8 text-sm font-light text-subtle">
          <Link href="/" className="hover:text-accent">Início</Link>
          <span className="mx-2" aria-hidden>/</span>
          <Link href="/especialidades" className="hover:text-accent">Especialidades</Link>
        </nav>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow>Especialidade</Eyebrow>
            <h1 className="font-display text-display-lg text-balance text-ink">{s.title}</h1>
            <p className="mt-6 text-lg font-light leading-relaxed text-muted">{s.intro}</p>
            <WhatsAppLink service={s.slug} from={`/especialidades/${s.slug}`} className="mt-8">
              Agendar avaliação
            </WhatsAppLink>
          </div>
          <Image
            src={s.image}
            alt={s.title}
            width={880}
            height={620}
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="h-full w-full object-cover"
          />
        </div>
      </Section>

      <Section>
        <h2 className="font-display text-display-md text-ink">Para quem funciona</h2>
        <ul className="mt-8 flex max-w-3xl flex-col gap-4">
          {s.forWhom.map((item) => (
            <li key={item} className="flex gap-4 text-base font-light leading-relaxed text-muted">
              <span className="mt-2 h-1 w-1 flex-none rounded-full bg-accent-warm" aria-hidden />
              {item}
            </li>
          ))}
        </ul>

        <h2 className="mt-16 font-display text-display-md text-ink">Como funciona</h2>
        <p className="mt-6 max-w-3xl text-base font-light leading-relaxed text-muted">
          {s.howItWorks}
        </p>
      </Section>

      <Section tone="surface-alt">
        <h2 className="mb-8 font-display text-display-md text-ink">Perguntas frequentes</h2>
        <FaqAccordion items={s.faq} />
      </Section>

      {related.length > 0 && (
        <Section>
          <h2 className="mb-8 font-display text-display-md text-ink">Para ler antes da consulta</h2>
          <ul className="flex flex-col gap-4">
            {related.map((p) => (
              <li key={p!.slug}>
                <Link href={`/blog/${p!.slug}`} className="font-display text-2xl text-ink hover:text-accent">
                  {p!.title} →
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section tone="ink">
        <h2 className="font-display text-display-md text-surface">Onde atendemos</h2>
        <div className="mt-8 flex flex-wrap gap-8">
          {units.map((u) => (
            <Link key={u.slug} href={`/unidades/${u.slug}`} className="text-surface/85 hover:text-accent-warm">
              <span className="font-display text-2xl">{u.shortName}</span>
              <span className="mt-1 block text-sm font-light">{u.street}</span>
            </Link>
          ))}
        </div>
        <WhatsAppLink service={s.slug} from={`/especialidades/${s.slug}`} variant="warm" className="mt-10">
          Agendar avaliação
        </WhatsAppLink>
      </Section>
    </main>
  );
}
```

`getPostMeta` comes from Task 17. Implement Task 17 before this task if executing strictly in order, or stub `getPostMeta` to return `undefined` and revisit. **Recommended: reorder so Task 17 runs before Task 14.**

- [ ] **Step 4: Create `app/especialidades/page.tsx`**

An index page, so `/especialidades` in the nav resolves and specialities gain an internal-link hub.

```tsx
import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EspecialidadesGrid } from "@/components/sections/EspecialidadesGrid";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = buildMetadata({
  title: "Especialidades",
  description:
    "Sete especialidades de fisioterapia e Pilates em São Paulo: neurofuncional, oncológica, ortopédica, gerontologia, respiratória, pré e pós-cirúrgica e drenagem linfática.",
  path: "/especialidades",
});

export default function EspecialidadesIndex() {
  return (
    <main>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Início", path: "/" },
          { name: "Especialidades", path: "/especialidades" },
        ])}
      />
      <Section tone="surface-alt">
        <SectionHeading
          eyebrow="Especialidades"
          title="O que tratamos"
          lead="Cada especialidade tem técnica própria, mas todas partem do mesmo lugar: avaliar antes de tratar, e tratar uma pessoa — não um diagnóstico."
        />
      </Section>
      <EspecialidadesGrid />
    </main>
  );
}
```

`EspecialidadesGrid` renders its own `<Section id="especialidades">`; that is acceptable here.

- [ ] **Step 5: Remove the legacy speciality page and dead dependencies**

```bash
git rm -r pages/speciality constants/specialities.ts
git rm components/Navbar.tsx components/StaffProfile.tsx components/SpecialityCard.tsx components/DropdownMenu.tsx
git rm -r components/icons
npm uninstall daisyui swiper react-slick @types/react-slick tailwind-gradient-mask-image
```

Then remove `require("daisyui")` and the `daisyui` block from `tailwind.config.js`, and drop `"./pages/**/*"` from `content` — the `pages/` directory is now empty.

```bash
rmdir pages 2>/dev/null || true
```

- [ ] **Step 6: Verify**

Run: `npm test && npm run typecheck && npm run build && npm run test:e2e`
Expected: all pass, including the eight redirect assertions now landing on real pages.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add speciality pages and index; remove Pages Router and daisyUI"
```

---

## Task 15: Unit pages

**Files:**
- Create: `app/unidades/[slug]/page.tsx`, `app/unidades/page.tsx`

**Interfaces:**
- Consumes: `units`, `getUnit`, `unitSchema`, `breadcrumbSchema`, `buildMetadata`, `WhatsAppLink`
- Produces: 2 static unit pages and an index.

- [ ] **Step 1: Create `app/unidades/[slug]/page.tsx`**

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { JsonLd } from "@/components/JsonLd";
import { units, getUnit } from "@/content/units";
import { clinic } from "@/content/clinic";
import { specialities } from "@/content/specialities";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, unitSchema } from "@/lib/schema";

export function generateStaticParams() {
  return units.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const u = getUnit(slug);
  if (!u) return {};
  return buildMetadata({
    title: `Fisioterapia e Pilates em ${u.district}`,
    description: `Clínica de fisioterapia e Pilates em ${u.district}, São Paulo. ${u.street}. Atendimento individual conduzido por fisioterapeutas.`,
    path: `/unidades/${u.slug}`,
    image: u.image,
  });
}

export default async function UnitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const u = getUnit(slug);
  if (!u) notFound();

  return (
    <main>
      <JsonLd
        data={[
          unitSchema(u),
          breadcrumbSchema([
            { name: "Início", path: "/" },
            { name: "Unidades", path: "/unidades" },
            { name: u.name, path: `/unidades/${u.slug}` },
          ]),
        ]}
      />

      <Section tone="surface-alt">
        <nav aria-label="Trilha" className="mb-8 text-sm font-light text-subtle">
          <Link href="/" className="hover:text-accent">Início</Link>
          <span className="mx-2" aria-hidden>/</span>
          <Link href="/unidades" className="hover:text-accent">Unidades</Link>
        </nav>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow>Unidade</Eyebrow>
            <h1 className="font-display text-display-lg text-balance text-ink">
              Fisioterapia e Pilates em {u.district}
            </h1>
            <p className="mt-6 text-lg font-light leading-relaxed text-muted">
              {u.street}
              <br />
              {u.district}, {u.city} · {u.state}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <WhatsAppLink service="geral" from={`/unidades/${u.slug}`}>
                Agendar nesta unidade
              </WhatsAppLink>
              <a
                href={u.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center rounded-full border border-line px-8 text-base text-ink hover:bg-ink/5"
              >
                Abrir no Google Maps
              </a>
            </div>
            <a href={`tel:${clinic.phoneE164}`} className="redirect-phone mt-6 inline-block text-[15px] text-accent hover:text-accent-deep">
              {clinic.phoneDisplay}
            </a>
          </div>
          <Image
            src={u.image}
            alt={u.name}
            width={880}
            height={620}
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="h-full w-full object-cover"
          />
        </div>
      </Section>

      <Section>
        <h2 className="mb-8 font-display text-display-md text-ink">Como chegar</h2>
        <div className="overflow-hidden border border-line">
          <iframe
            src={u.mapEmbedUrl}
            title={`Mapa da ${u.name}`}
            width="100%"
            height="420"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ border: 0 }}
          />
        </div>
      </Section>

      <Section tone="surface-alt">
        <h2 className="mb-8 font-display text-display-md text-ink">
          O que atendemos em {u.district}
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {specialities.map((s) => (
            <li key={s.slug}>
              <Link href={`/especialidades/${s.slug}`} className="text-[17px] font-light text-ink hover:text-accent">
                {s.cardTitle} →
              </Link>
            </li>
          ))}
          <li>
            <Link href="/pilates" className="text-[17px] font-light text-ink hover:text-accent">
              Pilates →
            </Link>
          </li>
        </ul>
      </Section>
    </main>
  );
}
```

**Note:** the "o que atendemos nesta unidade" list currently claims every speciality at both units. Confirm with the clinic; if services differ per unit, add a `specialities: string[]` field to `Unit` and filter.

- [ ] **Step 2: Create `app/unidades/page.tsx`**

```tsx
import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { UnidadesSection } from "@/components/sections/UnidadesSection";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = buildMetadata({
  title: "Unidades",
  description:
    "Duas unidades de fisioterapia e Pilates em São Paulo: Consolação (Frei Caneca) e Pinheiros (Fradique Coutinho).",
  path: "/unidades",
});

export default function UnidadesIndex() {
  return (
    <main>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Início", path: "/" },
          { name: "Unidades", path: "/unidades" },
        ])}
      />
      <Section tone="surface-alt">
        <SectionHeading eyebrow="Unidades" title="Onde a gente atende" />
      </Section>
      <UnidadesSection />
    </main>
  );
}
```

- [ ] **Step 3: Point the nav at the index**

In `components/layout/Nav.tsx`, change the Unidades entry from `/unidades/consolacao` to `/unidades`.

- [ ] **Step 4: Verify**

Run: `npm run build && npm run test:e2e`
Then paste the rendered JSON-LD from `/unidades/consolacao` into Google's Rich Results Test and confirm `Physiotherapy` validates with no errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add unit pages with LocalBusiness schema"
```

---

## Task 16: Pilates page

**Files:**
- Modify: `app/pilates/page.tsx` (replacing the Task 3 stub)

**Interfaces:**
- Consumes: `PilatesSection`, `FaqAccordion`, `Section`, `WhatsAppLink`, schema builders
- Produces: the `/pilates` route, which is also the 301 target for `/speciality/pilates`.

- [ ] **Step 1: Replace `app/pilates/page.tsx`**

Copy migrates from `constants/specialities.ts`'s pilates entry (removed in Task 14 — take it from git history at `edfe4ec` if needed).

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PilatesSection } from "@/components/sections/PilatesSection";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { JsonLd } from "@/components/JsonLd";
import { units } from "@/content/units";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqSchema, medicalWebPageSchema } from "@/lib/schema";

const BENEFITS = [
  "Melhorar a postura: fortalece a musculatura central, ajudando a manter uma postura mais alinhada.",
  "Aumentar a flexibilidade: trabalha a amplitude de movimento dos músculos.",
  "Reduzir o estresse: através das respirações conscientes, oferece um espaço para relaxamento e concentração.",
  "Reabilitação e prevenção de lesões: ajuda na recuperação de lesões e na prevenção de novos problemas.",
  "Melhorar o condicionamento físico: um treino completo, que foca em força, mobilidade, estabilidade e resistência.",
];

const FAQ = [
  {
    question: "Preciso ter feito fisioterapia antes para fazer Pilates aqui?",
    answer:
      "Não. O Pilates é acessível a pessoas de todas as idades e níveis de condicionamento. Quem vem da reabilitação faz uma transição natural, mas não é pré-requisito.",
  },
  {
    question: "Qual a diferença do Pilates com fisioterapeuta?",
    answer:
      "Quem conduz a aula tem formação clínica: entende de lesão, sabe o que uma cirurgia limitou e dosa carga e movimento a partir disso. Toda aula na Vyta é conduzida por fisioterapeuta.",
  },
  {
    question: "Como é a primeira aula?",
    answer:
      "Antes da primeira aula é feita uma avaliação postural. A partir dela o exercício é dosado para o seu corpo.",
  },
  {
    question: "As aulas são em grupo?",
    answer: "Em grupos reduzidos, com aparelhos completos.",
  },
];

export const metadata: Metadata = buildMetadata({
  title: "Pilates com fisioterapeuta em São Paulo",
  description:
    "Pilates conduzido por fisioterapeutas em São Paulo. Avaliação postural antes da primeira aula, grupos reduzidos e aparelhos completos. Consolação e Pinheiros.",
  path: "/pilates",
  image: "/pilates1.jpeg",
});

export default function PilatesPage() {
  return (
    <main>
      <JsonLd
        data={[
          medicalWebPageSchema({
            title: "Pilates com fisioterapeuta",
            description:
              "Pilates conduzido por fisioterapeutas, com avaliação postural antes da primeira aula.",
            path: "/pilates",
            condition: "Reabilitação e condicionamento físico",
          }),
          faqSchema(FAQ),
          breadcrumbSchema([
            { name: "Início", path: "/" },
            { name: "Pilates", path: "/pilates" },
          ]),
        ]}
      />

      <Section tone="surface-alt">
        <nav aria-label="Trilha" className="mb-8 text-sm font-light text-subtle">
          <Link href="/" className="hover:text-accent">Início</Link>
        </nav>
        <SectionHeading
          eyebrow="Pilates"
          title={<>Pilates com <em className="italic">fisioterapeuta</em>, sempre</>}
          lead="O Pilates é um método eficaz para reabilitação e prevenção de lesões, focando no fortalecimento do core, alinhamento postural e flexibilidade. Aqui, quem conduz cada aula é fisioterapeuta."
        />
        <WhatsAppLink service="pilates" from="/pilates" className="mt-8">
          Agendar aula experimental
        </WhatsAppLink>
      </Section>

      <PilatesSection />

      <Section>
        <h2 className="font-display text-display-md text-ink">Para quem é o Pilates</h2>
        <p className="mt-6 max-w-3xl text-base font-light leading-relaxed text-muted">
          O Pilates é uma prática acessível a pessoas de todas as idades e níveis
          de condicionamento físico. É ideal para quem busca:
        </p>
        <ul className="mt-8 flex max-w-3xl flex-col gap-4">
          {BENEFITS.map((b) => (
            <li key={b} className="flex gap-4 text-base font-light leading-relaxed text-muted">
              <span className="mt-2 h-1 w-1 flex-none rounded-full bg-accent-warm" aria-hidden />
              {b}
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="surface-alt">
        <h2 className="mb-8 font-display text-display-md text-ink">Perguntas frequentes</h2>
        <FaqAccordion items={FAQ} />
      </Section>

      <Section tone="ink">
        <h2 className="font-display text-display-md text-surface">Onde praticar</h2>
        <div className="mt-8 flex flex-wrap gap-8">
          {units.map((u) => (
            <Link key={u.slug} href={`/unidades/${u.slug}`} className="text-surface/85 hover:text-accent-warm">
              <span className="font-display text-2xl">{u.shortName}</span>
              <span className="mt-1 block text-sm font-light">{u.street}</span>
            </Link>
          ))}
        </div>
        <WhatsAppLink service="pilates" from="/pilates" variant="warm" className="mt-10">
          Agendar aula experimental
        </WhatsAppLink>
      </Section>
    </main>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run build && npm run test:e2e`
Expected: `/speciality/pilates` → `/pilates` redirect test passes against a real page.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add dedicated Pilates page"
```

---

## Task 17: MDX pipeline and blog content

**Execute this task before Task 14** — Task 14's speciality pages import `getPostMeta`.

**Files:**
- Create: `lib/blog.ts`, `lib/__tests__/blog.test.ts`, `content/blog/*.mdx` (6 files)

**Interfaces:**
- Consumes: nothing
- Produces:
  - `PostMeta` = `{ slug, title, description, date, category, categoryHref, readingMinutes, image, authorSlugs, condition }`
  - `getAllPosts(): PostMeta[]` — newest first
  - `getPostMeta(slug): PostMeta | undefined`
  - `getPost(slug): { meta: PostMeta; content: string } | undefined`

- [ ] **Step 1: Install MDX dependencies**

```bash
npm i next-mdx-remote gray-matter reading-time
```

- [ ] **Step 2: Write the failing tests**

`lib/__tests__/blog.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { getAllPosts, getPostMeta, getPost } from "../blog";

describe("blog", () => {
  it("loads six posts", () => {
    expect(getAllPosts()).toHaveLength(6);
  });

  it("sorts newest first", () => {
    const dates = getAllPosts().map((p) => p.date);
    const sorted = [...dates].sort().reverse();
    expect(dates).toEqual(sorted);
  });

  it("gives every post a named author", () => {
    for (const p of getAllPosts()) {
      expect(p.authorSlugs.length).toBeGreaterThan(0);
    }
  });

  it("gives every post a description under 160 characters", () => {
    for (const p of getAllPosts()) {
      expect(p.description.length).toBeLessThanOrEqual(160);
    }
  });

  it("computes a reading time", () => {
    for (const p of getAllPosts()) {
      expect(p.readingMinutes).toBeGreaterThan(0);
    }
  });

  it("looks up one post and returns its body", () => {
    const post = getPost("fisioterapia-apos-avc");
    expect(post?.meta.title).toContain("AVC");
    expect(post?.content).toContain("##");
  });

  it("returns undefined for an unknown slug", () => {
    expect(getPostMeta("nope")).toBeUndefined();
  });
});
```

- [ ] **Step 3: Run, confirm fail**

Run: `npm test`
Expected: FAIL — `../blog` not found.

- [ ] **Step 4: Create `lib/blog.ts`**

```ts
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  category: string;
  categoryHref: string;
  readingMinutes: number;
  image: string;
  /** Slugs from content/team.ts. Never empty — E-E-A-T requires a named author. */
  authorSlugs: string[];
  condition: string;
};

function readPost(file: string) {
  const slug = file.replace(/\.mdx$/, "");
  const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
  const { data, content } = matter(raw);
  const meta: PostMeta = {
    slug,
    title: data.title,
    description: data.description,
    date: data.date,
    category: data.category,
    categoryHref: data.categoryHref,
    readingMinutes: Math.max(1, Math.round(readingTime(content).minutes)),
    image: data.image,
    authorSlugs: data.authors,
    condition: data.condition,
  };
  return { meta, content };
}

function allFiles(): string[] {
  return fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
}

export function getAllPosts(): PostMeta[] {
  return allFiles()
    .map((f) => readPost(f).meta)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostMeta(slug: string): PostMeta | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getPost(slug: string) {
  const file = `${slug}.mdx`;
  if (!allFiles().includes(file)) return undefined;
  return readPost(file);
}
```

- [ ] **Step 5: Convert the six cartilhas to MDX**

Source: `/Users/gustavo.mendes/Downloads/blog/*.docx`. Extract text with:

```bash
python3 -c "
import zipfile,re,sys
z=zipfile.ZipFile(sys.argv[1]); xml=z.read('word/document.xml').decode('utf8')
xml=re.sub(r'</w:p>','\n',xml); print(re.sub(r'<[^>]+>','',xml))
" "/Users/gustavo.mendes/Downloads/blog/Cartilha AVC.docx"
```

Each cartilha's section headings become `##`. Lines of the form `Termo: explicação` inside a list become `- **Termo:** explicação`. Preserve wording exactly — this is clinical copy, do not paraphrase.

Create these six files with this frontmatter. **Authorship for the last three is provisional** (spec §12 item 1) — mark it with the comment shown.

| File | title | date | category | categoryHref | image | authors | condition |
|---|---|---|---|---|---|---|---|
| `fisioterapia-apos-avc.mdx` | Fisioterapia após AVC: o que esperar da reabilitação | 2026-02-19 | Neurofuncional | `/especialidades/fisioterapia-neurologica` | `/neuro.webp` | `[vyvyan-maximo-andrade]` | Acidente Vascular Encefálico |
| `fisioterapia-respiratoria-dpoc.mdx` | DPOC: como a fisioterapia respiratória ajuda | 2026-03-11 | Respiratória | `/especialidades/fisioterapia-respiratoria` | `/resp.webp` | *provisional* | Doença Pulmonar Obstrutiva Crônica |
| `fisioterapia-oncologica-tratamento-cancer.mdx` | Fisioterapia durante o tratamento do câncer | 2026-04-08 | Oncológica | `/especialidades/fisioterapia-oncologica` | `/onco.webp` | `[taina-horacio-peixoto]` | Câncer |
| `fisioterapia-doencas-cardiovasculares.mdx` | Doenças cardiovasculares e reabilitação | 2026-05-14 | Cardiovascular | `/especialidades` | `/cond.webp` | *provisional* | Doenças Cardiovasculares |
| `fisioterapia-incontinencia-urinaria.mdx` | Incontinência urinária tem tratamento | 2026-06-23 | Assoalho pélvico | `/especialidades` | `/drenagem.webp` | *provisional* | Incontinência Urinária |
| `fisioterapia-cuidados-paliativos.mdx` | Fisioterapia em cuidados paliativos | 2026-07-21 | Cuidados paliativos | `/especialidades/fisioterapia-oncologica` | `/geronto.webp` | `[taina-horacio-peixoto]` | Cuidados Paliativos |

For the three marked *provisional*, use both authors and leave this comment directly above the frontmatter key:

```yaml
# AUTORIA PROVISÓRIA — nenhuma das duas tem residência nesta área.
# Confirmar com a clínica antes do lançamento. Spec §12 item 1.
authors: [vyvyan-maximo-andrade, taina-horacio-peixoto]
```

Frontmatter shape:

```yaml
---
title: "Fisioterapia após AVC: o que esperar da reabilitação"
description: "O que é o AVC, como identificar os sinais e qual o papel da fisioterapia na recuperação da função motora e da autonomia."
date: "2026-02-19"
category: "Neurofuncional"
categoryHref: "/especialidades/fisioterapia-neurologica"
image: "/neuro.webp"
authors: [vyvyan-maximo-andrade]
condition: "Acidente Vascular Encefálico"
---
```

Keep every `description` at 160 characters or fewer — Task 17's test enforces it.

- [ ] **Step 6: Run tests, confirm pass**

Run: `npm test`
Expected: PASS, 41 tests.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add MDX blog pipeline and six condition guides

Authorship for the DPOC, cardiovascular and incontinence guides is
provisional — flagged in frontmatter, needs clinical confirmation."
```

---

## Task 18: Blog index, post pages and landing teasers

**Files:**
- Create: `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, `components/sections/BlogTeasers.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `getAllPosts`, `getPost`, `getPostMeta`, `articleSchema`, `Prose`
- Produces: `/blog`, 6 post routes, and a 3-up teaser section on the landing page.

- [ ] **Step 1: Create `app/blog/page.tsx`**

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/JsonLd";
import { getAllPosts } from "@/lib/blog";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = buildMetadata({
  title: "Conteúdo",
  description:
    "Guias sobre reabilitação escritos por fisioterapeutas: AVC, câncer, DPOC, doenças cardiovasculares, incontinência urinária e cuidados paliativos.",
  path: "/blog",
});

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <main>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Início", path: "/" },
          { name: "Conteúdo", path: "/blog" },
        ])}
      />
      <Section tone="surface-alt">
        <SectionHeading
          eyebrow="Conteúdo"
          title="O que a gente escreve entre as sessões"
          lead="Guias sobre as condições que mais aparecem na clínica, escritos por quem atende."
        />
      </Section>

      <Section>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 80} as="article">
              <Link href={`/blog/${p.slug}`} className="group block text-ink">
                <div className="mb-5 h-56 overflow-hidden">
                  <Image
                    src={p.image}
                    alt={p.title}
                    width={640}
                    height={420}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </div>
                <div className="mb-3 text-[11px] uppercase tracking-eyebrow text-subtle">
                  {p.category} · {p.readingMinutes} min
                </div>
                <h2 className="mb-2 font-display text-2xl leading-tight group-hover:text-accent">
                  {p.title}
                </h2>
                <p className="text-[15px] font-light leading-relaxed text-muted">
                  {p.description}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>
    </main>
  );
}
```

- [ ] **Step 2: Create `app/blog/[slug]/page.tsx`**

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Section } from "@/components/ui/Section";
import { Prose } from "@/components/ui/Prose";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { JsonLd } from "@/components/JsonLd";
import { getAllPosts, getPost } from "@/lib/blog";
import { getMember } from "@/content/team";
import { buildMetadata } from "@/lib/seo";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return buildMetadata({
    title: post.meta.title,
    description: post.meta.description,
    path: `/blog/${post.meta.slug}`,
    image: post.meta.image,
    type: "article",
  });
}

const FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const { meta, content } = post;
  const authors = meta.authorSlugs.map(getMember).filter(Boolean);
  const published = FORMATTER.format(new Date(`${meta.date}T00:00:00Z`));

  return (
    <main>
      <JsonLd
        data={[
          articleSchema({
            title: meta.title,
            description: meta.description,
            slug: meta.slug,
            date: meta.date,
            image: meta.image,
            authorSlugs: meta.authorSlugs,
          }),
          breadcrumbSchema([
            { name: "Início", path: "/" },
            { name: "Conteúdo", path: "/blog" },
            { name: meta.title, path: `/blog/${meta.slug}` },
          ]),
        ]}
      />

      <Section tone="surface-alt">
        <nav aria-label="Trilha" className="mb-8 text-sm font-light text-subtle">
          <Link href="/" className="hover:text-accent">Início</Link>
          <span className="mx-2" aria-hidden>/</span>
          <Link href="/blog" className="hover:text-accent">Conteúdo</Link>
        </nav>
        <div className="mb-4 text-[11px] uppercase tracking-eyebrow text-subtle">
          <Link href={meta.categoryHref} className="hover:text-accent">{meta.category}</Link>
          {" · "}
          {meta.readingMinutes} min de leitura
        </div>
        <h1 className="max-w-3xl font-display text-display-lg text-balance text-ink">
          {meta.title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg font-light leading-relaxed text-muted">
          {meta.description}
        </p>

        {/* E-E-A-T: named author with CREFITO and a visible review date. */}
        <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-line pt-6">
          {authors.map((a) => (
            <div key={a!.slug} className="flex items-center gap-3">
              <Image src={a!.image} alt={a!.name} width={44} height={44} className="h-11 w-11 rounded-full object-cover object-top" />
              <div>
                <div className="text-[15px] text-ink">{a!.name}</div>
                <div className="text-[13px] font-light text-subtle">{a!.crefito}</div>
              </div>
            </div>
          ))}
          <div className="text-[13px] font-light text-subtle">Revisado em {published}</div>
        </div>
      </Section>

      <Section>
        <div className="mb-12 max-h-[28rem] overflow-hidden">
          <Image src={meta.image} alt={meta.title} width={1280} height={720} priority sizes="100vw" className="w-full object-cover" />
        </div>
        <Prose>
          <MDXRemote source={content} />
        </Prose>

        <div className="mt-16 border-t border-line pt-10">
          <p className="mb-6 max-w-2xl text-lg font-light leading-relaxed text-muted">
            Se algo aqui descreve o que você está vivendo, conta pra gente. A
            avaliação define o que faz sentido no seu caso.
          </p>
          <WhatsAppLink service={meta.slug} from={`/blog/${meta.slug}`}>
            Falar com uma fisioterapeuta
          </WhatsAppLink>
        </div>
      </Section>
    </main>
  );
}
```

- [ ] **Step 3: Create `components/sections/BlogTeasers.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { getAllPosts } from "@/lib/blog";

export function BlogTeasers() {
  const posts = getAllPosts().slice(0, 3);

  return (
    <Section id="conteudo">
      <div className="mb-14 flex flex-wrap items-end justify-between gap-8">
        <SectionHeading className="max-w-2xl" eyebrow="Conteúdo" title="O que a gente escreve entre as sessões" />
        <Link href="/blog" className="text-[15px] text-accent hover:text-accent-deep">
          Ver todos os textos →
        </Link>
      </div>
      <div className="grid gap-10 md:grid-cols-3">
        {posts.map((p, i) => (
          <Reveal key={p.slug} delay={i * 80} as="article">
            <Link href={`/blog/${p.slug}`} className="group block text-ink">
              <div className="mb-5 h-56 overflow-hidden">
                <Image
                  src={p.image}
                  alt={p.title}
                  width={640}
                  height={420}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </div>
              <div className="mb-3 text-[11px] uppercase tracking-eyebrow text-subtle">
                {p.category} · {p.readingMinutes} min
              </div>
              <h3 className="mb-2 font-display text-2xl leading-tight group-hover:text-accent">
                {p.title}
              </h3>
              <p className="text-[15px] font-light leading-relaxed text-muted">{p.description}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 4: Add `<BlogTeasers />` to `app/page.tsx`** between `<PullQuote />` and `<UnidadesSection />`.

- [ ] **Step 5: Verify**

Run: `npm test && npm run build`
Expected: 6 post routes appear in the build output as static.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add blog index, post pages and landing teasers"
```

---

## Task 19: Sitemap, robots and OpenGraph image

**Files:**
- Create: `app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.tsx`, `lib/__tests__/sitemap.test.ts`

**Interfaces:**
- Consumes: `specialities`, `units`, `getAllPosts`, `clinic`
- Produces: `/sitemap.xml`, `/robots.txt`, `/opengraph-image`.

- [ ] **Step 1: Write the failing test**

`lib/__tests__/sitemap.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";
import { clinic } from "@/content/clinic";

describe("sitemap", () => {
  const entries = sitemap();
  const urls = entries.map((e) => e.url);

  it("lists every static route", () => {
    expect(urls).toContain(clinic.siteUrl);
    expect(urls).toContain(`${clinic.siteUrl}/pilates`);
    expect(urls).toContain(`${clinic.siteUrl}/especialidades`);
    expect(urls).toContain(`${clinic.siteUrl}/unidades`);
    expect(urls).toContain(`${clinic.siteUrl}/blog`);
  });

  it("lists all seven specialities, two units and six posts", () => {
    expect(urls.filter((u) => u.includes("/especialidades/"))).toHaveLength(7);
    expect(urls.filter((u) => u.includes("/unidades/"))).toHaveLength(2);
    expect(urls.filter((u) => u.includes("/blog/"))).toHaveLength(6);
  });

  it("never lists the conversion redirect", () => {
    expect(urls).not.toContain(`${clinic.siteUrl}/whatsapp`);
  });

  it("emits absolute URLs only", () => {
    for (const u of urls) expect(u.startsWith("https://")).toBe(true);
  });
});
```

- [ ] **Step 2: Run, confirm fail**

Run: `npm test`
Expected: FAIL — `@/app/sitemap` not found.

- [ ] **Step 3: Create `app/sitemap.ts`**

`/whatsapp` is deliberately excluded — it is a redirect, not a page, and listing it would invite Google to crawl the conversion route.

```ts
import type { MetadataRoute } from "next";
import { clinic } from "@/content/clinic";
import { specialities } from "@/content/specialities";
import { units } from "@/content/units";
import { getAllPosts } from "@/lib/blog";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (p: string) => (p === "/" ? clinic.siteUrl : `${clinic.siteUrl}${p}`);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: url("/"), priority: 1 },
    { url: url("/pilates"), priority: 0.9 },
    { url: url("/especialidades"), priority: 0.8 },
    { url: url("/unidades"), priority: 0.8 },
    { url: url("/blog"), priority: 0.7 },
  ];

  return [
    ...staticRoutes,
    ...specialities.map((s) => ({ url: url(`/especialidades/${s.slug}`), priority: 0.8 })),
    ...units.map((u) => ({ url: url(`/unidades/${u.slug}`), priority: 0.9 })),
    ...getAllPosts().map((p) => ({
      url: url(`/blog/${p.slug}`),
      lastModified: new Date(`${p.date}T00:00:00Z`),
      priority: 0.6,
    })),
  ];
}
```

- [ ] **Step 4: Create `app/robots.ts`**

```ts
import type { MetadataRoute } from "next";
import { clinic } from "@/content/clinic";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/whatsapp" },
    sitemap: `${clinic.siteUrl}/sitemap.xml`,
  };
}
```

- [ ] **Step 5: Create `app/opengraph-image.tsx`**

```tsx
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Vyta Fisioterapia e Pilates";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#2C3A3D",
          color: "#FAF6F0",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ width: 64, height: 1, background: "#db7f66", marginBottom: 32 }} />
        <div style={{ fontSize: 68, letterSpacing: -1 }}>Vyta</div>
        <div
          style={{
            fontSize: 22,
            letterSpacing: 8,
            textTransform: "uppercase",
            marginTop: 16,
            opacity: 0.85,
          }}
        >
          Fisioterapia &amp; Pilates
        </div>
        <div style={{ fontSize: 24, marginTop: 40, opacity: 0.7 }}>
          Consolação · Pinheiros · São Paulo
        </div>
      </div>
    ),
    size,
  );
}
```

- [ ] **Step 6: Run tests and build**

Run: `npm test && npm run build`
Expected: PASS, 45 tests. Then `npm run start` and confirm `/sitemap.xml`, `/robots.txt` and `/opengraph-image` all render.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add sitemap, robots and OpenGraph image"
```

---

## Task 20: Image optimisation and asset cleanup

**Files:**
- Modify: `public/*`

**Interfaces:**
- Consumes: nothing
- Produces: smaller source images. No API change.

- [ ] **Step 1: Measure the current weight**

```bash
ls -lS public/*.jpg public/*.jpeg public/*.webp | head -20
du -sh public
```

- [ ] **Step 2: Convert the oversized JPEGs**

`sharp` is already a dependency. The hero (`pilates3.jpeg`) is full-bleed and matters most.

```bash
node -e "
const sharp = require('sharp');
const fs = require('fs');
const files = fs.readdirSync('public').filter(f => /\.(jpe?g)$/i.test(f));
Promise.all(files.map(async f => {
  const out = 'public/' + f.replace(/\.(jpe?g)$/i, '.webp');
  await sharp('public/' + f).resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 82 }).toFile(out);
  console.log(f, '->', out);
})).catch(e => { console.error(e); process.exit(1); });
"
```

- [ ] **Step 3: Update every reference from `.jpeg`/`.jpg` to `.webp`**

```bash
grep -rln "\.jpe\?g" app components content | xargs sed -i '' -E 's/\.(jpeg|jpg)"/.webp"/g'
grep -rn "\.jpe\?g" app components content || echo "no remaining references"
```

Files referencing images: `components/sections/Hero.tsx` (`pilates3`), `PilatesSection.tsx` (`pilates1`, `pilates2`, `pilates4`), `ContactCTA.tsx` (`sala3`), `EspecialidadesGrid.tsx` (`pilates4`), `content/units.ts` (`sala2`, `sala4`).

- [ ] **Step 4: Delete the superseded originals**

```bash
git rm public/*.jpeg public/*.jpg
```

- [ ] **Step 5: Remove other dead assets**

`LOGOTIPO 001/003/004/005/006.webp` and `adore.otf` are unreferenced after the redesign. Verify before deleting:

```bash
for f in "LOGOTIPO 001" "LOGOTIPO 003" "LOGOTIPO 004" "LOGOTIPO 005" "LOGOTIPO 006"; do
  echo "== $f"; grep -rn "$f" app components content || echo "  unreferenced";
done
grep -rn "adore" app components content public/site.webmanifest || echo "adore.otf unreferenced"
```

Delete only what reports unreferenced. **Keep `LOGOTIPO 002.webp`** — the `Logo` mask depends on it. Keep all favicon assets.

- [ ] **Step 6: Verify and measure**

Run: `npm run build && du -sh public`
Then `npm run start` and confirm every image renders on `/`, `/pilates`, both unit pages and one blog post.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "perf: convert photography to WebP and drop unreferenced assets"
```

---

## Task 21: Accessibility and motion audit

**Files:**
- Create: `e2e/accessibility.spec.ts`
- Modify: whatever the audit surfaces

**Interfaces:**
- Consumes: every route
- Produces: an E2E suite asserting one `<h1>` per page, image alt text, and lang.

- [ ] **Step 1: Install the axe integration**

```bash
npm i -D @axe-core/playwright
```

- [ ] **Step 2: Write the failing accessibility test**

`e2e/accessibility.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = [
  "/",
  "/pilates",
  "/especialidades",
  "/especialidades/fisioterapia-neurologica",
  "/unidades",
  "/unidades/consolacao",
  "/blog",
  "/blog/fisioterapia-apos-avc",
];

for (const route of ROUTES) {
  test(`${route} has no critical or serious axe violations`, async ({ page }) => {
    await page.goto(route);
    // wcag22aa included deliberately: it carries the `target-size` rule, which
    // is the site-wide guard for the 44px tap-target floor. WhatsAppLink's
    // `bare` variant enforces no minimum of its own (Task 8, parked finding),
    // so this is where an undersized CTA gets caught.
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );
    expect(blocking, JSON.stringify(blocking.map((v) => v.id))).toEqual([]);
  });

  test(`${route} has exactly one h1 and declares pt-BR`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  });

  test(`${route} has alt text on every image`, async ({ page }) => {
    await page.goto(route);
    const missing = await page.locator("img:not([alt])").count();
    expect(missing).toBe(0);
  });
}
```

- [ ] **Step 3: Run it**

Run: `npm run test:e2e`
Expected: some failures. Fix each — likely candidates are the decorative `·` separators (need `aria-hidden`), the map iframe title, and contrast on `text-surface/75` over the ink background.

- [ ] **Step 4: Test reduced motion, viewports and keyboard with Playwright**

**Do not drive a browser by hand.** Playwright emulates all three deterministically in seconds. Add `e2e/motion-and-viewport.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("all revealed content is visible immediately", async ({ page }) => {
    await page.goto("/");
    const hidden = await page
      .locator('[data-revealed]')
      .evaluateAll((els) =>
        els.filter((e) => getComputedStyle(e).opacity !== "1").length,
      );
    expect(hidden).toBe(0);
  });
});

test.describe("no javascript", () => {
  test.use({ javaScriptEnabled: false });

  test("revealed content is still visible", async ({ page }) => {
    await page.goto("/");
    const hidden = await page
      .locator('[data-revealed]')
      .evaluateAll((els) =>
        els.filter((e) => getComputedStyle(e).opacity !== "1").length,
      );
    expect(hidden).toBe(0);
  });
});

const VIEWPORTS = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

for (const vp of VIEWPORTS) {
  test(`no horizontal overflow at ${vp.name} (${vp.width}px)`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow, `horizontal scrollbar at ${vp.width}px`).toBe(false);
  });
}

test("mobile menu opens, traps focus, and closes on Escape", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Abrir menu" });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(dialog.locator(":focus")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});
```

- [ ] **Step 5: Run it**

Run: `npm run test:e2e`
Expected: PASS. The no-horizontal-overflow assertion is the highest-value one — it catches the most common responsive regression, on a design whose comp had no responsive rules at all.

- [ ] **Step 6: Re-run and commit**

Run: `npm run test:e2e`
Expected: all pass.

```bash
git add -A
git commit -m "fix: resolve accessibility violations and add axe E2E suite"
```

---

## Task 22: Final verification and handoff

**Files:**
- Create: `e2e/gtm-classes.spec.ts`, `docs/redesign-verificacao.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: everything
- Produces: the conversion-class guard and a manual verification checklist for Gustavo.

- [ ] **Step 1: Write the GTM class guard**

This is the direct guard on the spec's highest-severity risk. It asserts the classes GTM keys on are present on every page.

`e2e/gtm-classes.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

const ROUTES = [
  "/",
  "/pilates",
  "/especialidades",
  "/especialidades/fisioterapia-neurologica",
  "/unidades",
  "/unidades/consolacao",
  "/blog",
  "/blog/fisioterapia-apos-avc",
];

for (const route of ROUTES) {
  test(`${route} carries every GTM conversion class`, async ({ page }) => {
    await page.goto(route);
    for (const cls of [
      "redirect-whatsapp",
      "redirect-phone",
      "redirect-email",
      "redirect-instagram",
    ]) {
      expect(await page.locator(`.${cls}`).count(), cls).toBeGreaterThan(0);
    }
  });

  test(`${route} points every WhatsApp CTA at /whatsapp`, async ({ page }) => {
    await page.goto(route);
    const hrefs = await page.locator(".redirect-whatsapp").evaluateAll((els) =>
      els.map((e) => e.getAttribute("href")),
    );
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) expect(href).toBe("/whatsapp");
  });
}

test("GTM container is present", async ({ page }) => {
  await page.goto("/");
  const html = await page.content();
  expect(html).toContain("GTM-NNBD3887");
});
```

- [ ] **Step 2: Run the full suite**

Run: `npm run typecheck && npm test && npm run build && npm run test:e2e`
Expected: everything green. Fix anything that is not.

- [ ] **Step 3: Update `README.md`**

Replace the stock Next.js example text with something true about this repo:

```markdown
# Vyta Fisioterapia e Pilates

Site da clínica — Next.js (App Router), TypeScript, Tailwind.

## Desenvolvimento

    npm install
    npm run dev

## Verificação

    npm run typecheck   # tipos
    npm test            # unidade (Vitest)
    npm run test:e2e    # E2E (Playwright, roda build + start)

## Restrições que não podem quebrar

- `/whatsapp` é o evento de conversão do Google Ads. Não mude a URL.
- As classes `.redirect-whatsapp`, `.redirect-phone`, `.redirect-email` e
  `.redirect-instagram` são lidas pelo GTM. `e2e/gtm-classes.spec.ts` guarda isso.
- Todo CTA de WhatsApp usa `components/WhatsAppLink.tsx`. Nunca link direto.
- Dados de contato e endereços vivem em `content/clinic.ts` e `content/units.ts`.
  São a fonte única do NAP e alimentam o JSON-LD.

## Conteúdo

Posts em `content/blog/*.mdx`. Especialidades em `content/specialities.ts`.
```

- [ ] **Step 4: Write `docs/redesign-verificacao.md`**

The manual checklist Gustavo runs against the preview deploy — the automated suite cannot cover these.

```markdown
# Verificação do redesign — checklist de pré-produção

Rodar contra a URL de preview da Vercel, antes de promover para produção.

## Conversão — bloqueia o lançamento

- [ ] GTM Preview conectado à URL de preview
- [ ] Clicar em "Agendar" no hero → confirmar page load em `/whatsapp` no GTM
- [ ] Confirmar que a tag `Contato por WhatsApp` disparou
- [ ] Repetir a partir do FAB, do nav, do menu mobile e de uma página de especialidade
- [ ] Confirmar o redirect final para `wa.me/message/FJNBBFEBI6V5O1`

## URLs — bloqueia o lançamento

- [ ] Abrir cada uma das 8 URLs antigas `/speciality/*` e confirmar 301/308
- [ ] Confirmar que nenhuma retorna 404
- [ ] `/sitemap.xml` lista 20 URLs e nenhuma delas é `/whatsapp`
- [ ] `/robots.txt` aponta para o sitemap

## SEO

- [ ] Rich Results Test em `/`, `/unidades/consolacao`, uma especialidade e um post
- [ ] Confirmar `Physiotherapy`, `FAQPage`, `BreadcrumbList` e `Article` sem erro
- [ ] Cada página tem title e meta description próprios
- [ ] Lighthouse ≥ 90 em Performance e 100 em SEO na landing

## Conteúdo — bloqueia o lançamento

- [ ] Vyvyan e Tainá revisaram todo o texto da landing
- [ ] Revisaram as 7 páginas de especialidade
- [ ] Revisaram os 6 posts
- [ ] Confirmaram a citação sobre não atender plano de saúde
- [ ] Confirmaram "1:1", "100% das aulas com fisioterapeuta" e "8 especialidades"
- [ ] Definiram a autoria de DPOC, Cardiovasculares e Incontinência
- [ ] Confirmaram telefone, e-mail, os dois endereços e os CEPs
- [ ] Forneceram o horário de funcionamento (preencher `openingHours` em `content/units.ts`)

## Depois do deploy

- [ ] Submeter o sitemap no Search Console
- [ ] Solicitar indexação das páginas de unidade
- [ ] Acompanhar conversões no Ads por 7 dias
- [ ] Oscilação de ranking por 2–4 semanas é esperada — não reverter
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test: add GTM conversion-class guard; document verification checklist"
```

- [ ] **Step 6: Stop here**

Do **not** merge and do **not** deploy. Report to Gustavo:
- full test output,
- the route list from `npm run build`,
- what remains blocked on clinical review (spec §12).

---

## Self-Review

**Spec coverage:**

| Spec section | Task |
|---|---|
| §3.1 conversion route | 3, 22 |
| §3.2 GTM classes | 8, 10, 22 |
| §3.3 clinical review gate | 22 |
| §4 routes | 3, 12, 14, 15, 16, 18 |
| §4.1 redirects | 3 |
| §4.2 unit pages | 15 |
| §5.1 metadata, sitemap, robots | 7, 19 |
| §5.2 structured data | 6 |
| §5.3 E-E-A-T, content depth | 12, 17, 18 |
| §5.4 internal linking | 14, 15, 18 |
| §6.1 tokens, contrast exception | 4 |
| §6.2 typography | 4 |
| §6.3 responsive | 9–18 |
| §7 components | 8, 9, 10 |
| §7.1 WhatsAppLink | 8 |
| §7.2 dependencies | 3, 10, 14, 17 |
| §8.1 CSS-only motion | 9 |
| §8.2 accessibility | 4, 21 |
| §8.3 performance | 4, 11, 20 |
| §9.1 blog | 17, 18 |
| §9.2 team, rita.jpeg | 5 |
| §10 verification | 21, 22 |
| §12 open questions | 5, 15, 17 (flagged in code) |

No gaps.

**Ordering correction:** Task 14 imports `getPostMeta` from Task 17. **Execute 17 before 14.** Suggested order: 1 → 13, then 17, then 14, 15, 16, 18 → 22.

**Type consistency:** `PostMeta.authorSlugs` matches `articleSchema`'s `authorSlugs` (Task 6). `Speciality.slug` values match `generateStaticParams` and the redirect map. `Unit.openingHours` is `OpeningHours[] | null` in both `content/units.ts` and `unitSchema`. `WhatsAppLink`'s `variant` union matches its call sites (`primary`, `warm`, `teal`, `bare`).
