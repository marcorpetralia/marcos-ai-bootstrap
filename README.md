# marcos-ai-bootstrap

AI tools for doing work. No overcomplications.

Tool-agnostic agent/skill network that is built around a basic flow of plan -> implement -> deploy -> fix -> deploy etc.

Currently supporting **Claude Code**, **Codex**, and **GitHub Copilot CLI** but easily adjustable to fit your workflow.

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

Run it from the root of the repository you want to bootstrap. It writes three always-present
core files—`AGENTS.md`, `HUMAN.md` (the tool-agnostic rules + human guide), and
`documents/templates/plan-template.md` (an empty scaffold for future implementation plans)—alongside
the agent/skill files for whichever tool(s) you selected. The Stage-2 planner agents
(planner-copilot, planner-claude, planner-codex) read the plan template before writing plans.

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

- `src/AGENTS.md`, `src/HUMAN.md` — the **canonical, shipped** copies. These are the source
  of truth the CLI reads and writes into target repos (as root-level `AGENTS.md`/`HUMAN.md`).
- `AGENTS.md`, `HUMAN.md` (repo root) — this repository's **own self-hosting** copies, used
  by the agent network running against this repo. Kept separate from the shipped `src/` copies
  and not published to npm.
- `documents/templates/plan-template.md` — the **canonical, shipped** plan template that is
  also this repository's **own self-hosted copy** (source path == dest path). Published to npm
  and bundled with the `marcos-ai-bootstrap` CLI; Stage-2 planner agents read this template
  before writing plans to ensure consistent structure.
- `.claude/`, `.codex/`, `.github/`, `.agents/` — the already-materialised, checked-in
  agent/skill files for this repo itself, and the templates the `marcos-ai-bootstrap` CLI ships
  and copies into other repositories.
- `src/bin/ai-bootstrap.js`, `src/lib/materialize.js` — the CLI implementation.
- `src/AGENTS-BOOTSTRAP.md` — maintainer-only source of truth for each tool's
  materialised agent/skill prompt bodies and model tier mappings. The MCP server
  discovery/policy flow now lives in the **MCP Servers** section of `AGENTS.md` (which
  is shipped); this file references it. **Not published to npm and not copied into target
  repos** — the materialised agent/skill files under `.claude/`, `.codex/`, `.github/`,
  `.agents/` are the shipped source of truth.
- `src/extract-agents.py` — maintainer tool: regenerates the `.claude/`, `.codex/`,
  `.github/`, `.agents/` template files at the repo root from `src/AGENTS-BOOTSTRAP.md`
  after editing it. Run this after changing `src/AGENTS-BOOTSTRAP.md`, then commit the
  regenerated templates so `marcos-ai-bootstrap` ships the update.

## Maintaining this repo

1. Edit `src/AGENTS-BOOTSTRAP.md` (the source of truth for agent/skill prompt bodies).
2. Run `python src/extract-agents.py` to regenerate the materialised template files.
3. Run `node src/bin/ai-bootstrap.js --all --dry-run --dest <scratch-dir>` to sanity-check
   the CLI still packages everything correctly.
4. Commit the changes.

## Releasing to npm

Releases are automated with [release-please](https://github.com/googleapis/release-please)
via `.github/workflows/release.yml`, so no one commits a version bump or pushes to `main`
directly.

How it works:

1. On every push to `main`, release-please opens/updates a **Release PR** that bumps the
   version in `package.json` and updates `CHANGELOG.md`, based on the conventional-commit
   messages since the last release.
2. When you're ready to ship, **merge the Release PR**. That merge creates the git tag and
   a GitHub Release.
3. The same workflow then publishes to npm with `npm publish --provenance --access public`
   using OIDC **trusted publishing** (no stored `NPM_TOKEN`).

The published package appears at
[npmjs.com/package/marcos-ai-bootstrap](https://www.npmjs.com/package/marcos-ai-bootstrap).

Bump size is derived from your commit messages. While the package is pre-1.0, the config
(`bump-minor-pre-major`, `bump-patch-for-minor-pre-major`) keeps breaking changes off the
major version:

| Commit type | Result (pre-1.0) |
|---|---|
| `fix:` / `feat:` / `refactor:` … | patch (e.g. `0.1.0` → `0.1.1`) |
| `feat!:` or a `BREAKING CHANGE:` footer | minor (e.g. `0.1.0` → `0.2.0`) |
| any commit with a `Release-As: X.Y.Z` footer | forces exactly that version |

Cut `1.0.0` with a `Release-As: 1.0.0` commit when the API is stable; after that, standard
SemVer applies (`feat:` → minor, breaking → major). Non-releasable commits (e.g. `docs:`,
`ci:`) won't create a Release PR on their own.
