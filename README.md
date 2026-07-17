# marcos-ai-bootstrap

A tool-agnostic AI agent/skill network (planner, code, docs, infra, explorer, test-runner,
log-reader, triage, investigate) plus a `watch-ci` / `planner` / `implement` skill pipeline —
defined once in [`AGENTS.md`](./AGENTS.md) and [`AGENTS-BOOTSTRAP.md`](./AGENTS-BOOTSTRAP.md),
and materialised for **Claude Code**, **Codex**, and **GitHub Copilot CLI**.

See [`HUMAN.md`](./HUMAN.md) for the day-to-day workflow once the network is set up.

## Quick start: the `marcos-ai-bootstrap` CLI

The fastest way to bring this agent network into any repository — no AI turn required,
works the same on Windows/Mac/Linux, and doesn't care whether the target project is
Node, Python, Go, or anything else:

```bash
npx marcos-ai-bootstrap --copilot        # GitHub Copilot CLI agents + skills
npx marcos-ai-bootstrap --claude         # Claude Code agents + skills
npx marcos-ai-bootstrap --codex          # Codex agents + skills
npx marcos-ai-bootstrap --claude --codex # combine any subset
npx marcos-ai-bootstrap --all            # every tool at once
```

Run it from the root of the repository you want to bootstrap. It writes `AGENTS.md`,
`AGENTS-BOOTSTRAP.md`, and `HUMAN.md` (the tool-agnostic rules + human guide) alongside
the agent/skill files for whichever tool(s) you selected:

| Flag | Writes |
|---|---|
| `--claude` | `.claude/agents/*.md`, `.claude/skills/**/SKILL.md`, `CLAUDE.md` (`@AGENTS.md` stub) |
| `--codex` | `.codex/agents/*.toml`, `.agents/skills/**/SKILL.md` |
| `--copilot` | `.github/agents/*.agent.md`, `.github/skills/**/SKILL.md`, `.github/copilot-instructions.md` |
| `--all` | all of the above |

### Options

| Flag | Effect |
|---|---|
| `--dest <path>` | Target directory (default: current working directory) |
| `--force` | Overwrite files that already exist (default: skip existing files) |
| `--dry-run` | Print what would be written without touching disk |
| `-h`, `--help` | Show usage |

Existing files are never clobbered unless you pass `--force`, so it's safe to re-run
`marcos-ai-bootstrap` in a repo that already has some of the network materialised (e.g. to add
`--codex` support to a repo that only had `--copilot` before).

### Installing globally instead of via `npx`

```bash
npm install -g marcos-ai-bootstrap
marcos-ai-bootstrap --all
```

## Repository layout

- `AGENTS.md` — tool-agnostic rules: guardrails, delivery/documentation rules, the
  canonical agent roles, and the canonical skills (`watch-ci`, `planner`, `implement`).
- `AGENTS-BOOTSTRAP.md` — the source of truth for each tool's materialised agent/skill
  files, model tier mappings, and MCP server discovery/policy flow.
- `.claude/`, `.codex/`, `.github/`, `.agents/` — the already-materialised, checked-in
  agent/skill files for this repo itself, and the templates the `marcos-ai-bootstrap` CLI ships
  and copies into other repositories.
- `bin/ai-bootstrap.js`, `lib/materialize.js` — the CLI implementation.
- `extract-agents.py` — maintainer tool: regenerates the `.claude/`, `.codex/`,
  `.github/` template files from `AGENTS-BOOTSTRAP.md` after editing it. Run this after
  changing `AGENTS-BOOTSTRAP.md`, then commit the regenerated templates so `marcos-ai-bootstrap`
  ships the update.

## Maintaining this repo

1. Edit `AGENTS-BOOTSTRAP.md` (the source of truth for agent/skill prompt bodies).
2. Run `python extract-agents.py` to regenerate the materialised template files.
3. Run `node bin/ai-bootstrap.js --all --dry-run --dest <scratch-dir>` to sanity-check
   the CLI still packages everything correctly.
4. Commit the changes.
