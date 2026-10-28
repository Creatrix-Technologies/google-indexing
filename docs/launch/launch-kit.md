# Launch kit: free indexability checker + GoogleIndexing.com free plan

Everything below is ready to paste. Links to use everywhere:

- Free tool: https://www.googleindexing.com/tools/indexability-checker
- Free account: https://www.googleindexing.com/signup?plan=trial
- Pricing: https://www.googleindexing.com/pricing

Facts you can state (all true as deployed on 2026-10-28):

- The checker is free, needs no sign-up, and tests: HTTP status and redirects, robots.txt the way Googlebot reads it (with the exact blocking line), X-Robots-Tag, meta robots noindex, canonical, HTTPS, and how much text is in the HTML. Each issue comes with a fix.
- The free plan: 14-day trial with 100 URL submissions, then 50 submissions a month and 1 site, forever, no card.
- Paid plans: Solo $5, Pro $20, Enterprise $69 a month. All submit up to 200 URLs a day per Google Cloud project (Google's own limit).
- Submissions go through Google's official Indexing API using the customer's own service account. Every URL is re-checked with Google's URL Inspection after 1, 3 and 7 days, so the dashboard shows what Google actually indexed.
- Google officially supports the Indexing API for job-posting and livestream pages. For other pages a submission asks Google to crawl sooner; nothing can guarantee indexing. Say this when asked. It is the reason people trust the tool over "guaranteed indexing" services.

Do not claim: indexing in X hours, success rates, "3 to 5 times faster", or that any page is guaranteed to be indexed.

Assets in `docs/launch/assets/`: share image (1200x630), three Product Hunt gallery screenshots (1270x760 at 2x).

---

## Morning schedule (all times UTC; adjust to your own)

| When | Where | What |
|---|---|---|
| 07:00 | Search Console | Submit sitemap, request indexing for the checker page (2 minutes) |
| 07:10 | Product Hunt | Submit the listing (section 4). PH day starts 07:01 UTC; the earlier you post, the longer it collects votes |
| 07:30 | NopBooster list | Send the email (section 1) |
| 08:00 | LinkedIn and X | Post (sections 2 and 3). Reply to every comment within the hour |
| 13:00 | Hacker News | Show HN (section 5). US East morning gets the most readers |
| 13:30 | Reddit | r/TechSEO first, then r/SEO, r/bigseo. One post per subreddit, spaced 20 minutes apart (section 6) |
| 14:00 | Indie Hackers, Facebook groups | Sections 7 and 8 |
| All day | Everywhere | Answer comments fast. Comments drive ranking on PH, HN and Reddit. Use the replies in section 9 |

Ask friends and existing users to try the checker and comment honestly. Do not ask anyone for upvotes; PH and HN penalise that.

---

## 1. Email to the NopBooster list

Send it from the tool you normally use for customer email, so it carries your usual unsubscribe link. Plain text or minimal HTML; no big images.

**Subject options** (pick one):

- Free tool: find out why Google isn't indexing your pages
- New from the NopBooster team: a free Google indexability checker
- Is Google ignoring your product pages? Check in 10 seconds

**Body:**

Hi {first name},

Most "my pages aren't in Google" problems come down to a handful of causes: a robots.txt rule, a stray noindex, a canonical pointing somewhere else, a redirect chain, or a page with almost no text in the HTML.

We built a free tool that checks all of them for any page, in about ten seconds, and tells you how to fix each one. No sign-up.

Try it on a product page or a category page:
https://www.googleindexing.com/tools/indexability-checker

It's part of GoogleIndexing.com, our new service that submits new and changed pages to Google through the official Indexing API on a schedule and then checks, URL by URL, what Google actually indexed. There's a free plan with 50 submissions a month, no card needed:
https://www.googleindexing.com/signup?plan=trial

If you run nopCommerce: a plugin that pushes new and updated products automatically is next on our list. Reply to this email if you'd like early access.

{Your name}
Creatrix Technologies / NopBooster

---

## 2. LinkedIn post

I just shipped a free tool and I'd like your honest feedback.

Paste any page address and it tells you whether Google can index it: robots.txt (with the exact line that blocks you), noindex in the HTML or the headers, canonical, redirects, status codes and thin content. Each problem comes with a fix.

https://www.googleindexing.com/tools/indexability-checker

Why I built it: our SaaS, GoogleIndexing.com, submits pages to Google through the official Indexing API and verifies what got indexed. Most support questions turned out to be one of the six checks above, so we made the check public and free.

If you manage a site and have a page that "just won't index", run it through and tell me what it found.

(No sign-up for the tool. The service itself has a free plan: 50 URL submissions a month.)

---

## 3. X thread

1/ Free tool, no sign-up: paste a URL and find out whether Google can index it.

It checks robots.txt (shows the exact blocking line), noindex tags and headers, canonical, redirects, status codes and thin content, and tells you how to fix each one.

https://www.googleindexing.com/tools/indexability-checker

2/ The most common things it finds, from the first hundred checks:

- "Crawled, not indexed" pages with under 150 words in the HTML
- Canonical tags pointing at the homepage (we had this bug on our own site)
- A Disallow rule meant for /wp-admin/ that also caught a real folder

3/ It does NOT run JavaScript, on purpose. It shows you what your server sends Google first. If the content only appears after JS runs, it tells you that too.

4/ Built it because our SaaS (GoogleIndexing.com) submits pages via Google's official Indexing API and most "it's not working" tickets were one of these six issues.

5/ The service has a free plan: 14-day trial with 100 submissions, then 50 a month, 1 site, no card. Every submitted URL gets re-checked with Google's URL Inspection, so you see what Google actually indexed, not just what was sent.

https://www.googleindexing.com/signup?plan=trial

---

## 4. Product Hunt

**Name:** GoogleIndexing.com

**Tagline** (60 chars max): See which pages Google indexed, and fix the ones it didn't

**Description** (260 chars max):
Free indexability checker: paste a URL, see what blocks Google (robots.txt, noindex, canonical, redirects, thin content) and how to fix it. The service submits new pages via Google's official Indexing API and verifies what got indexed. Free plan, no card.

**Topics:** SEO, Marketing, Developer Tools, Web Development

**Links:** Website: https://www.googleindexing.com/tools/indexability-checker

**Gallery:** upload ph-1-checker-result.png, ph-2-checker.png, ph-3-pricing.png (in that order). Logo: your existing square logo at 240x240.

**First comment (maker):**

Hi everyone. I'm {name}, maker of GoogleIndexing.com.

The short story: we built a SaaS that submits new and changed pages to Google through the official Indexing API on a schedule, then checks every URL with Google's URL Inspection so you can see what Google actually indexed. While supporting the first users we noticed most "my page isn't indexed" cases were one of six causes, so today we're also launching a free checker that finds them in ten seconds, no sign-up:

https://www.googleindexing.com/tools/indexability-checker

What it checks: HTTP status and redirect chains, robots.txt the way Googlebot evaluates it (it shows the exact line), X-Robots-Tag, meta robots, canonical, HTTPS, and how much text is in the HTML before JavaScript runs.

Being straight about limits: Google officially supports the Indexing API for job-posting and livestream pages. For other pages a submission asks Google to crawl sooner; nobody can guarantee indexing, and we don't. What we do is make the whole loop visible, including the "no".

Free plan: 14-day trial with 100 submissions, then 50 a month, no card. Paid plans from $5.

I'd love to hear what the checker finds on your sites, and what's missing.

---

## 5. Show HN

**Title** (80 chars max): Show HN: Free checker for why Google can't index a page (robots, noindex, canonical)

**URL:** https://www.googleindexing.com/tools/indexability-checker

**Text** (post as the first comment if HN asks for a URL-only submission):

I run a small SaaS that submits pages to Google through the Indexing API and then verifies with the URL Inspection API what actually got indexed. Most support requests turned out to be the page being un-indexable in the first place, so I made the check public.

It fetches the page server-side and reports: status code and the redirect chain, robots.txt evaluated per RFC 9309 and Google's rules (googlebot group first, longest-match wins, Allow wins ties, * and $ wildcards, and it tells you the matching line), X-Robots-Tag, meta robots/googlebot, canonical (HTML and Link header), HTTPS, and a rough word count of the HTML before JS.

Things I had to get right that were less obvious than expected: SSRF (public IPs are checked at connect time, so DNS rebinding and redirects to 169.254.169.254 don't work), robots.txt groups that list several user-agents, X-Robots-Tag directives that look like agent prefixes ("unavailable_after:"), and not treating a 5xx on robots.txt the same as a 404 (Google treats 5xx as "don't crawl").

It deliberately doesn't render JavaScript; it shows what the server sends, and flags when the text only appears after rendering.

Stack: .NET 10 minimal API, AngleSharp for parsing, Vue on the front. Happy to answer questions about the robots.txt evaluation or the Indexing API's actual behaviour and limits.

---

## 6. Reddit

Rules of thumb: one post per subreddit, different angle each, disclose that it's yours, no link in the title, and answer every comment. Check each subreddit's self-promotion rule first; r/SEO allows tools in the weekly thread and well-written posts, r/TechSEO is strict about value, r/bigseo requires flair.

### r/TechSEO

**Title:** I built a free robots.txt/noindex/canonical checker that shows the exact rule blocking a URL. Looking for edge cases.

**Body:**

Disclosure: it's mine, it's free, no sign-up.

https://www.googleindexing.com/tools/indexability-checker

It evaluates robots.txt the way Googlebot does (googlebot group first, longest match wins, Allow wins ties, * and $) and reports the matching line. It also reads X-Robots-Tag, meta robots/googlebot, canonical from both the HTML and the Link header, redirect chains, and the amount of text in the HTML before JavaScript.

I'd appreciate people throwing weird cases at it: multiple user-agent lines in one group, BOMs, 5xx on robots.txt, Link-header canonicals, redirect loops. Tell me what it gets wrong and I'll fix it.

### r/SEO

**Title:** Free tool: paste a URL, see why Google can't index it, with a fix for each issue

**Body:**

Made this for our own users and opened it up. No sign-up. It checks status/redirects, robots.txt (shows the blocking line), noindex in HTML and headers, canonical, HTTPS and thin content, and tells you what to change.

https://www.googleindexing.com/tools/indexability-checker

What it can't do: tell you whether Google has indexed the page. Only Search Console knows that. It tells you whether anything on your side is stopping Google.

Disclosure: it's part of GoogleIndexing.com (Indexing API submissions + URL Inspection verification; there's a free plan). Happy to answer questions.

### r/bigseo

**Title:** Opened up our internal indexability check as a free tool. What else should it test?

**Body:** same as r/SEO body, plus: "Next on the list: hreflang consistency and a sitemap vs. crawl diff. Vote on what matters."

### r/juststart and r/Wordpress

**Title:** If your new pages aren't showing up in Google, check these 6 things first (free tool)

**Body:**

Before you buy an "indexing service", check that nothing on your own site is blocking Google. The usual suspects: a robots.txt Disallow that's wider than intended, a noindex left on from staging, the SEO plugin setting the canonical to another URL, a redirect chain, or a thin page.

I built a free checker that tests all six in one go and tells you the fix: https://www.googleindexing.com/tools/indexability-checker (mine, no sign-up).

For WordPress specifically, if it reports noindex, look at the page's SEO plugin box and at Settings → Reading → "Discourage search engines".

---

## 7. Indie Hackers

**Title:** Launched a free tool as the top of our funnel. Here's what it does and why.

**Body:**

Our SaaS (GoogleIndexing.com) submits pages to Google via the Indexing API and verifies what got indexed. Revenue so far: close to nothing. The honest reason: people who signed up couldn't get value before the Google setup, and the pricing page promised things the product couldn't deliver.

So this week we: fixed the pricing to match enforced limits, added a free plan (50 submissions a month, no card), wrote a 4-email onboarding sequence, and built a free, no-sign-up indexability checker as the public front door:

https://www.googleindexing.com/tools/indexability-checker

The bet: people searching "why isn't my page indexed" find the checker, it solves a real problem in ten seconds, and some of them want the monitoring. I'll report back with the funnel numbers (signup → connected Google → first submission → paid).

---

## 8. Facebook / Slack / Discord groups (short)

Free tool, no sign-up: paste a URL and see what's stopping Google from indexing it (robots.txt with the exact line, noindex, canonical, redirects, thin content), with a fix for each. Built it for our own users, opened it up today. Feedback welcome: https://www.googleindexing.com/tools/indexability-checker

---

## 9. Replies to expected comments

**"The Indexing API is only for job postings and livestreams."**
Correct, and we say so on the pricing page and in the checker. For other pages a submission is a request to crawl sooner, not a guarantee. The product's value is the loop: submit, then verify with URL Inspection, so you see what Google actually did instead of hoping.

**"RankMath / Yoast do instant indexing for free."**
They do submission. They don't check afterwards whether Google indexed the page, and they don't tell you why a page is un-indexable. The checker is free for exactly that part. If you only need to submit from WordPress, those plugins are fine.

**"This is just a site: search / Search Console."**
Search Console tells you whether a URL is indexed; it doesn't tell you what in your robots.txt or headers is stopping Google, and you need to own the property. The checker works on any URL, in ten seconds, without access.

**"Doesn't render JavaScript, so it's useless for SPAs."**
It shows what Google sees in the first wave. Google renders JS later; if your content only appears after rendering, the tool says so, which is the point.

**"200 a day is tiny."**
That's Google's quota per Cloud project, not ours. We don't pretend otherwise. If you need more you need more projects, and we'd rather be honest than sell 60,000 a month that can't exist.

**"Security: you're fetching arbitrary URLs."**
Public IPs only, checked at connect time (so DNS rebinding doesn't work), ports 80/443 only, redirects re-validated, 2 MB and 12 second caps, rate-limited per IP and globally.

---

## 10. What to expect

With no existing audience, a well-run launch day typically brings a few hundred visitors from HN and Reddit combined, more if the HN post reaches the front page, and signups of a few percent of visitors. The NopBooster list is the one channel whose result depends mostly on list size. Expect tens of signups on day one, not hundreds; the launch is also the start of the SEO traffic to the checker, which grows for weeks.

Watch Admin → Overview (the funnel panel) during the day: signups, confirmed, connected Google. If confirmations lag signups by a lot, the confirmation email is landing in spam; tell me and I'll look at the sending domain's SPF/DKIM.
