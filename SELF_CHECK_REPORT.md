# CHEERDMOTO Backend, News Automation and Website Self-Inspection Report

Date: 2026-07-08

## Project Architecture Summary

- Framework: Next.js App Router, React, TypeScript.
- Backend: Next.js route handlers.
- Persistent data: Upstash Redis REST through `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
- Media storage: Vercel Blob through `BLOB_READ_WRITE_TOKEN`.
- Admin auth: HMAC signed HttpOnly admin cookie.
- Deployment: Vercel production, GitHub main branch.
- SEO/GEO: Next metadata, dynamic sitemap, robots, NewsArticle/BlogPosting JSON-LD, AI-readable article summaries.
- News automation: RSS feed collection, 72-hour source filtering, 7-day source dedupe, product relevance, source image validation, Vercel Cron route.

## PDF Instructions Executed

- Reviewed `B2C零售网站管理后台开发总指令.pdf`.
- Reviewed `News Automation System Development(1).pdf`.
- Reviewed `网站自检指令(1).pdf`.
- Implemented missing News and public content requirements that were not completed before this pass.

## Implemented Fixes

- Added public News list page: `/news`.
- Added public News detail pages: `/news/[slug]`.
- Added public Blog list page: `/blog`.
- Added public Blog detail pages: `/blog/[slug]`.
- Added search page: `/search`.
- Added contact/inquiry page: `/contact`.
- Updated inquiry API to support both JSON and normal HTML form submission.
- Added public content API: `/api/news`.
- Added health check API: `/api/health`.
- Added News RSS feed: `/news/rss.xml`.
- Added dynamic sitemap: `/sitemap.xml`.
- Added robots policy: `/robots.txt`.
- Added News automation route: `/api/cron/news`.
- Added Blog automation route: `/api/cron/blog`.
- Added Vercel Cron configuration in `vercel.json`.
- Added News automation service with:
  - RSS source fetching.
  - Source publication date validation.
  - 72-hour freshness window.
  - Canonical source URL normalization.
  - 7-day duplicate source prevention.
  - Source allowlist/blocklist support.
  - Product relevance and related product links.
  - Source image requirement.
  - SEO title and meta description generation.
  - GEO summary and FAQ fields.
- Audit log writing.
- Added Blog automation that derives buying-guide articles from already verified News sources without inventing sources or images.
- Fixed homepage/category navigation to link to real News, Blog, Search and Contact routes.
- Added responsive content page styles.
- Added inquiry email notification adapter through Resend. Inquiries are saved first, then email delivery is attempted and logged without blocking the customer submission.
- Added newsletter subscriber API and connected footer forms to persistent storage.
- Added public Privacy Policy and Terms of Service pages and included them in the sitemap.

## Environment Variables

Configured previously:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `ADMIN_JWT_SECRET`
- `GOOGLE_SEARCH_CONSOLE_SITE_URL`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `BLOB_READ_WRITE_TOKEN`

Added for this pass:

- `CRON_SECRET`

New optional lead notification variables:

- `RESEND_API_KEY`
- `RESEND_FROM`
- `ADMIN_NOTIFICATION_EMAIL` or `INQUIRY_RECEIVER_EMAIL`

Optional News automation variables:

- `NEWS_RSS_FEEDS`
- `NEWS_DAILY_TARGET`
- `NEWS_SOURCE_WINDOW_HOURS`
- `NEWS_SOURCE_ALLOWLIST`
- `NEWS_SOURCE_BLOCKLIST`

## Test Results

- `pnpm build`: passed.
- Local production server: started on port `3001`.
- Public route checks passed:
  - `/`
  - `/electric-dirt-bikes`
  - `/electric-bikes`
  - `/electric-wheelchairs`
  - `/accessories`
  - `/news`
  - `/blog`
  - `/blog/electric-dirt-bike-buying-guide`
  - `/search`
  - `/contact`
  - `/sitemap.xml`
  - `/robots.txt`
  - `/news/rss.xml`
  - `/api/health`
  - `/api/news`
- Cron security check: `/api/cron/news` without bearer token returns `401`.
- Contact form test: submitted and redirected to `/contact?sent=1`.
- News automation test: published 4 verified-source News articles into persistent KV.
- News API verification: 4 published News articles with source, source date, image and related products.

## Known Limits

- News automation uses public RSS feeds and rule-based analysis. If a source feed has no valid date, no image, or no related product signal, the item is skipped rather than fabricated.
- Blog automation is conservative: it only publishes when at least one verified News source exists.
- Email notification code is complete through Resend; live sending requires `RESEND_API_KEY` and a verified sender/domain in Resend.
- Real payment gateway is still pending provider credentials and business decision.

## Deployment Checklist

- Build before deploy.
- Confirm `CRON_SECRET` is present in Vercel Production.
- Deploy to Vercel Production.
- Verify `/api/health`.
- Verify `/news`, `/blog`, `/sitemap.xml`, `/robots.txt`.
- Verify `/privacy`, `/terms`, `/api/newsletter/subscribe` and `/api/contact/inquiry`.
- Run `/api/cron/news` with bearer token only for manual validation.
