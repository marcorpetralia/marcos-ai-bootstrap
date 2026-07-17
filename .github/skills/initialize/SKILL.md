---
name: initialize
description: One-time environment reconciliation. Discovers applicable MCP servers and, with user approval, installs and wires them into the infra/planner agents; discovers where plan documents actually live and, after user confirmation, wires the planner/implement/docs agents to that location; then verifies every agent's configured model exists in GitHub Copilot CLI and, for any missing model, prompts the user to pick the closest available match and rewrites the agent files. Never commits.
---

You are the initialize orchestrator. Reconcile this repo's agent network with the current environment in three phases. This skill only edits agent and skill files and MCP config; it never touches source code and never commits.

## Phase 1 — MCP server discovery & wiring

1. Run the discovery → policy-check → install/verify flow from the "MCP Servers" section of `AGENTS-BOOTSTRAP.md` (Steps 1–4). Inspect repo docs, IAC/config, and dependency manifests to infer the platform footprint and map it to candidate servers.
2. Present the candidate servers to the user. Apply the Step 2 policy check and honour the most restrictive source. Never install a policy-blocked server. Install only servers the user explicitly confirms.
3. Configure each approved server in `~/.copilot/mcp-config.json` (or the project-scoped equivalent) under `mcpServers`, then verify with `/mcp`.
4. Wire the approved servers into the agents:
   - For each installed server matching an infra platform (e.g. `azure`, `cloudflare`), ensure `.github/agents/infra-copilot.agent.md` names it explicitly in its Rules. The infra agent already references "discovered, policy-approved MCP servers" generically; add the concrete server name when a platform is newly in scope.
   - Ensure `.github/agents/planner-copilot.agent.md` likewise references the approved servers relevant to planning.
   - If a discovered platform has no candidate mapping in the MCP Servers table, surface it to the user as a suggestion rather than inventing a server.

## Phase 2 — Model availability reconciliation

1. Enumerate the models Copilot CLI currently exposes (the `/model` picker). Build the set of available model IDs.
2. For each file in `.github/agents/*.agent.md`, read the `model:` frontmatter value and its intended tier (High / Standard / Fast) from the tier table below. Note the `infra-copilot` role-specific override (`gpt-5.4`).
3. For every `model:` value that is NOT in the available set:
   - Determine the closest available match — prefer another model in the same tier/family, else the next tier down, else the nearest capability. For a missing role override (`gpt-5.4` on infra), offer the closest available GPT model first.
   - Use a dropdown prompt (multiple choice) listing the available models, pre-selecting the closest match, and ask the user to confirm the replacement for that tier or role.
   - Rewrite the agent file's `model:` line with the chosen model. Apply the same choice to every agent sharing that tier so the mixed default profile stays consistent.
4. Report the final tier/role → model mapping and the list of edited files.

**Canonical tier targets (Copilot CLI — mixed default profile):**

| Tier | Default model ID |
|---|---|
| High | `claude-opus-4.8` |
| Standard | `claude-sonnet-5` |
| Fast | `claude-haiku-4.5` |

Role-specific override: `infra-copilot` uses `gpt-5.4`.

## Phase 3 — Documentation location reconciliation

1. Inspect the repo to discover where plan and design documents are actually kept. Look for an existing plans directory (e.g. `documents/plans/`, `docs/plans/`, `plans/`, `.plans/`) that already contains dated plan files, and check `README.md`, `AGENTS.md`, and any `docs/` index for a documented convention. Record the location that already holds the most plans, or the one the docs declare canonical.
2. Compare the discovered location against the canonical `documents/plans/` path referenced by the `planner-copilot`, `planner-discovery-copilot`, `implement`, and `docs-copilot` agents/skills.
3. If they differ (plans already live somewhere else), STOP and ask the user — via a dropdown prompt (multiple choice) — whether to wire the agents to the existing location, keep the canonical `documents/plans/`, or use a different path they specify. Never rewrite the location without explicit user confirmation.
4. On confirmation, update every reference to the plans directory so the agents write to and read from the correct place: the `planner-copilot` and `planner-discovery-copilot` agents, the `planner` and `implement` skills, and the `docs-copilot` agent's plan-document references. Leave all other paths untouched.
5. Report the resolved plans location and the list of edited files.

## Guardrails
- Never commit or push — you edit agent and skill files and MCP config; the user commits.
- Never install an MCP server that policy blocks or that the user has not approved.
- Never let an MCP server perform mutating operations against shared or production environments; the infra guardrails still apply.
- Never change the plans location without explicit user confirmation.
- Only edit files under `.github/agents/`, `.github/skills/`, and the tool's MCP config. Do not modify source code.
- Idempotent: re-running makes no changes when servers are already wired, the plans location already matches, and every configured model is available.
