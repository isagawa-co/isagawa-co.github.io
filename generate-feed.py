#!/usr/bin/env python3
"""Generate feed-data.json and feed-count.txt from attestation bundles."""

import json
import glob
import os
import sys
from datetime import datetime, timezone

ATTESTATION_DIRS = [
    r"D:\my_ai_projects\project_test_repos\sr_dev_workspace\.claude\state\attestations",
    r"D:\my_ai_projects\project_test_repos\domain-spec-factory\.claude\state\attestations",
    r"D:\my_ai_projects\project_test_repos\game-dev\.claude\state\attestations",
]
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
    task_folder = meta.get("task_folder", "")
    start_time = ts.get("start", "")

    # Use spec name from task folder for factory output attestations
    title = extract_title(backlog)
    category = extract_category(backlog)
    if "domain-spec-factory/output/" in task_folder.replace("\\", "/"):
        spec_name = task_folder.rstrip("/\\").split("/")[-1].split("\\")[-1]
        title = f"Domain Spec: {spec_name.replace('-', ' ').title()}"
        category = "domain"
    elif "ssh-management-layer" in task_folder:
        title = "Domain Spec: SSH Compliance Framework"
        category = "domain"

    return {
        "title": title,
        "category": category,
        "timestamp": start_time,
        "task_count": meta.get("task_count") or 0,
        "completed_count": meta.get("completed_count", 0),
        "skipped_count": meta.get("skipped_count", 0),
        "intent_revisions": len(chain),
        "rekor_url": rekor.get("entryUrl", ""),
    }


def format_date_html(iso):
    """Format ISO timestamp to human-readable string (mirrors JS formatDate)."""
    if not iso:
        return "Unknown date"
    try:
        dt = datetime.fromisoformat(iso.replace("Z", "+00:00"))
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        return (f"{months[dt.month - 1]} {dt.day}, {dt.year} "
                f"{dt.hour:02d}:{dt.minute:02d} UTC")
    except (ValueError, AttributeError):
        return iso[:10] if len(iso) >= 10 else iso


def render_entry_html(e):
    """Render one feed entry as HTML (mirrors JS renderEntry)."""
    cat = e.get("category", "kernel")
    title = e.get("title", "")
    timestamp = format_date_html(e.get("timestamp", ""))
    task_count = e.get("task_count")
    tasks_str = f"{task_count} tasks" if task_count is not None else "\u2014"
    revisions = e.get("intent_revisions", 0)
    revs = "1 intent revision" if revisions == 1 else f"{revisions} intent revisions"
    rekor_url = e.get("rekor_url", "")
    rekor = (f'<a class="rekor-link" href="{rekor_url}" target="_blank" '
             f'rel="noopener">Verify on Rekor &#8599;</a>') if rekor_url else ""
    return (f'<div class="feed-entry cat-{cat}">'
            f'<span class="feed-entry__cat">{cat}</span>'
            f'<h3 class="feed-entry__title">{title}</h3>'
            f'<div class="feed-meta">'
            f'<span>{timestamp}</span>'
            f'<span>{tasks_str}</span>'
            f'<span>{revs}</span>'
            f'</div>{rekor}</div>')


def group_entries(entries):
    """Group consecutive entries with same title (mirrors JS groupEntries)."""
    groups = []
    i = 0
    while i < len(entries):
        current_title = entries[i].get("title", "")
        group_entries_list = [entries[i]]
        j = i + 1
        while j < len(entries) and entries[j].get("title", "") == current_title:
            group_entries_list.append(entries[j])
            j += 1
        groups.append((current_title, group_entries_list))
        i = j
    return groups


def render_group_html(group):
    """Render a group of entries (mirrors JS renderGroup)."""
    title, entries_list = group
    if len(entries_list) == 1:
        return render_entry_html(entries_list[0])
    cat = entries_list[0].get("category", "kernel")
    inner = "".join(render_entry_html(e) for e in entries_list)
    count = len(entries_list)
    return (f'<details class="feed-group cat-{cat}">'
            f'<summary class="feed-group__summary">'
            f'<span class="feed-entry__cat">{cat}</span>'
            f'<h3 class="feed-entry__title">{title}</h3>'
            f'<span class="feed-group__count">{count} runs</span>'
            f'</summary>'
            f'<div class="feed-group__entries">{inner}</div>'
            f'</details>')


def inject_static_feed(entries, output_dir):
    """Inject pre-rendered HTML into feed.html, replacing FEED_STATIC marker."""
    feed_path = os.path.join(output_dir, "feed.html")
    try:
        with open(feed_path, "r", encoding="utf-8") as f:
            html = f.read()
    except FileNotFoundError:
        sys.stderr.write(f"Warning: {feed_path} not found\n")
        return

    marker = "<!-- FEED_STATIC -->"
    if marker not in html:
        sys.stderr.write(f"Warning: {marker} not found in {feed_path}\n")
        return

    groups = group_entries(entries)
    rendered = "".join(render_group_html(g) for g in groups)
    html = html.replace(marker, rendered)

    with open(feed_path, "w", encoding="utf-8") as f:
        f.write(html)
    sys.stdout.write(f"Injected {len(entries)} entries into feed.html\n")


def main():
    bundles = []
    for att_dir in ATTESTATION_DIRS:
        bundles.extend(glob.glob(os.path.join(att_dir, "*.json")))
    bundles = [b for b in bundles if not b.endswith(".sigstore.json")]

    entries = []
    for b in bundles:
        entry = parse_bundle(b)
        if entry and entry["title"]:
            entries.append(entry)

    entries.sort(key=lambda e: e["timestamp"], reverse=True)
    count = len(entries)

    data_path = os.path.join(OUTPUT_DIR, "feed-data.json")
    with open(data_path, "w", encoding="utf-8") as f:
        json.dump(entries, f, indent=2)

    count_path = os.path.join(OUTPUT_DIR, "feed-count.txt")
    with open(count_path, "w") as f:
        f.write(str(count))

    sys.stdout.write(f"Generated feed-data.json with {count} entries\n")

    inject_static_feed(entries, OUTPUT_DIR)


if __name__ == "__main__":
    main()
