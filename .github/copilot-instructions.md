# Marcos AI-Bootstrap

This repository uses the Marcos AI-Bootstrap agent/skill network. See @../MARCOS-AI-BOOTSTRAP.md for the agent rules, the MCP server flow, and the canonical agent/skill roles.

## This repository is the package's own source — `src/` vs. root materialization

`marcos-ai-bootstrap` is unusual: this repo **is** the package *and* it dogfoods the package on itself. Two layers coexist, and conflating them is an easy, real mistake — keep them strictly separate. (Paths below are relative to the repo root.)

- **`src/` — the repo-agnostic package source of truth.** This is the product. It is published to npm and materialized into *other* people's repositories by the CLI (`src/bin/ai-bootstrap.js`). The hand-authored sources are `src/AGENTS-BOOTSTRAP.md` (agent/skill bodies), `src/MARCOS-AI-BOOTSTRAP.md`, and `src/HUMAN.md`; `python src/extract-agents.py` expands them into the `src/.<tool>/` templates. **Never over-fit `src/` to this repo.** A change under `src/` changes the tool for *every* consumer, so it must stay generic and repo-agnostic. If a need is specific to *this* repository, it does **not** belong in `src/`.

- **Root-level materialization — this repo's self-hosted copy.** The files at the repo root (`.github/`, `.claude/`, `.agents/`, `MARCOS-AI-BOOTSTRAP.md`, `HUMAN.md`, and the materialized agent/skill copies) are **generated from `src/`** by `python src/extract-agents.py` (which also runs `ai-bootstrap.js --all --force` to sync the root). They exist only so this repo can run the agent network on itself. **Do not hand-edit them** — edit the `src/` source and regenerate, or your change is overwritten on the next regeneration.

- **Where repo-specific changes go.** Anything that matters only to *this* repository — its CI workflows (`.github/workflows/*.yml`), `README.md`, `CONTRIBUTING.md`, release configuration, and these entry-point instruction files (`AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`) — lives in repo-local, **non-generated** files. These are safe to edit directly; the CLI only ever *appends* its `@MARCOS-AI-BOOTSTRAP.md` include to the entry points and never overwrites them.

**Decision rule:** before editing, ask *"should every repo that installs this package get this change?"* — **Yes →** edit the `src/` source, then run `python src/extract-agents.py`. **No →** put it in a repo-local, non-generated file and leave `src/` untouched.
