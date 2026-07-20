"use strict";

const fs = require("fs");
const path = require("path");

const PACKAGE_ROOT = path.resolve(__dirname, "..", "..");

// Canonical, shipped source-of-truth core files live under src/ so they stay
// separate from this repo's own self-hosting AGENTS.md/HUMAN.md at the root.
// Each entry maps the package-relative source to the target-relative destination.
const CORE_FILES = [
  { src: "src/AGENTS.md", dest: "AGENTS.md" },
  { src: "src/HUMAN.md", dest: "HUMAN.md" },
  {
    src: "documents/templates/plan-template.md",
    dest: "documents/templates/plan-template.md",
  },
];

const TOOLS = {
  claude: {
    label: "Claude Code",
    dirs: [".claude/agents", ".claude/skills"],
    entry: {
      file: "CLAUDE.md",
      content: "@AGENTS.md\n",
    },
  },
  codex: {
    label: "Codex",
    dirs: [".codex/agents", ".agents/skills"],
    // Codex loads AGENTS.md directly from the workspace root; no separate
    // config entry-point file is required.
  },
  copilot: {
    label: "GitHub Copilot CLI",
    dirs: [".github/agents", ".github/skills"],
    entry: {
      file: path.join(".github", "copilot-instructions.md"),
      content:
        "# Copilot instructions\n\n" +
        "See [AGENTS.md](../AGENTS.md) for the agent rules and the agent/skill " +
        "network that has been materialised into this repository.\n",
    },
  },
};

/**
 * Recursively list files under a directory (relative posix-ish paths).
 */
function listFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listFiles(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

/**
 * Copy a single file from the package root to the destination root. The source
 * and destination relative paths may differ (e.g. src/AGENTS.md -> AGENTS.md).
 * Returns a status object keyed by the destination path.
 */
function copyOne(srcRel, destRel, destRoot, { force, dryRun }) {
  const src = path.join(PACKAGE_ROOT, srcRel);
  const dest = path.join(destRoot, destRel);

  if (!fs.existsSync(src)) {
    return { relPath: destRel, status: "missing-source" };
  }

  const exists = fs.existsSync(dest);
  if (exists && !force) {
    return { relPath: destRel, status: "skipped-exists" };
  }

  if (!dryRun) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
  return { relPath: destRel, status: exists ? "overwritten" : "created" };
}

/**
 * Write a small generated entry-point file (e.g. CLAUDE.md,
 * .github/copilot-instructions.md) rather than copying from the package.
 */
function writeEntry(entry, destRoot, { force, dryRun }) {
  const dest = path.join(destRoot, entry.file);
  const exists = fs.existsSync(dest);
  if (exists && !force) {
    return { relPath: entry.file, status: "skipped-exists" };
  }
  if (!dryRun) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, entry.content, "utf8");
  }
  return { relPath: entry.file, status: exists ? "overwritten" : "created" };
}

/**
 * Materialise the requested tools' agent/skill files, plus the tool-agnostic
 * core files (AGENTS.md, HUMAN.md), into destRoot.
 *
 * @param {string[]} tools - subset of Object.keys(TOOLS)
 * @param {object} opts - { destRoot, force, dryRun }
 * @returns {{results: Array, tools: string[]}}
 */
function materialize(tools, opts = {}) {
  const destRoot = path.resolve(opts.destRoot || process.cwd());
  const force = !!opts.force;
  const dryRun = !!opts.dryRun;

  const results = [];

  for (const cf of CORE_FILES) {
    results.push(copyOne(cf.src, cf.dest, destRoot, { force, dryRun }));
  }

  for (const toolName of tools) {
    const tool = TOOLS[toolName];
    if (!tool) continue;
    for (const dir of tool.dirs) {
      const files = listFiles(path.join(PACKAGE_ROOT, dir));
      for (const abs of files) {
        const relPath = path.relative(PACKAGE_ROOT, abs);
        results.push(copyOne(relPath, relPath, destRoot, { force, dryRun }));
      }
    }
    if (tool.entry) {
      results.push(writeEntry(tool.entry, destRoot, { force, dryRun }));
    }
  }

  return { results, tools, destRoot };
}

module.exports = { materialize, TOOLS, CORE_FILES, PACKAGE_ROOT };
