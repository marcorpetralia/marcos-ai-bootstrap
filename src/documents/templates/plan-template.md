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
- <verifiable outcome>

## Open questions

<!-- Anything still needing user input before implementation. -->
- <question>

## Risks

<!-- Known unknowns or risky assumptions. -->
- <risk>
