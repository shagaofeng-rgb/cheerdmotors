# CHEERDMOTO Full-Site Audit and Repair Report

Generated: 2026-08-31 12:21 CST  
Production site: https://cheerdmotors.com  
Repository commit: `3f52711171ff1091e2522bba62d45c65d7ded0f9`  
Vercel deployment: `dpl_9rEBbW7SiMiPfLkNazPdWgHaB4Tr`

## 1. Overall status

The current production deployment is online and serving the audited commit. The public site, admin authentication boundary, production data store, News and Blog content reads, SEO routes, scheduled task configuration, and responsive layouts were verified after deployment.

The site uses Next.js 16 on Vercel and a Vercel KV/Upstash-compatible REST store. It does not use a relational database, message queue, or long-running server process. Relational table, field, and SQL index checks are therefore not applicable; the equivalent KV keys, list/object integrity, read/write access, duplicate IDs/slugs, and public/admin consistency were checked instead.

## 2. Status classification

### Confirmed normal

- Production deployment is `Ready` and assigned to `cheerdmotors.com`, `www.cheerdmotors.com`, and `cheerdmotors.vercel.app`.
- Durable store reports `configured: true`, provider `kv_rest`.
- Production content contains 136 published News posts and 30 published Blog posts.
- No duplicate post IDs or slugs were found in the data audit.
- News automation is enabled; its latest complete run published 4 articles with 0 errors.
- Google Search Console integration is configured for `sc-domain:cheerdmotors.com`.
- Google Search sync is scheduled every three days and the stored snapshot has no error.
- Blog remains available for manual publication and public reading.
- Blog automatic fetching/generation has no Cron, queue consumer, or workflow entry. An authenticated external manual publishing webhook was restored on 2026-09-04.
- Protected admin and Cron APIs reject unauthenticated calls with HTTP 401.
- The production deployment recorded no runtime error cluster and no 5xx response during acceptance testing.

### Found and repaired

- Public pages previously mixed canonical catalog facts with stale hard-coded prices/specifications. Product and category pages now overlay published backend product status, price, stock, image, and managed metadata.
- XCEED facts were corrected to $3,099, 8,500W peak, 53 mph, and 380 Nm.
- SMART B02 capacity was corrected to 350 lb.
- Stale accessory names, prices, and three invalid backend image paths were corrected.
- 66 content records were normalized; 86 encoded or invalid fields were repaired. A post-migration dry run reported 0 remaining changes.
- One known broken remote cover URL was replaced with the local fallback.
- News and Blog lists now show 12 records per page instead of rendering the full dataset at once.
- Canonical metadata was added to nine public page types that previously lacked it.
- Search and Checkout use appropriate `noindex` behavior without changing sitemap, robots, structured data, or canonical behavior.
- Contact and search controls now have labels; contact/newsletter feedback is announced accessibly.
- A branded 404 page was added.
- Next image optimization, AVIF/WebP support, HSTS, frame denial, MIME sniffing protection, referrer policy, permissions policy, and hidden framework header were enabled.
- Production admin authentication now requires `ADMIN_JWT_SECRET`; the insecure production fallback was removed.
- Analytics payloads are bounded and sanitized. Internal, Codex, Collects, Playwright, bot, and explicit test traffic is rejected before storage.
- Stored inquiry analytics now hashes email/IP and masks the IP address.
- Newsletter subscriptions are deduplicated.
- Checkout submissions now use an idempotency key so retries do not create duplicate orders.
- Public News/Blog cards now fall back to a local image when a remote source blocks or times out.
- Reusable full-site crawl and data-normalization scripts and Playwright regression tests were added.

### Found but not repaired because external configuration is required

1. Inquiry email delivery is not active. All 18 notification log entries are `skipped` because production does not have `RESEND_API_KEY`. Inquiry records are still saved, but email is not sent. Required action: connect Resend, verify the sender domain, add `RESEND_API_KEY`, optionally set `RESEND_FROM` and `ADMIN_NOTIFICATION_EMAIL`, then redeploy and submit one real controlled inquiry.
2. Online card payment is not connected. Checkout currently creates durable `pending_payment` orders and supports manual quotation/offline payment. A real card gateway and webhook credentials must be supplied before card collection can be marked complete.
3. Vercel is managed infrastructure, so host CPU, memory, disk, raw process list, operating-system logs, and physical backup jobs are not exposed to this workspace. Application health, deployment state, build logs, function logs, status codes, storage access, and runtime errors were checked instead.

### Known product-management limitation

The admin store can hold additional product records, but the public product detail and checkout variant schema is intentionally registered for the current nine product slugs. A completely new model requires adding its variant/specification schema before it can receive a full public product page. Existing products are connected to the live backend overlay.

## 3. Backups and rollback

Code backup tag:

- `backup-before-full-audit-20260830-195928` at commit `b831710`

Backup directory:

- `/Users/apple/Documents/site-backups/cheerdmotors/20260830-195928`

Production data backup:

- `/Users/apple/Documents/site-backups/cheerdmotors/20260830-195928/kv-backup.json`
- SHA-256: `28c8aef37998efbd074ebd4638c1ebffd6986f641a256bfd151863329d65e23f`

