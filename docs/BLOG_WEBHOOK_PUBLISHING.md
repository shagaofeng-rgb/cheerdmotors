# Blog publishing webhook

This endpoint is for an authenticated external publishing plugin. It publishes only when the plugin sends a request with the configured API key; it does not create or re-enable a Blog schedule.

## Endpoint

`POST https://cheerdmotors.com/api/webhook/send_article`

Send `application/x-www-form-urlencoded` (JSON is also accepted). The response always has this shape:

```json
{"code": 1, "msg": "发布成功"}
```

Failed requests return `code: 0` and a reason in `msg`.

## Fields

| Field | Required | Notes |
| --- | --- | --- |
| `sign` | Yes | Long-lived API key stored only in the production environment. |
| `class_id` | Yes | Must be exactly `blog`. |
| `title` | Yes | 2 to 220 characters. |
| `content` | Yes | Plain text or Markdown, up to 30,000 characters. |
| `author_id` | No | Plugin author identifier shown in the article metadata. |
| `image_url` | No | Absolute `https`/`http` image URL or a site-relative image path. |

The endpoint is idempotent: an identical payload returns success without adding a duplicate post. A published post is written directly to the production content store and appears on `/blog` immediately.

## Example

```bash
curl --request POST 'https://cheerdmotors.com/api/webhook/send_article' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'sign=YOUR_API_KEY' \
  --data-urlencode 'class_id=blog' \
  --data-urlencode 'title=Electric mobility buying guide' \
  --data-urlencode 'content=## Introduction\n\nArticle body in Markdown.' \
  --data-urlencode 'author_id=plugin-editor' \
  --data-urlencode 'image_url=https://cheerdmotors.com/volt-lab/products/xceed_transparent.png'
```
