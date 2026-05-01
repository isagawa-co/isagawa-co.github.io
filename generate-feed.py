#!/usr/bin/env python3
"""Generate feed-data.json and feed-count.txt from attestation bundles."""

import json
import glob
import os
import sys

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
        "task_count": meta.get("task_count", 0),
        "completed_count": meta.get("completed_count", 0),
        "skipped_count": meta.get("skipped_count", 0),
        "intent_revisions": len(chain),
        "rekor_url": rekor.get("entryUrl", ""),
    }


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


if __name__ == "__main__":
    main()
