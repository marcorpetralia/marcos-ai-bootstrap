# Release-please hardening: accurate release docs + advisory CI guardrail

**Date:** 2026-07-28
**Branch:** `chore/20260728-release-please-hardening`
**Mode:** Two-stage planning — Stage 2 (Full Implementation Plan)

## 1. Goal

Make the repo's own documentation and guardrails tell the truth about what
release-please actually releases, and add a lightweight safety net so a merge to
`main` that contains no release-triggering commit is *noticed* rather than
silently shipping nothing. Concretely: (a) correct the source-of-truth rules and
the **pull-request** skill guardrail so contributors are explicitly told that
only `feat:`, `fix:`, and breaking changes (`!` / `BREAKING CHANGE:`) open a
Release PR — and that `refactor:`, `chore:`, `docs:`, `perf:`, `test:`, `ci:`,
`build:`, `style:` do not — then regenerate every materialised copy; (b) add one
**advisory, warn-only** CI check that emits a `::warning::` (and always exits 0)
when no `feat`/`fix`/breaking commit exists since the last release; (c) surgically
fix the README "Releasing to npm" bump table (~lines 118–129) and its surrounding
paragraph so the table no longer implies `refactor:` is releasable; and (d) ship
PR #19's already-merged-but-unreleased rename by adding a `fix:`-typed follow-up
commit so the next merge to `main` opens a Release PR. Success = the release docs
are internally consistent across root and `src/` copies, the advisory check warns
correctly without ever failing a build, `release-please-config.json` /
`release.yml` are untouched, and the pending rename is queued for release.

**Explicitly NOT changing release behavior:** we do **not** make new commit types
releasable, do **not** edit `release-please-config.json`, and do **not** touch
`release.yml` or its `googleapis/release-please-action@v4` pin. This is a
docs + guardrails + advisory-CI task only.

## 2. Constraints

- **Branch:** `chore/20260728-release-please-hardening`. **Never commit or push to
  `main`.** Implementing agents edit files only; the user owns commits and pushes.
  **Never merge PRs.** Only the planner writes under `documents/plans/`.
- **`src/` is the single source of truth — never hand-edit generated copies.** All
  agent/skill/rules content is generated. The **pull-request** skill body lives in
  `src/AGENTS-BOOTSTRAP.md`; rules prose lives in `src/MARCOS-AI-BOOTSTRAP.md` /
  `src/HUMAN.md`. Edit those, then regenerate with `python src/extract-agents.py`
  (run from the repo root, or `python extract-agents.py` from `src/`). The script
  rewrites the `src/.<tool>/` templates from `src/AGENTS-BOOTSTRAP.md` **and** syncs
  the repo-root self-hosted copies via `src/bin/ai-bootstrap.js`. Do **not** hand-edit
  `.github/skills/pull-request/SKILL.md`, `src/.github/skills/...`, `.agents/skills/...`,
  `.claude/skills/...`, or the root `MARCOS-AI-BOOTSTRAP.md` / `HUMAN.md`.
- **Do NOT change release-please config behavior.** `release-type: node`,
  `bump-minor-pre-major: true`, `bump-patch-for-minor-pre-major: true` stay as-is.
  We are documenting the existing behavior, not altering it.
- **Do NOT edit `release.yml`.** The one allowed workflow change is the *new* advisory
  guardrail (a new file or a job appended to `ci.yml`) — it must never touch `release.yml`.
- **The advisory CI check must be warn-only.** It must always exit 0 and must never
  fail a PR or push build. It only surfaces a `::warning::`.
- **README is edited directly at root.** It is not materialised under `src/` and is
  not in the package `files` list; the surgical edit lands in root `README.md` only.

### Cross-references

- `documents/plans/20260725-public-readiness-polish.md` — establishes the same
  `src/` source-of-truth + `python src/extract-agents.py` regeneration workflow and
  the "never hand-edit generated copies" rule this plan reuses (its Phase 1).
- `documents/plans/20260720-plan-template-deployment.md` — prior plan format/style.
- `src/AGENTS-BOOTSTRAP.md` — hand-authored source for the **pull-request** skill body
  (already contains "ensure at least one release-triggering commit exists" language to
  strengthen). Edited in Phase 1.
