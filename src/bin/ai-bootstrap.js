#!/usr/bin/env node
"use strict";

const path = require("path");
const { materialize, TOOLS } = require("../lib/materialize");

const TOOL_NAMES = Object.keys(TOOLS);

const HELP = `
marcos-ai-bootstrap - materialise a tool-agnostic AI agent/skill network into any repository

Usage:
  marcos-ai-bootstrap [--claude] [--codex] [--copilot] [--all] [options]

Tool flags (combine as many as you like):
  --claude          Claude Code agents (.claude/agents), skills (.claude/skills),
                     CLAUDE.md (@MARCOS-AI-BOOTSTRAP.md include, appended if it exists)
  --codex           Codex agents (.codex/agents), skills (.agents/skills)
                     (Codex reads the always-written root AGENTS.md)
  --copilot         GitHub Copilot CLI agents (.github/agents), skills (.github/skills),
                     .github/copilot-instructions.md (@../MARCOS-AI-BOOTSTRAP.md include)
  --all             All of the above

Always written (regardless of tool flags):
  MARCOS-AI-BOOTSTRAP.md, HUMAN.md (the full tool-agnostic rules + human guide)
  AGENTS.md         universal entry-point wired with @MARCOS-AI-BOOTSTRAP.md
                     (created if absent; the include is appended to an existing
                     file without overwriting your content)

Options:
  --dest <path>     Target directory (default: current working directory)
  --force           Overwrite files that already exist (default: skip existing files)
  --dry-run         Show what would be written without writing anything
  -h, --help        Show this help text

Examples:
  npx marcos-ai-bootstrap --copilot
  npx marcos-ai-bootstrap --claude --codex --dry-run
  npx marcos-ai-bootstrap --all --force
`;

function parseArgs(argv) {
  const opts = { tools: [], dest: undefined, force: false, dryRun: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case "--all":
        opts.tools = TOOL_NAMES.slice();
        break;
      case "--claude":
      case "--codex":
      case "--copilot":
        opts.tools.push(arg.slice(2));
        break;
      case "--dest":
        opts.dest = argv[++i];
        break;
      case "--force":
        opts.force = true;
        break;
      case "--dry-run":
        opts.dryRun = true;
        break;
      case "-h":
      case "--help":
        opts.help = true;
        break;
      default:
        console.error(`Unknown argument: ${arg}\n`);
        opts.help = true;
        opts.unknown = true;
    }
  }
  opts.tools = Array.from(new Set(opts.tools));
  return opts;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help || opts.tools.length === 0) {
    console.log(HELP);
    process.exit(opts.unknown || opts.tools.length === 0 ? 1 : 0);
  }

  const destRoot = path.resolve(opts.dest || process.cwd());
  const { results } = materialize(opts.tools, {
    destRoot,
    force: opts.force,
    dryRun: opts.dryRun,
  });

  const toolLabels = opts.tools.map((t) => TOOLS[t].label).join(", ");
  console.log(
    `${opts.dryRun ? "[dry-run] " : ""}Materialising ${toolLabels} into ${destRoot}\n`
  );

  const byStatus = {
    created: [],
    overwritten: [],
    appended: [],
    "already-wired": [],
    "skipped-exists": [],
    "missing-source": [],
  };
  for (const r of results) {
    (byStatus[r.status] || (byStatus[r.status] = [])).push(r.relPath);
  }

  for (const r of byStatus.created) console.log(`  created      ${r}`);
  for (const r of byStatus.overwritten) console.log(`  overwritten  ${r}`);
  for (const r of byStatus.appended) console.log(`  appended     ${r} (@MARCOS-AI-BOOTSTRAP.md include added)`);
  for (const r of byStatus["already-wired"]) console.log(`  ok           ${r} (already references MARCOS-AI-BOOTSTRAP.md)`);
  for (const r of byStatus["skipped-exists"]) console.log(`  skipped      ${r} (already exists, use --force to overwrite)`);
  for (const r of byStatus["missing-source"]) console.log(`  MISSING      ${r} (not bundled in this package)`);

  console.log(
    `\n${byStatus.created.length} created, ${byStatus.overwritten.length} overwritten, ` +
      `${byStatus.appended.length} appended, ${byStatus["skipped-exists"].length} skipped, ` +
      `${results.length} total.`
  );

  if (!opts.dryRun) {
    console.log(
      `\nDone. Open MARCOS-AI-BOOTSTRAP.md / HUMAN.md, then start your AI tool in ${destRoot} to begin.`
    );
  }
}

main();