Production acceptance crawl:

- `/Users/apple/Documents/site-backups/cheerdmotors/20260830-195928/production-after-3f52711.json`

Rollback procedure:

1. Reassign the production aliases to the previous Ready deployment, or redeploy the backup tag.
2. If data rollback is required, restore the backed-up KV keys from `kv-backup.json` using the production KV credential in a controlled maintenance window.
3. Run `/api/health`, the full-site audit script, and Playwright acceptance tests after rollback.

No backup contains newly generated credentials in this repository. Existing production credentials must continue to be managed through Vercel environment variables.

## 4. Running programs and scheduled tasks

| Program or task | Purpose | Trigger / frequency | Input | Output | Current status |
| --- | --- | --- | --- | --- | --- |
| Next.js public application | Product, category, News, Blog, contact, checkout and policy pages | HTTP request | Route/search/form data | HTML/RSC/JSON | Ready |
| Next.js admin application | Content, catalog, analytics, orders, leads, settings and SEO management | Authenticated HTTP request | Admin forms/API calls | KV reads/writes and HTML | Protected, HTTP 401 without session |
| Durable KV store | Posts, products, settings, orders, analytics and logs | Application read/write | JSON objects/lists | Persistent JSON records | Connected |
| News automation | Fetch, filter, deduplicate, generate and publish News | Vercel Cron, daily at `0 8 * * *` UTC | Approved RSS feeds and existing posts | Published News plus execution log | Enabled; latest complete run 4 published, 0 errors |
| Google Search sync | Import Search Console query/page/country/device/date data | Vercel Cron, `0 9 */3 * *` UTC | Search Console API | Snapshot and execution log | Configured; three-day minimum also enforced in code |
| Blog manual publishing | Create and edit Blog content through admin APIs | Authenticated manual action | Admin form | Blog post in KV | Available |
| External Blog webhook | Accept manual pushes from the configured third-party plugin | Authenticated external POST | Signed Blog article fields | Published Blog post in KV | Restored; no schedule |
| Blog automatic fetching/generation | Previously requested to be removed | None | None | None | Disabled and code entry points absent |
| Inquiry notification | Send saved inquiry by email | Contact submission | Inquiry record | Resend email plus log | Blocked by missing Resend credential |
| Newsletter storage | Save consenting subscribers | Footer form | Email/source | Deduplicated KV record | Enabled |
| Checkout order creation | Create idempotent quote/order records | Checkout form | Customer/product/configuration | Durable pending-payment order | Enabled; manual payment mode |
| Analytics collection | Store real visitor/session/page/funnel data | Browser events | Sanitized event payload | KV analytics events | Enabled with test/internal traffic exclusion |

No application message queue, queue consumer, operating-system Cron, GitHub Actions workflow, or duplicate scheduled task was found. The two Vercel Cron entries are independent and do not write the same records.

## 5. Data and synchronization evidence

- Admin store before normalization: 4 categories, 9 products, 10 media items, 166 posts.
- Published content after normalization: 136 News and 30 Blog posts.
- Duplicate post IDs: 0.
- Duplicate post slugs: 0.
- Encoded post titles after migration: 0.
- Known broken cover references after migration: 0.
- Backend accessory image path repairs: 3.
- `/api/health` at 2026-08-31T04:19:28.495Z returned `ok: true`, persistent store configured, News 136, Blog 30.
- `/api/news` returned 166 real published records from the durable store. No static placeholder feed was substituted.
- Public product/category/search/checkout/sitemap reads now use the backend storefront catalog overlay.
- Cache behavior uses dynamic server reads for managed catalog/content routes; no stale static snapshot is used as the production source of truth.

## 6. Automation evidence

### News

Latest complete execution record:

- Started: 2026-08-30T11:50:07.809Z
- Completed: 2026-08-30T11:50:08.179Z
- Status: `completed`
- Published: 4
- Errors: 0

The immediately following run returned `target_reached`, published 0, and recorded 0 errors. This confirms the daily target/deduplication guard prevents duplicate publication.

### Blog

- `vercel.json` contains no Blog Cron.
- There is no `/api/cron/blog` route; production returns HTTP 404.
- The external manual `send_article` webhook and root POST forwarding route were restored on 2026-09-04.
- The webhook requires the server-only `WEBHOOK_ARTICLE_SIGN`, accepts only `class_id=blog`, separates connection verification from publication, and deduplicates identical payloads.
- Code search found no scheduled Blog fetcher, generator, or auto-publication task.
- Existing 30 Blog posts remain available and were not deleted.

### Google Search

- Schedule: `0 9 */3 * *` UTC.
- Code minimum interval: 72 hours.
- Site: `sc-domain:cheerdmotors.com`.
- Latest stored sync: 2026-08-28T09:00:12.475Z.
- Stored query/page rows: 12.
- Snapshot: 2 clicks, 49 impressions, 4.08% CTR, average position 23.31.
- Stored error: empty.

## 7. Frontend, responsive and visual verification

Automated browser checks ran at 390x844, 768x1024, and 1440x1000 across:

