# Human Guide

A quick reference for working with the AI agent network in this repository.

## First-time setup

Fastest path — use the `marcos-ai-bootstrap` CLI (no AI turn required, works in any repo, any OS):

```powershell
npx marcos-ai-bootstrap --copilot   # or --claude, --codex, or --all
```

This instantly writes `AGENTS.md`, `AGENTS-BOOTSTRAP.md`, `HUMAN.md`, and the agent/skill
files for the tool(s) you chose into the current directory. See the root `README.md` for
all flags (`--force`, `--dry-run`, `--dest`).

Alternatively, do it manually via your AI assistant:

1. Ensure the following files are present in the repo root:
   - `AGENTS.md`
   - `AGENTS-BOOTSTRAP.md`
   - `HUMAN.md`
2. Switch to your most powerful model at medium effort using **`/model`** e.g. opus 4.8 @ medium effort
3. Ask your AI assistant to: **"Implement `AGENTS-BOOTSTRAP.md`"** - This materialises the agent and skill network for your tool.
4. **`/clear`** — Clear the context window.
5. use **`/model`** to switch your model to your most powerful model @ low effort (to save tokens)

## Basic workflow

1. **`/planner`** — Give a basic outline of what you want to build. The agent asks clarifying questions and iterates until it has a complete plan for the feature, bugfix, or chore.
2. **`/clear`** — Clear the context window.
3. **`/implement`** — Paste the path to the plan that was created, e.g. `documents/plans/20260101-plan.md`.
4. **`/watch-ci`** — Paste the PR or GitHub Actions run. It watches the build to make sure everything passes, fixing bugs in real time if needed.
