# Google Ads plan (first 10 days)

Goal: signups at a known cost, and data on which searches convert. Not a volume play yet.

Tracking already in place: the Google Ads tag (AW-18143687355) is on every page; the **sign-up conversion** fires on email and Google sign-ups; a new **indexability_check** event fires when someone runs the free checker. In Google Ads, keep "Sign up" as the primary conversion and add `indexability_check` as a secondary conversion (Goals → Conversions → New → Website → event name `indexability_check`).

## Budget and expectations

- Start at **$40/day** for 10 days ($400). Review on day 5 and day 10.
- Expected click cost on these terms: $1.50 to $4 in the US/UK, lower elsewhere. So roughly 10 to 25 clicks a day.
- Expected sign-ups: checker visitors sign up at perhaps 3 to 8%, direct-to-signup visitors at 10 to 20%. That is **2 to 5 sign-ups a day** at this budget. 100 sign-ups from ads alone needs roughly $3,000 to $6,000 at these rates, so ads are a steady source, not the launch-day one.
- Switch bidding to "Maximise conversions" only after 30 sign-up conversions; before that use "Maximise clicks" with a **$3.50 max CPC cap**.

## Settings (both campaigns)

- Type: Search. Turn **off** Display Network and Search Partners (both are on by default and waste the budget).
- Locations: United States, United Kingdom, Canada, Australia, Ireland, New Zealand, Netherlands, Germany, India. Set "Presence" (people in), not "Presence or interest".
- Language: English.
- Ad schedule: all day.
- Sitelinks: Free checker (/tools/indexability-checker), Pricing (/pricing), Free plan (/signup?plan=trial), How it works (/#how-it-works).
- Callouts: No sign-up needed · Free plan, no card · Official Indexing API · Verified with URL Inspection.

## Campaign 1: "Problem searches" → landing page /tools/indexability-checker

People with a page that isn't indexed. The checker solves their problem first; the sign-up comes after.

Keywords (phrase match unless marked exact):

```
"page not indexed"
"why is my page not indexed"
"google not indexing my site"
"google not indexing new pages"
"crawled currently not indexed"
"discovered currently not indexed"
"url is not on google"
"how to get google to index my site"
"how to get google to index my page"
"google won't index my site"
"indexability checker"
"noindex checker"
"robots.txt checker"
"robots txt tester"
"canonical tag checker"
[why isn't my website showing up on google]
[google not indexing my website]
```

Responsive search ad (one ad, pin nothing):

Headlines (max 30 characters each):
1. Why Isn't My Page Indexed?
2. Free Indexability Checker
3. See What Blocks Google
4. robots.txt, noindex, canonical
5. Fix It In 10 Seconds
6. No Sign-Up Needed
7. Check Any URL Free
8. Shows The Exact Blocking Rule
9. Crawled But Not Indexed?
10. Get A Fix For Each Issue

Descriptions (max 90 characters each):
1. Paste a URL and see exactly what stops Google from indexing it, with a fix for each issue.
2. Checks robots.txt, noindex, canonical, redirects and thin content. Free, no sign-up.
3. Then submit the fixed page to Google and track when it gets indexed. Free plan, no card.
4. Built by the team behind GoogleIndexing.com. Honest about Google's limits.

Display path: googleindexing.com/free/checker

## Campaign 2: "Tool searches" → landing page /signup?plan=trial

People already looking for an indexing tool. Send them straight to the free account.

Keywords:

```
"google indexing api tool"
"indexing api tool"
"instant indexing tool"
"bulk url indexing tool"
"google index checker tool"
"url indexing service"
"indexing api service"
"rapid url indexer alternative"
"indexmenow alternative"
"omega indexer alternative"
[google indexing tool]
[google url indexing tool]
```

Responsive search ad:

Headlines:
1. Google Indexing API Tool
2. Free Plan, No Card
3. Submit Pages To Google
4. See What Google Indexed
5. Verified With URL Inspection
6. Scheduled Submissions
7. Up To 200 URLs A Day
8. Works With Any Website
9. Your Own Google Project
10. Paid Plans From $5/mo

Descriptions:
1. Submit new pages through Google's official Indexing API and see what Google indexed.
2. Free plan: 50 URL submissions a month, 1 site, no card. Paid plans from $5.
3. Every URL is re-checked with Google's URL Inspection after 1, 3 and 7 days.
4. Honest limits: 200 submissions a day per Google project, Google's own quota.

Display path: googleindexing.com/indexing/free

## Negative keywords (add to both campaigns)

These searches contain "index" or "indexing" but have nothing to do with Google search:

```
database, sql, mysql, postgres, mongodb, elasticsearch, solr, lucene, excel, spreadsheet,
python, java, javascript, pandas, index fund, s&p, nasdaq, stock, etf, book, glossary,
library, linkedin, youtube, bing, yandex, duckduckgo, google scholar, google docs,
google drive, google photos, google sheets, job, jobs, salary, course, tutorial pdf,
definition, meaning, wikipedia, free download, crack, torrent, api key, api pricing google
```

Also add as negatives in Campaign 1 the exact tool-search phrases from Campaign 2, and vice versa, so the two campaigns don't bid against each other.

## What to watch (Google Ads → Campaigns → columns: Clicks, Cost, Conversions, Cost/conv)

- Day 2: a keyword with 15+ clicks and 0 conversions goes to exact match or gets paused.
- Day 5: if cost per sign-up is under $15, raise the budget to $80/day. If over $40, pause Campaign 2 and keep only Campaign 1.
- Every day: open Search terms, add the irrelevant ones as negatives. This is where most of the budget leaks in the first week.
- Compare with the admin funnel: ad sign-ups that never confirm their email are a tracking or spam-folder problem, not an ads problem.
