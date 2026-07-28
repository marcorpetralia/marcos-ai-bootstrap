---
name: initialize
description: One-time environment reconciliation. First wires this tool's instruction file to the shipped MARCOS-AI-BOOTSTRAP.md rules (appending an @-include, never overwriting; creating the file if absent). Discovers applicable MCP servers and, with user approval, installs and wires them into the infra/planner agents; discovers where plan documents actually live and, after user confirmation, wires the planner/implement/docs agents to that location; scans past PRs, branch names, and commit history and, after user confirmation, customises the `pull-request` skill's convention profile; then always prompts the user to choose the model for each tier/role (pre-selecting the current model, or the closest available match when it is unavailable) and rewrites the agent files. Never commits.
---

You are the initialize orchestrator. Reconcile this repo's agent network with the current environment in the phases below. This skill only edits agent and skill files, the tool's instruction entry-point, and MCP config; it never touches source code and never commits.

## Phase 0 - Rules-file include wiring

The full agent rules ship as `MARCOS-AI-BOOTSTRAP.md` at the repo root. Ensure this tool's instruction file references them, without clobbering anything the user already has.

1. Locate the instruction file: `AGENTS.md`.
2. If it exists and already references `MARCOS-AI-BOOTSTRAP.md`, leave it untouched.
3. If it exists but does not reference it, APPEND (never overwrite) a short block:
   > # Marcos AI-Bootstrap
   >
   > This repository uses the Marcos AI-Bootstrap agent/skill network. See `@MARCOS-AI-BOOTSTRAP.md` for the agent rules, the MCP server flow, and the canonical agent/skill roles.
4. If it does not exist, create it containing that block.

## Phase 1 - MCP server discovery & wiring

1. Run the discovery -> policy-check -> install/verify flow from the "MCP Servers" section of `MARCOS-AI-BOOTSTRAP.md` (Steps 1-4). Inspect repo docs, IAC/config, and dependency manifests to infer the platform footprint and map it to candidate servers.
2. Present the candidate servers to the user. Apply the Step 2 policy check and honour the most restrictive source. Never install a policy-blocked server. Install only servers the user explicitly confirms.
3. Configure each approved server in `~/.codex/config.toml` (or the project-scoped `.codex`) under `[mcp_servers.<name>]`, then verify with `codex mcp list`.
4. Wire the approved servers into the agents:
   - For each installed server matching an infra platform (e.g. `azure`, `cloudflare`), ensure `.codex/agents/infra-codex.toml` names it explicitly in its Rules. The infra agent already references "discovered, policy-approved MCP servers" generically; add the concrete server name when a platform is newly in scope.
   - Ensure `.codex/agents/planner-codex.toml` likewise references the approved servers relevant to planning.
   - If a discovered platform has no candidate mapping in the MCP Servers table, surface it to the user as a suggestion rather than inventing a server.

## Phase 2 - Model availability reconciliation

1. Enumerate the models Codex currently exposes. Build the set of available model IDs.
2. For each file in `.codex/agents/*.toml`, read the `model = "..."` value and its intended tier (High / Standard / Fast) from the tier table below.
3. For every tier (High / Standard / Fast), ALWAYS prompt the user to choose the model - even when the currently configured model is available:
   - Pick the pre-selected default: the currently configured model if it is in the available set; otherwise the closest available match - prefer another model in the same tier/family, else the next tier down, else the nearest capability.
   - Use a dropdown prompt (multiple choice) listing every available model, pre-selecting the default from the previous step, and ask the user to confirm or change the model for that tier.
   - Rewrite the agent file's `model = "..."` line with the chosen model. Apply the same choice to every agent sharing that tier so the default profile stays consistent.
4. Report the final tier -> model mapping and the list of edited files.

**Canonical tier targets (Codex):**

| Tier | Model ID |
|---|---|
| High | `gpt-5.5` |
| Standard | `gpt-5.4` |
| Fast | `gpt-5.4-mini` |

## Phase 3 - Documentation location reconciliation

1. Inspect the repo to discover where plan and design documents are actually kept. Look for an existing plans directory (e.g. `documents/plans/`, `docs/plans/`, `plans/`, `.plans/`) that already contains dated plan files, and check `README.md`, `AGENTS.md`, and any `docs/` index for a documented convention. Record the location that already holds the most plans, or the one the docs declare canonical.
2. Compare the discovered location against the canonical `documents/plans/` path referenced by the `planner-codex`, `planner-discovery-codex`, `implement`, and `docs-codex` agents/skills.
3. If they differ (plans already live somewhere else), STOP and ask the user - via a dropdown prompt (multiple choice) - whether to wire the agents to the existing location, keep the canonical `documents/plans/`, or use a different path they specify. Never rewrite the location without explicit user confirmation.
4. On confirmation, update every reference to the plans directory so the agents write to and read from the correct place: the `planner-codex` and `planner-discovery-codex` agents, the `planner` and `implement` skills, and the `docs-codex` agent's plan-document references. Leave all other paths untouched.
5. Report the resolved plans location and the list of edited files.

## Phase 4 - PR & contribution convention discovery

Customise the `pull-request` skill so it matches how THIS repository actually works, learned from its own history rather than assumed defaults.

1. Gather evidence of the repo's conventions:
   - **Past PRs** - `gh pr list --state merged --limit 50 --json number,title,headRefName,body`. Infer PR-title patterns (Conventional Commits, ticket prefixes like `[ABC-123]`, sentence vs lower case), branch-name patterns (prefixes, separators, casing), and PR-body structure (required sections, checklists).
   - **Commit subjects** - `git --no-pager log origin/<default-branch> --format='%s' -n 100`. Infer the commit-message convention.
   - **Contribution config** - `CONTRIBUTING.md`, `.github/pull_request_template.md` (and `PULL_REQUEST_TEMPLATE/`), `.gitmessage`, commit-lint config (`commitlint.config.*`, `.commitlintrc*`, `.czrc`), and any release automation (`release-please*`, `.releaserc*`, `semantic-release`) that constrains commit/PR format.
   - **Repo settings** - `gh repo view --json defaultBranchRef,mergeCommitAllowed,squashMergeAllowed,rebaseMergeAllowed` for the default branch and allowed merge methods.
2. Synthesise a concise convention profile: branch-name rules, commit-message rules, PR-title rules, PR-body/template rules, and any release-automation constraints. Prefer the dominant observed pattern; where history is sparse or inconsistent, fall back to the general Conventional Commits defaults and say so explicitly.
3. Present the inferred profile to the user for confirmation or edits. Do not rewrite the skill without confirmation.
4. On confirmation, rewrite ONLY the "Repository conventions" block of `.agents/skills/pull-request/SKILL.md` - the text between the `<!-- CONVENTIONS:START -->` and `<!-- CONVENTIONS:END -->` markers - with the confirmed profile. Leave the rest of the skill untouched.
5. Report the resolved convention profile and confirm the `pull-request` skill was updated.

## Guardrails
- Never commit or push - you edit agent and skill files and MCP config; the user commits.
- Never install an MCP server that policy blocks or that the user has not approved.
- Never let an MCP server perform mutating operations against shared or production environments; the infra guardrails still apply.
- Never change the plans location without explicit user confirmation.
- Only edit files under `.codex/agents/`, `.agents/skills/`, the tool's instruction entry-point (`AGENTS.md`), and the tool's MCP config. Do not modify source code.
- Idempotent for MCP wiring and the plans location: re-running makes no changes when servers are already wired and the plans location already matches. Model selection is always offered - re-running re-prompts for each tier, but keeping the current selection leaves the files unchanged.
