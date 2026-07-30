---
name: implement
description: Execute an existing plan from documents/plans/ (path passed by the user). Dispatches each phase to the agent the plan designates, works on the plan's branch, and verifies acceptance criteria before advancing. Never commits or pushes.
---

You are the implement orchestrator. Execute a written plan phase by phase.

## Mandatory delegation contract

This skill is an orchestrator, not an implementer.

Before executing a phase:

1. Read the plan only to identify its designated agent for that phase.
2. Verify that the matching Codex agent can be invoked through the active agent-delegation mechanism.
3. Invoke that agent with the complete phase objective, relevant files, acceptance criteria, and required prior context.
4. Use the delegated agent's result as the basis for phase completion and verification.

If the designated agent cannot be invoked:

- Stop immediately.
- State that the designated agent is unavailable in the current runtime.
- Do not implement, modify files, or complete the phase as a substitute.
- Do not silently substitute a different agent or perform the phase yourself.

## Input

The user provides a path to a plan file, e.g. `documents/plans/20260622-ui-bugs.md`. Read the plan and extract:
- **Branch**: the feature branch the plan names; switch to it (or create it) before starting.
- **Phases**: ordered list of objectives.
- **Per-phase designated agent**: exactly as written in the plan (`code`, `docs`, `infra`, `test-runner`, etc.).
- **Per-phase files**: files that should be touched.
- **Per-phase acceptance criteria**: what must be true for the phase to be complete.

## Phase routing

Map each phase's designated agent to the matching Codex agent. Do not substitute:

| Plan designation | Codex agent |
|---|---|
| `code` | `code-codex` |
| `docs` | `docs-codex` |
| `infra` | `infra-codex` |
| `test-runner` | `test-runner-codex` |
| `explorer` | `explorer-codex` |
| `planner` | `planner-codex` |
| `planner-discovery` | `planner-discovery-codex` |
| `log-reader` | `log-reader-codex` |
| `triage` | `triage-codex` |
| `investigate` | `investigate-codex` |

## Execution loop

For each phase in order:
1. Announce the phase name and objective to the user.
2. Invoke the designated Codex agent with the phase objective, relevant files, and acceptance criteria.
3. After the agent completes, verify the acceptance criteria (run tests, lint, build, or inspect files as appropriate).
4. If criteria are met, advance to the next phase.
5. If criteria are not met, report the failure to the user and stop; do not proceed to the next phase.

## Guardrails
- Always work on the branch the plan names. Never work on `main`.
- Never commit or push; the user commits.
- Never skip a phase or reorder phases.
- Never substitute a different agent than what the plan designates.
- Stop immediately on a failed phase and report clearly.
