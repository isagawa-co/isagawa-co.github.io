#!/usr/bin/env python3
"""Generate feed.html from attestation bundle JSON files."""

import json
import glob
import os
import sys
from datetime import datetime
from pathlib import Path

ATTESTATION_DIR = r"D:\my_ai_projects\project_test_repos\sr_dev_workspace\.claude\state\attestations"
OUTPUT_DIR = r"D:\my_ai_projects\isagawa-co.github.io"


def extract_category(backlog_path):
    """Extract category tag from backlog filename."""
    name = os.path.basename(str(backlog_path))
    parts = name.split("-")
    if len(parts) >= 2:
        tag = parts[1]
        if tag in ("kernel", "market", "domain", "test", "qa"):
            return tag
    return "kernel"


def extract_title(backlog_path):
    """Extract human-readable title from backlog path."""
    name = os.path.basename(str(backlog_path))
    name = name.replace(".md", "")
    parts = name.split("-", 2)
    if len(parts) >= 3:
        return parts[2].replace("-", " ").title()
    return name


def parse_bundle(filepath):
    """Parse an attestation bundle JSON file."""
    try:
        with open(filepath, "r") as f:
            data = json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return None

    pred = data.get("predicate", data)
    meta = pred.get("metadata", {})
    ts = pred.get("timestamp", {})
    invocation = pred.get("invocation", {})
    rekor = pred.get("rekor", {})
    chain = invocation.get("intent_chain", [])

    backlog = meta.get("pipeline_backlog", "")
    start_time = ts.get("start", "")

    return {
        "title": extract_title(backlog),
        "backlog": backlog,
        "category": extract_category(backlog),
        "timestamp": start_time,
        "task_count": meta.get("task_count", 0),
        "completed_count": meta.get("completed_count", 0),
        "skipped_count": meta.get("skipped_count", 0),
        "intent_revisions": len(chain),
        "rekor_url": rekor.get("entryUrl", ""),
        "rekor_index": rekor.get("logIndex", ""),
        "filename": os.path.basename(filepath),
    }


def format_date(iso_str):
    """Format ISO timestamp to human-readable date."""
    if not iso_str:
        return "Unknown date"
    try:
        dt = datetime.fromisoformat(iso_str.replace("Z", "+00:00"))
        return dt.strftime("%b %d, %Y %H:%M UTC")
    except (ValueError, TypeError):
        return iso_str[:10]


def generate_entry_html(entry):
    """Generate HTML for a single feed entry."""
    cat = entry["category"]
    rekor_html = ""
    if entry["rekor_url"]:
        rekor_html = f'<a class="rekor-link" href="{entry["rekor_url"]}" target="_blank" rel="noopener">Verify on Rekor ↗</a>'

    return f"""    <div class="feed-entry cat-{cat}">
      <span class="feed-entry__cat">{cat}</span>
      <h3 class="feed-entry__title">{entry["title"]}</h3>
      <div class="feed-meta">
        <span>{format_date(entry["timestamp"])}</span>
        <span>{entry["task_count"]} tasks</span>
        <span>{entry["intent_revisions"]} intent revision{"s" if entry["intent_revisions"] != 1 else ""}</span>
      </div>
      {rekor_html}
    </div>"""


def generate_feed_html(entries, count):
    """Generate the complete feed.html page."""
    entries_html = "\n".join(generate_entry_html(e) for e in entries)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Isagawa | Attestation Feed</title>
  <link rel="stylesheet" href="feed.css">
</head>
<body>
  <header class="site-header">
    <nav class="nav">
      <a href="index.html" class="nav__logo">ISAGAWA</a>
      <ul class="nav__links">
        <li><a href="index.html">Home</a></li>
        <li><a href="index.html#self-extension">Self-Extension</a></li>
        <li><a href="index.html#provenance">Provenance</a></li>
        <li class="nav__active"><a href="feed.html">Feed</a></li>
        <li class="attested-counter"><span class="counter-number">{count}</span> ✓</li>
      </ul>
    </nav>
  </header>

  <section class="feed-section">
    <h1 class="feed-header">Attestation Feed</h1>
    <p class="feed-subtitle">Every entry below was produced from a sentence of natural language, executed under kernel governance, and signed with Sigstore.</p>
    <p class="feed-count">{count} attested pipeline runs</p>

    <div class="feed-entries" data-count="{count}">
{entries_html}
    </div>

    <p class="feed-footer">This feed updates automatically. Come back tomorrow and there will be more.</p>
  </section>
</body>
</html>"""


def main():
    bundles = glob.glob(os.path.join(ATTESTATION_DIR, "*.json"))
    bundles = [b for b in bundles if not b.endswith(".sigstore.json")]

    entries = []
    for b in bundles:
        entry = parse_bundle(b)
        if entry and entry["title"]:
            entries.append(entry)

    entries.sort(key=lambda e: e["timestamp"], reverse=True)
    count = len(entries)

    feed_html = generate_feed_html(entries, count)
    feed_path = os.path.join(OUTPUT_DIR, "feed.html")
    with open(feed_path, "w", encoding="utf-8") as f:
        f.write(feed_html)

    count_path = os.path.join(OUTPUT_DIR, "feed-count.txt")
    with open(count_path, "w") as f:
        f.write(str(count))

    sys.stdout.write(f"Generated feed.html with {count} entries\n")


if __name__ == "__main__":
    main()
