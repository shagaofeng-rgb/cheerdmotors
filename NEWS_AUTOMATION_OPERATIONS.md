# CHEERDMOTO News Automation

## Production policy

- News automation is enabled and runs once per day at `0 8 * * *` (16:00 Asia/Shanghai).
- Blog automation is intentionally disabled. Do not remove News automation when changing Blog publishing.
- The protected entry point is `GET /api/cron/news`.
- Vercel must provide `Authorization: Bearer <CRON_SECRET>`; unauthorized requests return HTTP 401.

## Data flow

1. Fetch the configured RSS sources concurrently.
2. Keep recent, relevant items from allowed sources.
3. Deduplicate by canonical source URL and generated slug.
4. Create a short attributed CHEERDMOTO analysis without copying the source article.
5. Use a local CHEERDMOTO product image as the cover.
6. Write published News records to the durable admin store in one batch.
7. Display those records through `/api/news`, `/news`, and `/news/[slug]`.
8. Save the latest 120 execution results and show them in `/admin/news`.

## Optional production variables

- `NEWS_DAILY_TARGET`: 1-8, default 4.
- `NEWS_SOURCE_WINDOW_HOURS`: 24-168, default 72.
- `NEWS_RSS_FEEDS`: comma- or newline-separated RSS URLs.
- `NEWS_SOURCE_ALLOWLIST`: allowed source host/name fragments.
- `NEWS_SOURCE_BLOCKLIST`: blocked source host/name fragments.

## Verification

- A signed request with `?dryRun=1` validates sources and generation without creating articles.
- A normal signed request publishes only the remaining number required for the daily target.
- Repeated requests after the target is reached return `target_reached` and create no duplicates.

## Rollback

- Git baseline before restoration: tag `backup-before-news-automation-20260830-193652`.
- Content/config backup: `/Users/apple/Documents/site-backups/cheerdmotors/20260830-193652`.
- Reverting the deployment does not require deleting any News records.