- `src/MARCOS-AI-BOOTSTRAP.md` / `src/HUMAN.md` — hand-authored rules source; edit only
  if they describe releases. Regenerated in Phase 1.
- `README.md` (~lines 118–129, "Releasing to npm") — the inaccurate bump table fixed in Phase 3.
- `.github/workflows/ci.yml`, `.github/workflows/release.yml` — inspected for Phase 2;
  `release.yml` is read-only here.
- `CONTRIBUTING.md` — hand-authored at root, already mentions release-please generically
  and does not make the `refactor:` mistake; touch only if a one-line clarification helps.

### MCP servers

This task touches only local repo files, docs, and one GitHub Actions workflow. Per the
MCP Servers discovery/policy flow in `MARCOS-AI-BOOTSTRAP.md`, no discovered server
(`azure`, `github-mcp-server`, `msdocs`, etc.) is relevant to the plan — none is queried
or folded in. (release-please and npm publishing run inside GitHub Actions, not via an MCP server.)

## 3. Phases

### Phase 1 — Correct source-of-truth rules + pull-request skill guardrail (then regenerate)

**Objective:** In the `src/` source of truth, strengthen the **pull-request** skill's
release-please guardrail so it (1) explicitly names the release-triggering commit types
(`feat:`, `fix:`, and breaking via `!` / `BREAKING CHANGE:`) versus the non-releasable
types (`refactor:`, `chore:`, `docs:`, `perf:`, `test:`, `ci:`, `build:`, `style:`), and
(2) adds pre-merge guidance to *warn when no releasable commit exists* on the branch (and
to reach for a `fix:` commit or a `Release-As:` footer when a release is intended). Clarify
the same release-triggering-vs-not distinction in `src/MARCOS-AI-BOOTSTRAP.md` /
`src/HUMAN.md` only where they already describe releases. Then run
`python src/extract-agents.py` to regenerate every materialised copy.

**Agent:** `code-copilot` — this phase edits the agent-network's own source-of-truth
skill/rules files **and** runs the `extract-agents.py` regeneration tooling plus verifies
the generated artifacts. Running the build/regeneration script and validating generated
output is tooling work outside `docs-copilot`'s remit, so it routes to `code-copilot`.
(Content is documentation-style prose, but the load-bearing step is correct regeneration.)

