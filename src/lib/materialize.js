"use strict";

const fs = require("fs");
const path = require("path");

const PACKAGE_ROOT = path.resolve(__dirname, "..", "..");

// Everything the CLI materialises into a target repo ships from a single
// source-of-truth directory: src/. The destination path is the source path with
// the leading "src/" stripped (e.g. src/MARCOS-AI-BOOTSTRAP.md ->
// MARCOS-AI-BOOTSTRAP.md, src/.github/agents/foo -> .github/agents/foo). This
// repo's own root-level self-hosting copies are generated from these src/
// sources and are not themselves published to npm.
const SRC_DIR = "src";

const toPosix = (p) => p.split(path.sep).join("/");

// Canonical, shipped source-of-truth core files. Each entry maps the
// package-relative source (under src/) to the target-relative destination. The
// full agent rules ship as MARCOS-AI-BOOTSTRAP.md so they never collide with a
// user's own AGENTS.md / CLAUDE.md; the tool entry-points below only *reference*
// this file via an appended @-include.
const CORE_FILES = [
  { src: "src/MARCOS-AI-BOOTSTRAP.md", dest: "MARCOS-AI-BOOTSTRAP.md" },
  { src: "src/HUMAN.md", dest: "HUMAN.md" },
  {
    src: "src/documents/templates/plan-template.md",
    dest: "documents/templates/plan-template.md",
  },
];

// The short block appended to a tool's instruction file. `ref` is the tool-
// correct @-include path to MARCOS-AI-BOOTSTRAP.md (relative to the entry file).
function includeBlock(ref) {
  return (
    "# Marcos AI-Bootstrap\n\n" +
    "This repository uses the Marcos AI-Bootstrap agent/skill network. See " +
    ref +
    " for the agent rules, the MCP server flow, and the canonical agent/skill roles.\n"
  );
}

// Marker used to detect an already-wired instruction file (idempotency).
const INCLUDE_MARKER = "MARCOS-AI-BOOTSTRAP.md";

// AGENTS.md is the broadest cross-tool convention (read by Codex, the Copilot
// coding agent, Cursor, Aider, and a growing set of others). It is therefore
// wired on every invocation, regardless of which tool flags were passed, as a
// thin @-include of the shipped rules. Tool-native entry-points (CLAUDE.md,
// .github/copilot-instructions.md) are still written alongside it. Codex reads
// this same file, so it no longer needs a separate tool-specific entry.
const CORE_ENTRY = { file: "AGENTS.md", include: "@MARCOS-AI-BOOTSTRAP.md" };

const TOOLS = {
  claude: {
    label: "Claude Code",
    dirs: [".claude/agents", ".claude/skills"],
    // Claude reads CLAUDE.md; @-imports resolve relative to it (repo root).
    entry: { file: "CLAUDE.md", include: "@MARCOS-AI-BOOTSTRAP.md" },
  },
  codex: {
    label: "Codex",
    dirs: [".codex/agents", ".agents/skills"],
    // Codex loads AGENTS.md directly from the workspace root, which is now
    // always written as the universal CORE_ENTRY, so no tool-specific entry is
    // needed here.
    entry: null,
  },
  copilot: {
    label: "GitHub Copilot CLI",
    dirs: [".github/agents", ".github/skills"],
    // Copilot reads .github/copilot-instructions.md; the rules file sits one
    // directory up at the repo root.
    entry: {
      file: path.join(".github", "copilot-instructions.md"),
      include: "@../MARCOS-AI-BOOTSTRAP.md",
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
 * and destination relative paths may differ (e.g. src/MARCOS-AI-BOOTSTRAP.md -> MARCOS-AI-BOOTSTRAP.md).
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
 * Wire a tool's instruction entry-point (e.g. CLAUDE.md,
 * .github/copilot-instructions.md, AGENTS.md) to the shipped
 * MARCOS-AI-BOOTSTRAP.md rules. Never overwrites existing user content: if the
 * file already references the rules file it is left untouched; otherwise the
 * include block is appended. The file is created with just the block if absent.
 */
function appendEntry(entry, destRoot, { dryRun }) {
  const dest = path.join(destRoot, entry.file);
  const block = includeBlock(entry.include);

  if (fs.existsSync(dest)) {
    const current = fs.readFileSync(dest, "utf8");
    if (current.includes(INCLUDE_MARKER)) {
      return { relPath: entry.file, status: "already-wired" };
    }
    if (!dryRun) {
      const sep = current.length === 0 || current.endsWith("\n") ? "\n" : "\n\n";
      fs.appendFileSync(dest, sep + block);
    }
    return { relPath: entry.file, status: "appended" };
  }

  if (!dryRun) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, block, "utf8");
  }
  return { relPath: entry.file, status: "created" };
}

