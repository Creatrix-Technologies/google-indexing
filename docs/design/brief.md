# Redesign brief (R3M)

Shared by all three mockups. Copy lives in `docs/design/content.json` and must be used verbatim. Do not rewrite it per mockup.

## Goal

Make a visitor understand in seconds that GoogleIndexing.com shows which of their pages are in Google, then get them to **Start free** (`/signup?plan=trial`).

## Rebrand rules

Full rebrand is allowed: name styling, logo mark, palette, type, motion language.

Fixed, not up for change:
- Domain name `GoogleIndexing.com` (styling of the wordmark may change; the words may not).
- The independence disclaimer in the footer (`content.json` `brand.disclaimer`).
- Do not imitate Google's logo, colours or SERP branding closely enough to imply affiliation. A fake SERP (direction B) must be generic and labelled as an illustration.
- All existing routes, plan prices (live from the API) and the `?plan=trial` parameter.

## Story arc (every mockup follows this order)

| # | Beat | Message | Content id |
|---|------|---------|-----------|
| 1 | Pain | Published pages are not in Google | `pain` |
| 2 | Reveal | The free checker shows which can and cannot be indexed | `reveal` |
| 3 | Mechanism | Crawl, submit via the official Indexing API, verify at 1/3/7 days via URL Inspection | `mechanism` |
| 4 | Proof | Coverage chart from not indexed to indexed | `proof` |
| 5 | Trust | Official API, your own Google Cloud quota | `trust` |
| 6 | Offer | 14-day trial, 100 URLs, no card, then 50/mo | `offer` |
| 7 | CTA | Start free, repeated at each peak | `cta` |

### Proof and trust: hard rules
- **No invented testimonials, customer names or logos, user counts, ratings, or stats.**
- The coverage chart is an **illustration** and must carry the label in `proof.chart.illustrationLabel`. Never present it as customer data or promise timing.
- State the honest limit (`trust.honestLimit`): the Indexing API is officially for JobPosting/BroadcastEvent pages; for others it asks Google to crawl sooner and does not guarantee indexing.
- The checker shows *can be indexed*, not *is in Google*. Say so (`checker.limitNote`, `reveal.note`).
- "Indexed" only ever means Google's URL Inspection says so.

## Prices and limits

- Free: 14-day trial, 100 URLs, then 50/month, 1 site, no card (`limits`, `plans.free`).
- Google's quota: 200 submissions/day per Google Cloud project, the user's own.
- **Paid plan names and prices are not in the repo.** They load from `/payments/public-subscription-plans` (see `src/Shared/publicPlans.ts`). Mockups render them as the tokens `{{paidFromMonthly}}`, `{{plan.amount}}` or an obvious placeholder such as `$XX`. Never invent a number. Paid-plan limit lines follow `planLimitLines()`.

## Scope per mockup

Each of A, B and C delivers these screens, light and dark:

1. **Home**, full scroll, all seven beats.
2. **Pricing**: free card plus paid placeholder cards, quota note, FAQ.
3. **Signup**: `?plan=trial` preserved, minimal fields.
4. **Checker result state**: a result for a page that can be indexed and one that is blocked, with fixes, plus the bridge to Start free.
5. **Logged-in Dashboard**: statuses Queued, Submitted, Indexed, Not indexed.
6. **Crawl/Index management**: per-URL status table, filters, queue priority.
7. **Site management**.
8. **First-run empty state to first win**: connect Google, add site, first URL shows its Google status.

Marketing pages (1 to 4) get the full direction treatment. App screens (5 to 8) take the same palette, type and components but stay quieter and denser.

## Directions

**A. Mission Control.** Dark first. Live pipeline hero (Queued, Submitted, Indexed) animating URLs. Lime and indigo glow, monospace URLs, terminal and radar feel. Light theme is a clean inversion, not an afterthought.

**B. The Invisible Page.** Editorial scrollytelling. A generic fake search results page where the user's page is missing, then appears as the story advances. Warm paper background, coral accent, large type. Strong light theme; dark is warm charcoal.

**C. Try-First Playground.** The free checker is the hero: paste a URL on first screen. Gradient mesh background, bento grid sections, chunky rounded UI.

## Cross-cutting requirements

- **Themes:** light and dark both fully designed. Respect `prefers-color-scheme`, with a manual toggle.
- **Mobile:** 16px side gutters, no horizontal scroll, layouts checked at 360px width.
- **Motion:** respect `prefers-reduced-motion` (replace motion with the final static state). Motion must never delay, hide or move the primary CTA, and the CTA is visible and clickable without waiting for any animation.
- **Accessibility:** WCAG AA. Text contrast at least 4.5:1 (3:1 for large text and UI components), visible focus states, tap targets at least 44px, status never conveyed by colour alone (add icon or label), meaningful alt text, one `h1` per page.
- **CTA:** label `Start free`, link `/signup?plan=trial`, placed per `ctaPlacement` in `content.json`, with "No card needed." nearby.
- **Performance:** hero content must render without waiting for JS animation (existing LCP fix: no opacity-hidden hero).
- **Routes kept:** `/`, `/pricing`, `/tools/indexability-checker`, `/terms`, `/privacy`, `/login`, `/signup`, and the app routes.

## Out of scope

Backend, API changes, new routes, new pricing, real logo files for production (mockups may include a draft mark), legal text changes.