**Files to change:**
- `src/AGENTS-BOOTSTRAP.md` — strengthen the **pull-request** skill body's release-please
  guardrail section (do not duplicate the existing "ensure at least one release-triggering
  commit exists" line — extend it with the explicit type lists and the warn-if-none step).
- `src/MARCOS-AI-BOOTSTRAP.md` / `src/HUMAN.md` — only if they describe release triggering;
  align wording to the same type lists. Skip if they say nothing release-specific.
- Regenerated by the script (do **NOT** hand-edit): the `src/.<tool>/` templates and the
  root self-hosted copies — `.github/skills/pull-request/SKILL.md`,
  `src/.github/skills/pull-request/SKILL.md`, `.agents/skills/pull-request/SKILL.md`,
  `.claude/skills/pull-request/SKILL.md`, and (if edited) root `MARCOS-AI-BOOTSTRAP.md` / `HUMAN.md`.

**Design:** guardrail wording to fold into the pull-request skill body in
`src/AGENTS-BOOTSTRAP.md` (illustrative — match the surrounding style):

```markdown
Release-please only opens a Release PR for **release-triggering** commits:
`feat:`, `fix:`, and breaking changes (`type!:` or a `BREAKING CHANGE:` footer).
These types do NOT trigger a release on their own: `refactor:`, `chore:`, `docs:`,
`perf:`, `test:`, `ci:`, `build:`, `style:`. Note: `bump-patch-for-minor-pre-major`
only controls the *size* of a bump once a release is already triggered — it does not
make these types releasable.

Before merging to `main`, check `git log <last-release-tag>..HEAD` for at least one
`feat:`/`fix:`/breaking commit. If a release is intended but none exists, add a `fix:`
commit or a `Release-As: X.Y.Z` footer; otherwise the merge ships nothing.
```

**Acceptance criteria:**
- The pull-request skill guardrail explicitly lists both the release-triggering and the
  non-releasable commit types and includes the pre-merge "warn if no releasable commit" guidance.
- `python src/extract-agents.py` runs cleanly; `git status` shows regenerated files changed.
- No manual edits to any generated copy — all generated files match the regenerator's output
  (spot-check: re-running the script produces no further diff).
- Root and `src/` copies of the pull-request SKILL agree byte-for-byte with regeneration output.

### Phase 2 — Add advisory (warn-only) CI guardrail

**Objective:** Add a GitHub Actions check that detects when there is no release-triggering
commit (`feat`/`fix`/breaking) since the last release and surfaces a `::warning::`, **without
ever failing the build**. Inspect the existing workflows (`ci.yml` runs on `pull_request` to
`main`; `release.yml` is off-limits) and choose the least-invasive home. **Recommendation:**
append a separate `release-guard` job to the existing `.github/workflows/ci.yml` (it already
triggers on `pull_request` to `main`, needs only `contents: read`, and avoids adding a new
workflow file); a standalone `release-guard.yml` is the fallback if a `push`-to-`main` trigger
is later wanted. This is the **one** allowed workflow edit and it must not touch `release.yml`.

**Agent:** `infra-copilot` — this is a GitHub Actions / IAC change.

**Files to change:**
- `.github/workflows/ci.yml` (append a `release-guard` job) — or a new
  `.github/workflows/release-guard.yml` if the fallback is chosen.

**Design:** warn-only job (illustrative). It must fetch tags, compare the last release tag to
`HEAD`, grep for a `feat`/`fix`/breaking marker, emit `::warning::` when absent, and **always
exit 0**:

```yaml
  release-guard:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0   # need tags + full history to find the last release
      - name: Advisory — warn if no release-triggering commit since last release
        shell: bash
        run: |
          last_tag="$(git describe --tags --abbrev=0 2>/dev/null || true)"
          range="${last_tag:+$last_tag..}HEAD"
          # release-triggering: feat:/fix: (optionally scoped, optionally breaking !) or a BREAKING CHANGE footer
          if git log "$range" --format='%s%n%b' \
               | grep -Eq '^(feat|fix)(\([^)]+\))?!?:|^BREAKING CHANGE:|!:'; then
            echo "Release-triggering commit found since ${last_tag:-repo start}."
          else
            echo "::warning::No feat/fix/breaking commit since ${last_tag:-repo start}; merging to main will not open a Release PR."
          fi
          exit 0   # advisory only — never fail the build
```

**Acceptance criteria:**
- The check is advisory: it **always exits 0** and never fails a PR/push build (verify the job
  has no failing step and no `continue-on-error` dependency needed to stay green).
- It emits a `::warning::` when no `feat`/`fix`/breaking commit exists since the last release tag.
- It is silent (no warning) when at least one release-triggering commit exists.
- `release.yml` is unchanged; `release-please-config.json` is unchanged.

### Phase 3 — Surgical README bump-table fix

**Objective:** Correct the README "Releasing to npm" bump table (~lines 118–129) and its
surrounding paragraph so the table no longer implies `refactor:` triggers a release. Only
`feat:`/`fix:` → patch (pre-1.0), breaking → minor (pre-1.0), and `Release-As:` → forced
version; add an explicit line naming the non-releasable types. Change nothing else in the README.

**Agent:** `docs-copilot`.

**Files to change:**
- `README.md` (~lines 118–129 only).

**Design:** corrected table + clarification (root `README.md`):

```markdown
| Commit type | Result (pre-1.0) |
|---|---|
| `fix:` / `feat:` | patch (e.g. `0.1.0` → `0.1.1`) |
| `feat!:` or a `BREAKING CHANGE:` footer | minor (e.g. `0.1.0` → `0.2.0`) |
| any commit with a `Release-As: X.Y.Z` footer | forces exactly that version |

These commit types do **not** trigger a release on their own: `refactor:`, `chore:`,
`docs:`, `perf:`, `test:`, `ci:`, `build:`, `style:`. (`bump-patch-for-minor-pre-major`
only sizes a bump that is already triggered — it does not make these types releasable.)
```

**Acceptance criteria:**
- `refactor:` is removed from the patch row; the table lists only `feat:`/`fix:` → patch,
  breaking → minor, `Release-As:` → forced.
- The table is internally consistent with the following paragraph, and the non-releasable
  types are explicitly listed.
- No other README section is modified (diff is confined to ~lines 118–129 and its paragraph).

### Phase 4 — Ship the pending PR #19 rename release

**Objective:** Queue PR #19's already-merged-but-unreleased rename for release by adding a
release-triggering commit on the working branch, so that when this branch is merged to `main`,
release-please opens a Release PR that includes the rename. **Recommendation:** use a
`fix:`-typed commit (clear changelog entry, lets release-please compute the pre-1.0 patch bump
`0.1.7` → `0.1.8`) rather than a `Release-As:` footer (which pins an exact version and bypasses
the derived bump). Reserve `Release-As:` for the eventual `1.0.0` cut.

**Agent:** `code-copilot` — or a manual `git commit` the user performs. This is a single
conventional-commit step; the plan does not itself commit, push, or merge.

**Files to change:**
- No source edits required beyond a commit whose message documents the shipped rename, e.g.
  `fix: release PR #19 module/file rename`. If a trivial touch is needed to carry the commit,
  keep it to a comment/no-op that does not alter behavior.

**Acceptance criteria:**
- A `fix:`-typed commit (message referencing the PR #19 rename) exists on
  `chore/20260728-release-please-hardening`.
- Mechanism explained: on merge to `main`, `release.yml` runs `googleapis/release-please-action@v4`,
  which sees a `fix:` commit since `v0.1.7` and opens a Release PR bumping to `0.1.8`. The plan
  does **not** merge or open that PR.

### Phase 5 — Verification

**Objective:** Confirm clean regeneration and that the change set is consistent and non-breaking.

**Agent:** `test-runner-copilot`.

**Files to change:** none (verification only).

**Acceptance criteria:**
- `python src/extract-agents.py` runs clean and re-running produces no further diff (idempotent).
- Root and `src/` copies of the pull-request SKILL match the regenerated output.
- CLI dry-run sanity check passes per existing maintenance steps:
  `node src/bin/ai-bootstrap.js --all --dry-run --dest "$RUNNER_TEMP/aib-check"` (mirrors the
  existing `ci.yml` "Package sanity" step); `npm test` passes.
- `git diff` confirms `release-please-config.json`, `.release-please-manifest.json`, and
  `release.yml` are all unchanged.

## Open questions

- **Advisory-check placement:** appended `release-guard` job in `ci.yml` (recommended) vs a
  standalone `release-guard.yml`. The recommendation is the appended job (fewer files, reuses the
  existing `pull_request`→`main` trigger and `contents: read` permission). Confirm before Phase 2,
  or note if a `push`-to-`main` trigger is preferred (which would favor a standalone workflow).
- **Pending-rename mechanism:** `fix:` commit (recommended, derives `0.1.7` → `0.1.8`) vs a
  `Release-As:` footer (pins an exact version). Confirm the `fix:` choice for Phase 4.

## Risks

- **Hand-editing generated files.** Editing `.github/skills/pull-request/SKILL.md` (or any
  `src/.<tool>/` / root copy) directly instead of `src/AGENTS-BOOTSTRAP.md` would be overwritten
  on the next regeneration and cause drift. Mitigation: Phase 1 edits only `src/` sources and
  Phase 5 verifies idempotent regeneration.
- **Advisory-check false positives/negatives.** The grep could miss an unusual scope/format or
  wrongly match, warning on a valid release commit (false positive) or staying silent on a
  no-op merge (false negative). Mitigation: the regex matches `feat`/`fix` with optional scope and
  `!`, plus `BREAKING CHANGE:`; it is advisory only, so a miss never blocks anyone.
- **Regeneration drift.** If `python src/extract-agents.py` is not run (or run partially with
  `--src-only`), root and `src/` copies diverge. Mitigation: Phase 5's idempotency + copy-match check.
- **README line-number drift.** "~lines 118–129" is approximate; the agent must locate the table
  by content ("Releasing to npm" bump table), not by hardcoded line numbers.
- **Misreading scope as behavior change.** A future reader might assume this makes `refactor:`
  releasable — it does not. The docs and guardrails explicitly state config behavior is unchanged.
