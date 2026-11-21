# Mockup C: Try-First, restrained

Replaces Mockup A's direction. The design is calm, light and product-grade. The page leads with the free checker, and everything else stays out of its way.

Static HTML plus `shared.css` and `shared.js`. It makes no external requests: no fonts, no CDNs, no images. Open `index.html` directly in a browser.

| Page | What it shows |
|---|---|
| `index.html` | Five sections: checker hero, how it works, product screenshot, pricing summary, FAQ. Then the footer. |
| `checker-result.html` | A blocked result with a fix for each check, then one "Start free" carrying `?url=` |
| `signup.html` | Continue with Google first, then email and password |
| `pricing.html` | The Free plan in full; paid plans as "Loaded live" skeleton cards |
| `dashboard.html` | Status totals, recent pages, today's submissions out of 200 |
| `crawl-index.html` | Status filter, priority select, row selection (cleared whenever the filter changes), Submit selected |
| `sites.html` | Site summary, add a site (limited by the plan), Google connection |
| `first-run.html` | Three-step stepper that ends with the first submitted page |

## Tokens

| Token | Value | Use |
|---|---|---|
| `--bg` | `#ffffff` | Page |
| `--surface` | `#f6f8fa` | Near-white panels, footer, app nav |
| `--border` | `#d8dee4` | All dividers and borders |
| `--text` | `#1f2328` | Body text (15.8:1) |
| `--muted` | `#57606a` | Secondary text (6.4:1 on white, 6.0:1 on surface) |
| `--accent` | `#1f5fbf` | **Only** primary buttons, links and focus rings (6.0:1; white on accent 6.0:1) |
| `--accent-hover` | `#184c99` | Hover |
| `--st-queued` | `#57606a` | Status only, hollow dot |
| `--st-submitted` | `#8a5a00` | Status only, dot |
| `--st-indexed` | `#1a7f37` | Status only, dot |
| `--st-not` | `#c4281c` | Status only, square |
| `--font` | system-ui stack | Everything |
| `--mono` | ui-monospace stack | URLs only |
| `--fs-1` / `--fs-2` / `--fs-3` | 32px (28px under 640px) / 20px / 16px | The only three sizes |
| `--s1`…`--s12` | 8, 16, 24, 32, 48, 64, 96px | 8px spacing grid |
| `--radius` | 8px | Every corner (circles only for step numbers and status dots) |
| `--tap` | 48px | Minimum height of buttons, inputs and nav links |

Every status label is a dot or square plus a text label, so meaning never depends on colour alone. There is no dark theme, because the brief makes it optional and the light theme is the product.

## Self-check against the hard rules

`python selfcheck.py` (needs Playwright) runs every page at 1440×900, 390×844 and 375×812 and rewrites `screenshots/`. Results from the last run:

| Rule | Result |
|---|---|
| Light theme, white background | ✅ `--bg #fff`, `color-scheme: light` |
| One calm-blue accent, used for primary actions and links only; status colours only for status | ✅ `--accent` is used in `.btn-primary`, `a`, focus and checkbox `accent-color` only. The quota meter is neutral, not accent. |
| No glows, gradients, grid, neon, glassmorphism, animated demos, pill badges, mono eyebrows | ✅ The script greps `shared.css` for gradient, box-shadow, backdrop-filter, animation, keyframes and transition: none found. No eyebrows, no badges. Monospace only on `.url`, `code` and URL inputs. |
| System sans, max 3 sizes per screen | ✅ Measured on all 8 pages at all 3 widths: at most `[16, 20, 32]` (`[16, 20, 28]` on mobile) |
| 8px grid, 8px radius | ✅ All spacing tokens are multiples of 8. Radii are `var(--radius)`, `0` (status square) or `50%` (dots). |
| Hero = checker, headline under 8 words, one sentence, input + "Check page" above the fold, one secondary Start free link | ✅ "Can Google index your page?" (5 words). The button bottom sits at 289px of 900 (1440×900) and 359px of 844 (390×844). See `screenshots/index-*-fold.png`. |
| Homepage max 5 sections + footer | ✅ 5: hero/checker, how it works (3 steps), dashboard screenshot, pricing summary, FAQ |
| FAQ max 5 | ✅ 5 |
| Each fact once: trial line once, Indexing API caveat only in FAQ + footer | ✅ "14-day trial" ×1 (pricing summary). "JobPosting" ×2 (FAQ and footer). |
| One primary CTA per section, "Start free" ≤ 3 on the homepage | ✅ Primary buttons per section: `[1, 0, 0, 1, 0]`. "Start free" ×3: header (secondary), hero link, Free plan. |
| No engineering-feature cards; benefits only | ✅ No retries, locks, Playwright or streams |
| Pricing: real structure, no `{{tokens}}` in view | ✅ The Free plan is real. Paid cards are skeletons labelled "Loaded live" with `aria-busy`. No `{{` anywhere in the markup. |
| Copy cut by at least half vs A | ✅ Homepage `main` text: A 1,126 words, C 312 words (28%). Facts come from `docs/design/content.json`. |
| AA contrast | ✅ Every visible text node is computed against its effective background: 0 failures |
| 44px targets | ✅ Every button, input, select, summary and non-inline link is at least 44×44. Inline links in sentences fall under the WCAG 2.5.8 inline exception. Checkboxes sit in a 48px label hit area. |
| Visible focus | ✅ 2px accent outline on `:focus-visible` everywhere, plus a skip link |
| 375px, no horizontal scroll | ✅ `scrollWidth <= clientWidth` on all 8 pages at 375 and 390. Tables collapse to labelled rows. |
| No external requests | ✅ 0 non-`file://` requests on every page |

## Screenshots

`screenshots/<page>-1440.png` and `screenshots/<page>-390.png` are full pages for all 8 pages. `index-1440-fold.png` and `index-390-fold.png` show the first viewport. Interactive states captured: first FAQ item open (index), "Not indexed" filter with one row selected (crawl-index), and the stepper completed (first-run).

## Notes for implementation

- The paid plan cards render from `/payments/public-subscription-plans`, as today. The skeleton is the loading state, not a design for missing data.
- The checker CTA keeps `?plan=trial&url=…` (R3M-T07).
- Signup matches R3M-T06: Google first, email and password only.
