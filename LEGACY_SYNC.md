# Legacy Site Sync

This repository is prepared for a future Next.js rebuild. The old site should first be mirrored into a local folder so its copy, images, scripts, and page structure can be reused.

## Current status

- Correct legacy domain: `cheerdmoto.com`.
- `https://cheerdmoto.com/` is a live Shopify storefront.
- The legacy site has been mirrored into `legacy-site/`.
- Current local mirror size: about 201 MB.
- Current local mirror file count: 896 files, including this mirror's README.
- `.mirror-manifest.json` records 900 successful URL fetches and 0 failures.
- The crawl was stopped when Shopify search pages started producing repeated tracking-query URLs such as `_pos`, `_sid`, and `_ss`; the official sitemap pages and discovered content/assets had already been copied.

Mirrored content includes US and `en-au` paths, product pages, standard pages, collections, blogs, blog pagination/tag pages, theme CSS/JS, product images, article images, and Shopify-hosted static assets.

## Mirror command

Primary command used:

```bash
python3 scripts/mirror_site.py --sitemap https://cheerdmoto.com/sitemap.xml --output legacy-site --max-urls 1200 --connect-timeout 15 --timeout 45
```

For a simpler homepage-driven crawl:

```bash
python3 scripts/mirror_site.py https://cheerdmoto.com/ --output legacy-site
```

The output folder contains one subfolder per hostname plus `.mirror-manifest.json`, which records attempted URLs, status, content type, local path, and any errors.

## Next.js migration note

Keep `legacy-site/` as raw source material. During the Next.js rebuild, copy final images and downloads into `public/`, convert reusable sections into components, and map each mirrored page to `app/.../page.tsx`.
