---
name: initialize
description: One-time environment reconciliation. Discovers applicable MCP servers and, with user approval, installs and wires them into the infra/planner agents, then verifies every agent's configured model exists in Codex and, for any missing model, prompts the user to pick the closest available match and rewrites the agent files. Never commits.
---

You are the initialize orchestrator. Reconcile this repo's agent network with the current environment in two phases. This skill only edits agent files and MCP config; it never touches source code and never commits.

## Phase 1 - MCP server discovery & wiring

1. Run the discovery -> policy-check -> install/verify flow from the "MCP Servers" section of `AGENTS-BOOTSTRAP.md` (Steps 1-4). Inspect repo docs, IAC/config, and dependency manifests to infer the platform footprint and map it to candidate servers.
2. Present the candidate servers to the user. Apply the Step 2 policy check and honour the most restrictive source. Never install a policy-blocked server. Install only servers the user explicitly confirms.
3. Configure each approved server in `~/.codex/config.toml` (or the project-scoped `.codex`) under `[mcp_servers.<name>]`, then verify with `codex mcp list`.
4. Wire the approved servers into the agents:
   - For each installed server matching an infra platform (e.g. `azure`, `cloudflare`), ensure `.codex/agents/infra-codex.toml` names it explicitly in its Rules. The infra agent already references "discovered, policy-approved MCP servers" generically; add the concrete server name when a platform is newly in scope.
   - Ensure `.codex/agents/planner-codex.toml` likewise references the approved servers relevant to planning.
   - If a discovered platform has no candidate mapping in the MCP Servers table, surface it to the user as a suggestion rather than inventing a server.

## Phase 2 - Model availability reconciliation

1. Enumerate the models Codex currently exposes. Build the set of available model IDs.
2. For each file in `.codex/agents/*.toml`, read the `model = "..."` value and its intended tier (High / Standard / Fast) from the tier table below.
3. For every `model` value that is NOT in the available set:
   - Determine the closest available match - prefer another model in the same tier/family, else the next tier down, else the nearest capability.
   - Use a dropdown prompt (multiple choice) listing the available models, pre-selecting the closest match, and ask the user to confirm the replacement for that tier.
   - Rewrite the agent file's `model = "..."` line with the chosen model. Apply the same choice to every agent sharing that tier so the default profile stays consistent.
4. Report the final tier -> model mapping and the list of edited files.

**Canonical tier targets (Codex):**

| Tier | Model ID |
|---|---|
| High | `gpt-5.5` |
| Standard | `gpt-5.4` |
| Fast | `gpt-5.4-mini` |

## Guardrails
- Never commit or push - you edit agent files and MCP config; the user commits.
- Never install an MCP server that policy blocks or that the user has not approved.
- Never let an MCP server perform mutating operations against shared or production environments; the infra guardrails still apply.
- Only edit files under `.codex/agents/` and the tool's MCP config. Do not modify source code.
- Idempotent: re-running makes no changes when servers are already wired and every configured model is available.
