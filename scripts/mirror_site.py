#!/usr/bin/env python3
"""Mirror a legacy website into a local static asset folder.

This script intentionally uses only the Python standard library plus the
system curl binary, so it works in a fresh project before Node/Next.js setup.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import os
import re
import subprocess
import sys
import tempfile
import time
from dataclasses import dataclass, asdict
from html.parser import HTMLParser
from pathlib import Path
from typing import Iterable
from urllib.parse import urldefrag, urljoin, urlparse


ASSET_ATTRS = {
    "audio": ("src",),
    "embed": ("src",),
    "iframe": ("src",),
    "img": ("src", "srcset", "data-src", "data-original"),
    "input": ("src",),
    "link": ("href",),
    "script": ("src",),
    "source": ("src", "srcset"),
    "track": ("src",),
    "video": ("src", "poster"),
}

CSS_URL_RE = re.compile(r"url\((['\"]?)(.*?)\1\)", re.IGNORECASE)
CSS_IMPORT_RE = re.compile(r"@import\s+(?:url\()?['\"]?([^'\"\);]+)", re.IGNORECASE)


@dataclass
class FetchRecord:
    url: str
    local_path: str | None
    status: int | None
    content_type: str | None
    bytes: int
    error: str | None = None


class LinkExtractor(HTMLParser):
    def __init__(self, base_url: str) -> None:
        super().__init__()
        self.base_url = base_url
        self.page_links: set[str] = set()
        self.asset_links: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr_map = {key.lower(): value for key, value in attrs if value}
        if tag == "a" and attr_map.get("href"):
            self.page_links.add(resolve_url(self.base_url, attr_map["href"]))

        if tag == "meta" and attr_map.get("content"):
            prop = (attr_map.get("property") or attr_map.get("name") or "").lower()
            if prop in {"og:image", "twitter:image", "twitter:image:src"}:
                self.asset_links.add(resolve_url(self.base_url, attr_map["content"]))

        for attr in ASSET_ATTRS.get(tag, ()):
            value = attr_map.get(attr)
            if not value:
                continue
            if tag == "link" and not should_fetch_link_tag(attr_map):
                continue
            if attr == "srcset":
                for candidate in parse_srcset(value):
                    self.asset_links.add(resolve_url(self.base_url, candidate))
            else:
                self.asset_links.add(resolve_url(self.base_url, value))


def parse_srcset(value: str) -> Iterable[str]:
    for part in value.split(","):
        candidate = part.strip().split()
        if candidate:
            yield candidate[0]


def should_fetch_link_tag(attr_map: dict[str, str]) -> bool:
    rel = {part.strip().lower() for part in (attr_map.get("rel") or "").split()}
    if not rel:
        return False
    if rel.intersection({"stylesheet", "icon", "apple-touch-icon", "manifest", "modulepreload"}):
        return True
    if "preload" in rel and (attr_map.get("as") or "").lower() in {"style", "script", "font", "image"}:
        return True
    return False


def resolve_url(base_url: str, value: str) -> str:
    value = value.strip()
    if not value or value.startswith(("data:", "mailto:", "tel:", "javascript:")):
        return ""
    absolute, _fragment = urldefrag(urljoin(base_url, value))
    return absolute


def is_same_site(url: str, root_host: str) -> bool:
    host = urlparse(url).hostname or ""
    return host == root_host or host == f"www.{root_host}" or f"www.{host}" == root_host


def local_path_for(url: str, output_dir: Path, content_type: str | None) -> Path:
    parsed = urlparse(url)
    raw_path = parsed.path or "/"
    if raw_path.endswith("/"):
        raw_path += "index.html"

    path = Path(raw_path.lstrip("/"))
    if content_type and "text/html" in content_type and path.suffix == "":
        path = path / "index.html"

    if parsed.query:
        digest = hashlib.sha1(parsed.query.encode("utf-8")).hexdigest()[:10]
        suffix = path.suffix
        stem = path.name[: -len(suffix)] if suffix else path.name
        path = path.with_name(f"{stem}__q_{digest}{suffix}")

    return output_dir / parsed.hostname.replace(":", "_") / path


def parse_headers(header_text: str) -> tuple[int | None, str | None]:
    status = None
    content_type = None
    for line in header_text.splitlines():
        line = line.strip()
        if line.startswith("HTTP/"):
            parts = line.split()
            if len(parts) >= 2 and parts[1].isdigit():
                status = int(parts[1])
        elif line.lower().startswith("content-type:"):
            content_type = line.split(":", 1)[1].strip().split(";", 1)[0].lower()
    return status, content_type


def fetch_with_curl(url: str, args: argparse.Namespace) -> tuple[bytes, int | None, str | None]:
    parsed = urlparse(url)
    header_file = tempfile.NamedTemporaryFile(delete=False)
    body_file = tempfile.NamedTemporaryFile(delete=False)
    header_file.close()
    body_file.close()

    command = [
        "curl",
        "-L",
        "--compressed",
        "--silent",
        "--show-error",
        "--connect-timeout",
        str(args.connect_timeout),
        "--max-time",
        str(args.timeout),
        "-A",
        args.user_agent,
        "-D",
        header_file.name,
        "-o",
        body_file.name,
    ]

    if args.host_ip and parsed.hostname and parsed.scheme in {"http", "https"}:
        port = 443 if parsed.scheme == "https" else 80
        command.extend(["--resolve", f"{parsed.hostname}:{port}:{args.host_ip}"])

    command.append(url)
    completed = subprocess.run(command, text=True, capture_output=True)

    try:
        headers = Path(header_file.name).read_text(errors="replace")
        body = Path(body_file.name).read_bytes()
    finally:
        os.unlink(header_file.name)
        os.unlink(body_file.name)

    if completed.returncode != 0:
        raise RuntimeError(completed.stderr.strip() or f"curl exited {completed.returncode}")

    status, content_type = parse_headers(headers)
    return body, status, content_type


def extract_css_links(base_url: str, css_text: str) -> set[str]:
    links: set[str] = set()
    for _quote, value in CSS_URL_RE.findall(css_text):
        links.add(resolve_url(base_url, value))
    for value in CSS_IMPORT_RE.findall(css_text):
        links.add(resolve_url(base_url, value))
    return {link for link in links if link}


def write_manifest(output_dir: Path, start_urls: list[str], args: argparse.Namespace, records: list[FetchRecord]) -> None:
    manifest = {
        "start_urls": start_urls,
        "host_ip": args.host_ip,
        "output_dir": str(output_dir),
        "fetched_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "records": [asdict(record) for record in records],
    }
    (output_dir / ".mirror-manifest.json").write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def sitemap_urls(sitemap_url: str, args: argparse.Namespace, visited: set[str] | None = None) -> list[str]:
    visited = visited or set()
    if sitemap_url in visited:
        return []
    visited.add(sitemap_url)

    body, status, _content_type = fetch_with_curl(sitemap_url, args)
    if status and status >= 400:
        raise RuntimeError(f"Sitemap returned HTTP {status}: {sitemap_url}")

    xml = body.decode("utf-8", errors="replace")
    locs = [html.unescape(match) for match in re.findall(r"<loc>\s*(.*?)\s*</loc>", xml, re.IGNORECASE | re.DOTALL)]
    urls: list[str] = []
    for loc in locs:
        if re.search(r"/sitemap[^/]*\.xml(?:\?|$)", urlparse(loc).path + ("?" if urlparse(loc).query else "")):
            urls.extend(sitemap_urls(loc, args, visited))
        else:
            urls.append(loc)
    return urls


def mirror(args: argparse.Namespace) -> int:
    start_urls: list[str] = []
    if args.start_url:
        start_urls.append(args.start_url)
    for sitemap_url in args.sitemap:
        print(f"Reading sitemap: {sitemap_url}", flush=True)
        start_urls.extend(sitemap_urls(sitemap_url, args))
    if args.seed_file:
        start_urls.extend(
            line.strip()
            for line in Path(args.seed_file).read_text(encoding="utf-8").splitlines()
            if line.strip() and not line.strip().startswith("#")
        )

    start_urls = list(dict.fromkeys(start_urls))
    if not start_urls:
        print("Provide a start URL, --sitemap, or --seed-file.", file=sys.stderr)
        return 2

    root_host = urlparse(start_urls[0]).hostname
    if not root_host:
        print(f"Invalid start URL: {start_urls[0]}", file=sys.stderr)
        return 2

    output_dir = Path(args.output).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    queue: list[str] = start_urls[:]
    queued: set[str] = set(start_urls)
    seen: set[str] = set()
    records: list[FetchRecord] = []

    while queue and len(seen) < args.max_urls:
        url = queue.pop(0)
        if url in seen:
            continue
        seen.add(url)
        print(f"[{len(seen)}] {url}", flush=True)

        try:
            body, status, content_type = fetch_with_curl(url, args)
            local_path = local_path_for(url, output_dir, content_type)
            local_path.parent.mkdir(parents=True, exist_ok=True)
            local_path.write_bytes(body)
            records.append(
                FetchRecord(url, str(local_path.relative_to(output_dir)), status, content_type, len(body))
            )
            if len(records) % args.manifest_every == 0:
                write_manifest(output_dir, start_urls, args, records)
        except Exception as exc:
            records.append(FetchRecord(url, None, None, None, 0, str(exc)))
            print(f"  failed: {exc}", file=sys.stderr)
            if len(records) % args.manifest_every == 0:
                write_manifest(output_dir, start_urls, args, records)
            continue

        if status and status >= 400:
            continue

        text = ""
        if content_type and (content_type.startswith("text/") or content_type in {"application/javascript"}):
            text = body.decode("utf-8", errors="replace")

        discovered: set[str] = set()
        if content_type and "text/html" in content_type:
            extractor = LinkExtractor(url)
            extractor.feed(text)
            discovered.update(link for link in extractor.asset_links if link)
            for page_url in extractor.page_links:
                if page_url and is_same_site(page_url, root_host):
                    discovered.add(page_url)
        elif content_type and "css" in content_type:
            discovered.update(extract_css_links(url, text))

        for link in sorted(discovered):
            if not link or link in queued or link in seen:
                continue
            parsed = urlparse(link)
            if parsed.scheme not in {"http", "https"}:
                continue
            if is_same_site(link, root_host) or args.include_external_assets:
                queue.append(link)
                queued.add(link)

        if args.delay:
            time.sleep(args.delay)

    write_manifest(output_dir, start_urls, args, records)

    failures = sum(1 for record in records if record.error)
    print(f"Done. {len(records)} attempted, {failures} failed. Manifest: {output_dir / '.mirror-manifest.json'}")
    return 0 if failures == 0 else 1


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Mirror a legacy site for a future Next.js rebuild.")
    parser.add_argument("start_url", nargs="?", help="Site URL to start crawling, for example https://example.com/")
    parser.add_argument("--sitemap", action="append", default=[], help="Sitemap URL to seed the crawl. Can be repeated.")
    parser.add_argument("--seed-file", help="Text file with one seed URL per line")
    parser.add_argument("--output", default="legacy-site", help="Local output folder")
    parser.add_argument("--max-urls", type=int, default=1000, help="Maximum URLs to attempt")
    parser.add_argument("--host-ip", help="Force a hostname to a specific old-server IP via curl --resolve")
    parser.add_argument("--include-external-assets", action="store_true", help="Also download CDN/external assets")
    parser.add_argument("--manifest-every", type=int, default=25, help="Write the manifest after this many records")
    parser.add_argument("--delay", type=float, default=0.1, help="Delay between requests in seconds")
    parser.add_argument("--connect-timeout", type=int, default=15)
    parser.add_argument("--timeout", type=int, default=60)
    parser.add_argument("--user-agent", default="Mozilla/5.0 (compatible; LegacyMirror/1.0)")
    return parser


if __name__ == "__main__":
    raise SystemExit(mirror(build_parser().parse_args()))