// Marker heading under which materialised-file ignore patterns are appended to
// the user's .gitignore. Presence of this marker is how a re-run finds (and
// extends, rather than duplicates) the block on subsequent invocations.
const GITIGNORE_MARKER = "# Marcos AI-Bootstrap (materialised files)";

/**
 * Append any ignore patterns not already present in the destination
 * .gitignore, under a marker heading (added once). Idempotent: re-running
 * with the same or a subset of patterns writes nothing further.
 */
function writeGitignoreEntries(patterns, destRoot, { dryRun }) {
  const dest = path.join(destRoot, ".gitignore");
  const exists = fs.existsSync(dest);
  const current = exists ? fs.readFileSync(dest, "utf8") : "";
  const currentLines = new Set(current.split(/\r?\n/).map((l) => l.trim()));

  const missing = patterns.filter((p) => !currentLines.has(p));
  if (missing.length === 0) {
    return { relPath: ".gitignore", status: exists ? "already-wired" : "created" };
  }

  const hasMarker = current.includes(GITIGNORE_MARKER);
  const block = (hasMarker ? "" : GITIGNORE_MARKER + "\n") + missing.join("\n") + "\n";

  if (!dryRun) {
    const sep = current.length === 0 ? "" : current.endsWith("\n") ? "\n" : "\n\n";
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.appendFileSync(dest, sep + block);
  }
  return { relPath: ".gitignore", status: exists ? "appended" : "created" };
}

/**
 * Materialise the requested tools' agent/skill files, plus the tool-agnostic
 * core files (AGENTS.md, HUMAN.md), into destRoot.
 *
 * @param {string[]} tools - subset of Object.keys(TOOLS)
 * @param {object} opts - { destRoot, force, dryRun, gitignore }
 *   gitignore: when true, materialised files are added to the destination's
 *   .gitignore instead of being tracked, and no instruction entry-point
 *   (AGENTS.md, CLAUDE.md, .github/copilot-instructions.md) is created or
 *   amended.
 * @returns {{results: Array, tools: string[]}}
 */
function materialize(tools, opts = {}) {
  const destRoot = path.resolve(opts.destRoot || process.cwd());
  const force = !!opts.force;
  const dryRun = !!opts.dryRun;
  const gitignore = !!opts.gitignore;

  const results = [];
  const ignorePatterns = [];

  for (const cf of CORE_FILES) {
    results.push(copyOne(cf.src, cf.dest, destRoot, { force, dryRun }));
    ignorePatterns.push(cf.dest);
  }

  // AGENTS.md is wired on every invocation as the universal entry-point,
  // unless --gitignore asked us not to touch the user's instruction files.
  if (!gitignore) {
    results.push(appendEntry(CORE_ENTRY, destRoot, { dryRun }));
  }

  for (const toolName of tools) {
    const tool = TOOLS[toolName];
    if (!tool) continue;
    for (const dir of tool.dirs) {
      // Sources live under src/<dir>; the destination drops the src/ prefix.
      const srcDir = path.join(PACKAGE_ROOT, SRC_DIR, dir);
      const files = listFiles(srcDir);
      for (const abs of files) {
        const rel = toPosix(path.relative(srcDir, abs));
        const srcRel = path.posix.join(SRC_DIR, toPosix(dir), rel);
        const destRel = path.posix.join(toPosix(dir), rel);
        results.push(copyOne(srcRel, destRel, destRoot, { force, dryRun }));
      }
      ignorePatterns.push(toPosix(dir) + "/");
    }
    if (tool.entry && !gitignore) {
      results.push(appendEntry(tool.entry, destRoot, { dryRun }));
    }
  }

  if (gitignore) {
    results.push(writeGitignoreEntries(ignorePatterns, destRoot, { dryRun }));
  }

  return { results, tools, destRoot };
}

module.exports = {
  materialize,
  TOOLS,
  CORE_FILES,
  CORE_ENTRY,
  PACKAGE_ROOT,
  GITIGNORE_MARKER,
};
