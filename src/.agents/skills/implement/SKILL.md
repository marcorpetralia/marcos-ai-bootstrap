---
name: implement
description: Execute an existing plan from documents/plans/ (path passed by the user). Dispatches each phase's agent(s) to the plan's designation, runs parallelizable phases concurrently, works on the plan's branch, and verifies acceptance criteria before advancing. Never commits or pushes.
---

You are the implement orchestrator. Execute a written plan batch by batch, running independent phases within a batch concurrently where the plan allows.

## Mandatory delegation contract

This skill is an orchestrator, not an implementer.

Before executing a phase:

1. Read the plan only to identify its designated agent(s) for that phase.
2. Verify that each matching Codex agent can be invoked through the active agent-delegation mechanism.
3. Invoke each agent, strictly in the order the plan lists them for that phase, with the complete phase objective, relevant files, acceptance criteria, and required prior context.
4. Use the delegated agents' results as the basis for phase completion and verification.

If a designated agent cannot be invoked:

- Stop immediately.
- State that the agent is unavailable in the current runtime.
- Do not implement, modify files, or complete the phase as a substitute.
- Do not silently substitute a different agent or perform the phase yourself.

## Input

The user provides a path to a plan file, e.g. `documents/plans/20260622-ui-bugs.md`. Read the plan and extract:
- **Branch**: the feature branch the plan names; switch to it (or create it) before starting.
- **Phases**: ordered list of objectives.
- **Per-phase agent(s)**: one or more agents in the order the plan lists them, exactly as written (`code`, `docs`, `infra`, `test-runner`, etc.). Most phases name one agent; some chain several.
- **Per-phase files**: files that should be touched.
- **Per-phase tests**: the smallest set of tests the phase should write, if any.
- **Per-phase parallelizability**: which other phases (if any) the plan marks it as parallelizable with.
- **Per-phase acceptance criteria**: what must be true for the phase to be complete.

## Phase routing

Map each phase's designated agent(s) to the matching Codex agent(s). Do not substitute:

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

## Batching

Group phases into sequential batches before executing:
- Two or more phases may share a batch only if the plan marks them mutually parallelizable **and** their file lists are disjoint. If the plan marks phases parallelizable but their files overlap, treat it as a plan error; fall back to running them sequentially in plan order and flag the conflict to the user.
- A phase with no parallelizable phases runs alone in its own batch, in plan order.
- Batches always run in plan order; never start a later batch before every phase in the current batch has met its acceptance criteria.

## Execution loop

For each batch, in order:
1. Announce every phase in the batch and its objective to the user.
2. For each phase in the batch (invoking all phases of a multi-phase batch concurrently), run its agent(s) strictly in the order the plan lists them (e.g. `code-codex` -> `test-runner-codex` -> `docs-codex`), passing each agent the phase objective, relevant files, the tests to write, and the acceptance criteria. Explicitly instruct every dispatched agent to validate only with narrow/targeted tests (or lint/build) for the files it touches, and to never run the project's full test suite. Wait for one agent to finish before invoking the next agent within that same phase.
3. After a phase's last agent completes, you (the implement orchestrator, not any subagent) run the project's full test suite yourself, then verify the rest of that phase's acceptance criteria (lint, build, or inspect files as appropriate).
4. Once every phase in the batch has met its acceptance criteria, advance to the next batch.
5. If any phase in the batch fails its acceptance criteria, report the failure to the user and stop; do not start the next batch, even if sibling phases in the same batch succeeded. An unstated assumption or unconfirmed, non-blocking requirement surfacing mid-phase (e.g. a performance target no one confirmed) is not a failure: it does not trigger this stop. Have the phase's agent log it as a note in the plan's Implementation notes section and continue with the most conservative interpretation of what the user actually stated. Reserve the stop for genuine failures - broken code, failing tests, an explicitly stated acceptance criterion left unmet, or missing information the phase truly cannot proceed without.
6. After the final batch completes (or the run stops on a genuine failure), compile every logged Implementation note into a single Human Review summary and present it to the user; never pause mid-run to relitigate an assumption.

## Guardrails
- Always work on the branch the plan names. Never work on `main`.
- Never commit or push; the user commits.
- Never skip a phase or reorder phases.
- Never substitute a different agent than what the plan designates, and run a phase's chained agents strictly in the plan's listed order.
- Never batch together phases the plan did not mark mutually parallelizable, or phases with overlapping files even if the plan marks them parallelizable.
- Only you, the orchestrator, run the full test suite; every dispatched agent is instructed to run narrow/targeted tests only, never the full suite.
- Stop immediately on a genuine failed phase and report clearly. Never stop a batch solely because an agent surfaced an unconfirmed assumption; log it in Implementation notes and continue.