- Home
- Electric dirt bikes
- Electric bikes
- Electric wheelchairs
- Accessories
- XCEED product detail
- News
- Blog
- Search
- Contact
- Checkout
- Admin login

Every route returned HTTP 200, rendered exactly one H1, produced no horizontal overflow, and emitted no browser page exception. News and Blog rendered 12 cards per page. The first content image and first managed accessory image had a positive browser `naturalWidth`.

Visual screenshots were reviewed for mobile and desktop home, News, accessories, contact, and admin login views. No incoherent overlap or clipped controls were found.

## 8. SEO and crawl verification

The post-deployment full crawl checked 193 URLs from the live sitemap and required routes:

- HTTP 200: 192.
- Intended custom 404 test: 1.
- Missing titles: 0.
- Incorrect H1 count: 0.
- Missing descriptions: 0.
- Missing Canonical: 0.
- Double-encoded entity pages: 0.
- Old-domain references: 0.

Robots, sitemap, RSS, Canonical, Open Graph metadata, page titles/descriptions, structured data, and the custom 404 route remained available after the changes.

## 9. Performance evidence

Production HTTP sample after deployment:

| Route | Status | Total | TTFB | Transfer size |
| --- | ---: | ---: | ---: | ---: |
| `/` | 200 | 1.400 s | 1.150 s | 41,501 B |
| `/news` | 200 | 1.284 s | 1.048 s | 38,130 B |
| `/blog` | 200 | 1.282 s | 1.062 s | 32,975 B |
| `/products/xceed` | 200 | 1.307 s | 1.062 s | 39,300 B |
| `/api/news` | 200 | 2.044 s | 1.055 s | 704,136 B |
| `/api/health` | 200 | 1.109 s | 1.109 s | 172 B |

Before pagination, `/news` was approximately 301 KB and about 2.38 seconds in the baseline sample. After pagination it is 38 KB and 1.28 seconds in the acceptance sample, an approximately 87% reduction in transferred HTML and 46% reduction in sampled total time.

The full crawl inspected 199 referenced image URLs. Seven remote publisher URLs did not answer the audit HEAD/range request before timeout. Browser acceptance still passed image rendering because public content images now use a local fallback when a remote publisher blocks or times out. Local product assets did not fail.

## 10. Security and stability evidence

- Production build passed compilation, TypeScript checking, page data collection, and route generation.
- Local production-mode Playwright: 7/7 passed in 1.1 minutes.
- Production Playwright: 7/7 passed in 47.4 seconds.
- Production runtime after acceptance: 540 HTTP 200 responses, 5 expected HTTP 401 responses, no 5xx log.
- Vercel grouped runtime errors for the acceptance window: none.
- Admin API, realtime data, News Cron, and Google Cron returned HTTP 401 without authentication.
- Test analytics request returned `recorded: false` and was not stored.
- No complete key, password, token, service-account private key, or API credential was added to the commit.

## 11. Changed code areas

- Public catalog/data integration: `lib/storefrontCatalog.ts`, category pages, product detail, search, checkout, sitemap, and home.
- Content normalization and image resilience: `lib/text.ts`, `lib/backendStore.ts`, `lib/content.ts`, `components/ContentImage.tsx`.
- Content pagination: News, Blog, `components/PublicPagination.tsx`.
- Analytics/privacy: analytics API, contact API, checkout API, commerce store, notifications.
- SEO/accessibility/UI: root/category/policy/search/checkout metadata, contact/search labels, 404 page, global styles.
- Security/performance: `next.config.ts`, `lib/adminAuth.ts`.
- Verification tooling: `scripts/full-site-audit.mjs`, `scripts/normalize-admin-content.mjs`, `playwright.config.ts`, `tests/site.spec.ts`.

No relational schema, SQL migration, Vercel Cron schedule beyond the documented two tasks, or Blog auto-publication route was added.

## 12. Remaining risks and priorities

1. **High:** Configure and verify Resend so inquiry emails are delivered. Until then, operators must read inquiries in the admin data rather than relying on email.
2. **High if online payment is required:** Select and integrate the payment provider, signed payment webhook, reconciliation, refund flow, and production credentials. Current checkout is a durable manual-quote/order workflow.
3. **Medium:** Move third-party News cover images into controlled Vercel Blob storage during ingestion to eliminate dependence on publisher hotlinks. The current local fallback prevents broken UI but cannot make the original remote image reliable.
4. **Medium:** Convert the product model registry into a fully CMS-defined variant schema before non-developers add entirely new product slugs.
5. **Medium:** Add external uptime/error alerting and a log drain. Vercel runtime logs are available, but no independent alert destination was verified.
6. **Low:** `/api/news` returns the complete 166-record dataset and is about 704 KB. Public pages are paginated, but the API should gain server-side pagination if it becomes a high-volume integration endpoint.

## 13. Acceptance conclusion

The audited commit is pushed to GitHub and deployed to production. All locally controllable high-impact issues found in the audit were repaired and passed local and production regression testing. Inquiry email and online card payment are not marked complete because their external provider credentials and account setup are absent.
