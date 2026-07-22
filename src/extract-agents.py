"""Materialise the tool-specific agent/skill files defined in AGENTS-BOOTSTRAP.md.

AGENTS-BOOTSTRAP.md embeds one fenced code block per target file, each preceded by a
heading of the form:

    ### `<relative/path/to/file>`
    ```<optional-lang>
    <file content>
    ```

Some file bodies (e.g. the triage agents) themselves contain illustrative 3-backtick
markdown examples nested inside the body. Those blocks use a longer, 4-backtick outer
fence (` ```` `) so the outer fence can never be confused with an inner one. The regex
below captures the opening fence's exact backtick run and requires the closing fence to
be that same run (via a backreference), so it correctly skips over any shorter nested
fences in the body.

This script parses those blocks and writes each one to its path under src/,
creating any missing parent directories. By default it then also syncs this repo's
root self-hosted copies from src/ (by invoking src/bin/ai-bootstrap.js), so the
shipped templates and the root copies stay consistent for local testing before
deployment. Re-run it any time AGENTS-BOOTSTRAP.md changes.

Usage:
    python extract-agents.py [path-to-AGENTS-BOOTSTRAP.md] [--src-only]

    --src-only   Only regenerate the src/ templates; skip syncing the repo root.
"""

import os
import re
import shutil
import subprocess
import sys

DEFAULT_SOURCE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "AGENTS-BOOTSTRAP.md")

# Materialised template files are written into the src/ directory that holds this
# script — src/ is the single shipped source of truth the CLI reads from. The
# path headings in AGENTS-BOOTSTRAP.md stay repo-root-relative (e.g.
# .github/agents/foo) and are rooted under src/ here (-> src/.github/agents/foo).
OUTPUT_ROOT = os.path.dirname(os.path.abspath(__file__))

# The repo root is the parent of src/. The CLI (src/bin/ai-bootstrap.js) copies
# src/* into a destination root; pointing it at the repo root regenerates this
# repo's self-hosted copies (.claude/.codex/.github/.agents, AGENTS.md, ...).
REPO_ROOT = os.path.dirname(OUTPUT_ROOT)
CLI_ENTRY = os.path.join(OUTPUT_ROOT, "bin", "ai-bootstrap.js")

PATTERN = re.compile(
    r"^### `(?P<path>[^`]+)`\n(?P<fence>`{3,})[a-zA-Z]*\n(?P<body>.*?)\n(?P=fence)$",
    re.MULTILINE | re.DOTALL,
)


def extract(source_path: str) -> list[str]:
    text = open(source_path, encoding="utf-8").read()
    matches = list(PATTERN.finditer(text))

    base_dir = OUTPUT_ROOT
    written = []
    for m in matches:
        rel_path = m.group("path").strip()
        body = m.group("body")
        full_path = os.path.join(base_dir, rel_path.replace("/", os.sep))
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "w", encoding="utf-8", newline="\n") as f:
            f.write(body + "\n")
        written.append(rel_path)
    return written


def materialize_repo_root() -> None:
    """Sync the repo-root self-hosted copies from src/ via the CLI.

    Runs `node src/bin/ai-bootstrap.js --all --force --dest <repo-root>` so the
    root copies stay in lockstep with the freshly extracted src/ templates. The
    src/ -> root mapping logic deliberately lives in one place
    (src/lib/materialize.js), so this shells out rather than reimplementing it.
    """
    node = shutil.which("node")
    if node is None:
        print(
            "\nwarning: 'node' not found on PATH; skipping repo-root sync.\n"
            "  Run `node src/bin/ai-bootstrap.js --all --force --dest .` "
            "manually to sync the root copies."
        )
        return
    cmd = [node, CLI_ENTRY, "--all", "--force", "--dest", REPO_ROOT]
    print(f"\nSyncing repo-root copies from src/: {' '.join(cmd)}")
    subprocess.run(cmd, check=True)


def main() -> None:
    args = sys.argv[1:]
    src_only = False
    positional: list[str] = []
    for arg in args:
        if arg in ("--src-only", "--no-root"):
            src_only = True
        else:
            positional.append(arg)

    source_path = positional[0] if positional else DEFAULT_SOURCE
    written = extract(source_path)
    print(f"Materialised {len(written)} file(s) into src/ from {source_path}:")
    for rel_path in written:
        print(f"  {rel_path}")

    if src_only:
        print("\n--src-only: skipping repo-root sync.")
        return
    materialize_repo_root()


if __name__ == "__main__":
    main()
