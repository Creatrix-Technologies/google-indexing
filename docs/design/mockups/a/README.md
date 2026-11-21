# Mockup A: Mission Control

Standalone static mockup. No build step, no network requests. Open `index.html` directly in a browser.

Follows `docs/design/brief.md`; copy is taken verbatim from `docs/design/content.json`.

## Pages

| File | Screen |
|------|--------|
| `index.html` | Home, full scroll, all seven story beats, live pipeline hero |
| `pricing.html` | Free plan plus placeholder paid cards, quota note, FAQ |
| `signup.html` | Signup, shows the `?plan=` value (default `trial`) |
| `checker-result.html` | Checker with two example results: can be indexed, and blocked |
| `dashboard.html` | Logged-in dashboard: status counts, coverage ring, quota |
| `crawl-index.html` | Per-URL status table, working status filters, queue priority |
| `sites.html` | Site management, add site, Google connection |
| `first-run.html` | Empty state to first win (buttons advance the steps) |

Shared files: `shared.css` (all styles and tokens) and `shared.js` (header, footer, theme toggle, mobile menu, pipeline demo, filters, stepper).

## Notes

- CTAs link to `signup.html?plan=trial`; in the real app this is `/signup?plan=trial`. Footer legal links point at the real `/terms` and `/privacy` routes, so they will not resolve when opened as files.
- Paid plan names and prices are not in the repo (live from the API). Pricing uses visible placeholder tokens such as `{{plan.amount}}`, never invented prices.
- All URLs, counts, the chart and the coverage ring are labelled sample or illustration data. No testimonials or stats.
- Theme: dark by default, follows the system light preference until the toggle is used; the choice is stored in `localStorage` (wrapped in try/catch).
- Motion: with `prefers-reduced-motion`, the hero pipeline renders a static state and all CSS animation and transitions are off. Hero text and CTAs are never animated.

## Design tokens

Defined on `:root` in `shared.css`; light values override under `:root[data-theme="light"]`.

| Token | Dark | Light | Use |
|-------|------|-------|-----|
| `--bg` | `#07080c` | `#f5f6fb` | page |
| `--surface` / `--surface-2` | `#0d0f16` / `#141722` | `#ffffff` / `#eceef8` | cards, inputs |
| `--line` | `#262b3d` | `#cfd3e6` | borders |
| `--text` / `--muted` | `#eef0f6` / `#a3aabf` | `#0e1020` / `#444a63` | text |
| `--accent` | `#c6ff3d` electric lime | `#4338ca` indigo | primary button, highlights |
| `--accent-ink` | `#0a0c06` | `#ffffff` | text on accent |
| `--indigo` | `#6366f1` | `#4338ca` | glow, eyebrow, focus |
| `--st-queued` / `-submitted` / `-indexed` / `-not` | `#b4bacb` / `#a5a8ff` / `#c6ff3d` / `#ffb86b` | `#475069` / `#3730a3` / `#3f6212` / `#9a3412` | status pills (always icon + label) |

Type: system sans for UI, system monospace (`--mono`) for URLs, status pills, numbers and eyebrows. Shape: 12px controls, 18px cards, 44px minimum tap targets. Background: faint 44px grid plus indigo and lime radial glows.

Logo: inline SVG mark (dark tile, indigo ring, lime arc and dot, a coverage ring) with the wordmark "Google" (regular) + "Indexing" (bold, accent) + ".com" (mono, muted).

## Checked

Headless Chromium, both themes, at 1440px and 390px, all 8 pages: no horizontal scroll, no console errors, text contrast AA (4.5:1, 3:1 for large text). Also checked: theme toggle, mobile menu, reduced-motion static pipeline, pipeline animation, crawl-index filters, first-run flow.
