# External Blog publishing webhook

This endpoint accepts authenticated manual publication requests from the external Blog plugin. It does not fetch content, generate articles, or run on a schedule. The API key is stored only in the server environment variable `WEBHOOK_ARTICLE_SIGN`.

## Plugin configuration

For `Custom development framework Webhook`, use the root domain:

- Domain: `https://cheerdmotors.com`
- Category ID: `blog`
- Request type: `POST`
- Content type: `application/x-www-form-urlencoded`

The root `POST` is internally rewritten to `/api/webhook/send_article`. A normal `GET /` continues to render the homepage.

For a generic webhook client, the full endpoint is:

- `https://cheerdmotors.com/api/webhook/send_article`

## Fields

| Field | Required | Notes |
| --- | --- | --- |
| `sign` | Yes | Must equal the server-side `WEBHOOK_ARTICLE_SIGN`. |
| `class_id` | Yes | Must be `blog`. |
| `title` | For publication | 2 to 220 characters. |
| `content` | For publication | Plain text or Markdown, up to 30,000 characters. |
| `author_id` | No | External author identifier. |
| `image_url` | No | HTTP(S) URL or site-relative path. |

A signed request containing only `sign` and `class_id`, or short placeholder content, returns `{"code":1,"msg":"验证成功"}` without writing an article. A complete article returns `{"code":1,"msg":"发布成功"}`. Identical retries return success without inserting a duplicate.

Do not put the API key in this document, frontend code, Git, screenshots, or public logs.
