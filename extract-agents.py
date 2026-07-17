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

This script parses those blocks and writes each one to its path relative to the repo
root, creating any missing parent directories. Re-run it any time AGENTS-BOOTSTRAP.md
changes to resync the materialised agents/skills.

Usage:
    python extract-agents.py [path-to-AGENTS-BOOTSTRAP.md]
"""

import os
import re
import sys

DEFAULT_SOURCE = "AGENTS-BOOTSTRAP.md"

PATTERN = re.compile(
    r"^### `(?P<path>[^`]+)`\n(?P<fence>`{3,})[a-zA-Z]*\n(?P<body>.*?)\n(?P=fence)$",
    re.MULTILINE | re.DOTALL,
)


def extract(source_path: str) -> list[str]:
    text = open(source_path, encoding="utf-8").read()
    matches = list(PATTERN.finditer(text))

    base_dir = os.path.dirname(os.path.abspath(source_path)) or "."
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


def main() -> None:
    source_path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SOURCE
    written = extract(source_path)
    print(f"Materialised {len(written)} file(s) from {source_path}:")
    for path in written:
        print(f"  {path}")


if __name__ == "__main__":
    main()
