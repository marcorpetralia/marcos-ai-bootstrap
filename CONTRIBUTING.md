# Contributing to marcos-ai-bootstrap

Thanks for your interest in contributing! We welcome pull requests, bug reports, and suggestions.

## Workflow

### Branch names

Use typed, kebab-case branch names, optionally date-prefixed to match the existing convention:

- `feat/description` for new features
- `fix/description` for bug fixes
- `chore/description` for maintenance, docs, or tooling
- `chore/YYYYMMDD-description` (date-prefixed) for coordinated multi-phase work

**Example:** `feat/add-azure-mcp-server`, `chore/20260725-public-readiness-polish`

### Commit convention

Write commits following [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

- **type**: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`
- **scope**: optional, e.g., `(cli)`, `(agents)`, `(docs)`
- **subject**: imperative, lowercase, no period

**Examples:**
```
feat: add CONTRIBUTING.md and SECURITY.md
fix(materialize): handle missing dest directory
chore: bump Node engine minimum to >=18
```

These commits drive [release-please](https://github.com/googleapis/release-please) for automated releases, so consistent formatting matters.

The `pr` skill (`/pr` in Claude Code / Copilot CLI) can help enforce this convention.

### Running tests locally

Requires **Node.js >= 18**.

```bash
npm test
```

Tests use the built-in `node:test` runner and run in isolation (temp directories, no network access, no side effects).

### Editing agent and skill rules

This repository's agent/skill network is defined in source-of-truth files under `src/`:

- `src/MARCOS-AI-BOOTSTRAP.md` — the full agent/skill rules and guardrails
- `src/AGENTS-BOOTSTRAP.md` — agent/skill prompt bodies and model tier mappings
- `src/HUMAN.md` — human workflow guide

**If you edit any of these files**, regenerate the materialised copies:

```bash
python src/extract-agents.py
```

This rewrites:
- Shipped templates under `src/.claude/`, `src/.codex/`, `src/.github/agents/`, `src/.github/skills/`, `src/.agents/skills/`
- This repository's self-hosted copies at the repo root

**Never hand-edit** the generated copies under `.claude/`, `.codex/`, `.github/agents/`, `.github/skills/`, `.agents/skills/`, or under `src/.claude/` etc. — they will be overwritten on the next regeneration run.

Before submitting a PR with rule changes, sanity-check the regeneration:

```bash
node src/bin/ai-bootstrap.js --all --dry-run --dest /tmp/aib-check
```

### Full rules

See [`MARCOS-AI-BOOTSTRAP.md`](./MARCOS-AI-BOOTSTRAP.md) for the complete agent rules, guardrails, MCP server discovery, and skill definitions.

## Questions?

Open an issue, start a discussion, or reach out. We're here to help.
