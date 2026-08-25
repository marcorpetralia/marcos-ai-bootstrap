# <Plan title>

**Date:** <YYYY-MM-DD>
**Branch:** <type/YYYYMMDD-topic-slug>
**Mode:** <planning mode / stage>

## 1. Goal

<!-- One paragraph describing what success looks like when this plan is complete. -->

## 2. Constraints

<!-- Bullet list of guardrails, dependencies, deadlines, and the feature branch name. Never commit to main. -->
- <constraint>

### Cross-references

<!-- Link related notes under agents/ and existing plans under documents/plans/. -->
- <path or link>

## 3. Phases

<!--
Ordered phases. Duplicate the block below per phase. Name specific -copilot/-claude/-codex
custom agents. Keep phases small and tightly scoped — one coherent outcome per phase, not a
bundle of unrelated changes. Mark phases that touch disjoint files with no ordering dependency
as parallelizable so they can run concurrently. A phase may chain multiple agents in sequence
(e.g. code → test-runner → docs) only when the hand-off is immediate and splitting would break
an atomic unit of work — otherwise prefer separate phases. Every phase's agent(s) run only
narrow/targeted tests for the files they touch — never the full test suite; the full suite is
run once, after the phase's agents complete, by the implementing orchestrator itself.
-->

### Phase 1 — <title>

**Objective:** <what this phase achieves — keep it to one coherent outcome>

**Parallelizable with:** <Phase N, Phase M | none — depends on Phase X>

**Agents:** <ordered list if more than one, e.g. code-copilot → test-runner-copilot | docs-copilot>

**Files to change:**
- <path>

**Tests to write (smallest set covering the change; phase agent(s) run these and other narrow/targeted checks only — never the full suite, which the orchestrator runs after this phase):**
- <test> | none needed

**Design:** <!-- optional: fenced code snippets for load-bearing changes -->

**Acceptance criteria:**
<!-- Every criterion here must be a requirement the user explicitly stated, or one strictly implied
by the task. Never encode an inferred, unconfirmed property (a latency bound, a scale target, a
specific UX choice, etc.) as a blocking acceptance criterion — record it as an assumption in
Human Review below instead, phrased as a desired outcome, not a requirement. -->
- <verifiable outcome>

## 4. Implementation notes

<!--
Filled in during execution, not during planning. If an implementing agent discovers an unstated
assumption, an ambiguity, or an unverified/unconfirmed requirement (e.g. a performance target no
one actually confirmed), it does not pause the phase to ask — it proceeds with the most
conservative interpretation that satisfies what the user actually stated, and appends a note here.
Only a genuine failure (broken code, failing tests, an explicitly stated acceptance criterion left
unmet, or missing information the phase truly cannot proceed without) stops a phase.
-->
- <note, or leave empty if none arose>

## 5. Human Review

<!--
Everything a human needs to weigh in on lives here, and only here, at the end of the plan. Nothing
above this section should require the user's input mid-implementation. This section is read once,
after planning (Open questions, Risks) and again after implementation (Assumptions made) — it is
never a mid-run blocker.
-->

### Open questions

<!-- Anything still needing user input before implementation begins. -->
- <question>

### Assumptions made (unconfirmed)

<!--
Anything the planner or an implementing agent inferred rather than the user stating it outright —
phrased as a desire, not a requirement. Populated during planning and appended to during
implementation (mirrors "Implementation notes" above). Never treat an entry here as met/unmet;
it is a flag for the user to confirm or reject, not a pass/fail gate.
-->
- <assumption> — treated as: desired, not required, until confirmed

### Risks

<!-- Known unknowns or risky assumptions. -->
- <risk>
