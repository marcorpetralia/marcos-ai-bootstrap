# Public-readiness polish: docs positioning, guardrail carve-out, real tests, repo metadata

**Date:** 2026-07-25
**Branch:** `chore/20260725-public-readiness-polish`
**Mode:** Two-stage planning — Stage 2 (Full Implementation Plan)

## 1. Goal

Make `marcos-ai-bootstrap` present as a maintained, adoption-ready open-source tool rather than a personal dotfiles drop, and remove the one genuine internal contradiction in its own rules. Concretely: (a) reposition the README for a broad audience with a clear "who this is for" opening line, real badges, and a surfaced pre-1.0 maturity note; (b) resolve the guardrails contradiction by adding a tightly-scoped, user-authorized commit/push carve-out for `watch-ci` in every source-of-truth file and regenerating the materialised copies so they stay in lockstep; (c) replace the placeholder CI with a real zero-dependency `node:test` suite that snapshots `materialize.js` behaviour, wired into `ci.yml`, with the documented Node engine minimum bumped to `>=18`; (d) add adoption-target `CONTRIBUTING.md` and a truthful (grep-verified) `SECURITY.md`; and (e) set the live GitHub repository topics. Success = the README reads as a public tool, `npm test` passes locally and in CI, the CI badge reflects a real workflow, `git diff` after regeneration shows only intended wording changes with the materialised `watch-ci` SKILL copies matching their regenerated output byte-for-byte, and the repo's live topic list matches the finalized list below.

## 2. Constraints

- **Branch:** `chore/20260725-public-readiness-polish` (derived from the user's suggested `chore/public-readiness-polish`, date-prefixed to match the existing `chore/20260720-…` convention). **Never commit or push to `main`.** Implementing agents edit files only; the user owns commits and pushes.
- **Single branch, coupled scope:** docs polish + source-of-truth rule fixes + the test suite all land on one branch. Source-of-truth changes and tests both touch the repo's own claims about itself, so they are intentionally not split across branches.
- **`src/` is the single source of truth.** Never hand-edit the materialised copies under `.claude/`, `.codex/`, `.github/agents/`, `.github/skills/`, `.agents/skills/`, or under `src/.claude/` etc. Edit the source (`src/MARCOS-AI-BOOTSTRAP.md`, `src/AGENTS-BOOTSTRAP.md`, `src/HUMAN.md`) and regenerate with `python src/extract-agents.py`, which rewrites the `src/.<tool>/` templates from `src/AGENTS-BOOTSTRAP.md` **and** syncs this repo's root self-hosted copies via the CLI.
- **Guardrail carve-out must stay tight:** the exception permits committing/pushing **only on a feature branch** and **only when the user has invoked a skill to do so** (never autonomous). "Never commit to `main`" and "never push to `main`" remain unconditional with no exception.
- **Node engine bump is load-bearing for tests:** `node:test` is only stable on Node `>=18`. Adding the suite requires bumping `package.json` `engines.node` from `>=16` to `>=18`; this must be documented (release-please will produce the changelog entry from the commit).
- **CI badge sequencing:** the CI badge is added only after `ci.yml` runs real checks — do not advertise a green badge for a placeholder workflow. The badge lands in the docs phase, which runs after the test-wiring phase.
- **SECURITY.md claims must be verified, not assumed:** before asserting "runs locally, no phone-home, no credential/telemetry reads," the agent must re-grep the runtime source (`src/lib/materialize.js`, `src/bin/ai-bootstrap.js`) for network/credential/telemetry calls and only assert what the code actually does.
- **Out of scope (note, do not build):** demo GIF/asciinema (no terminal-recording tool available — leave a placeholder marker in the README for where it will go, as a manual user follow-up); any LinkedIn/social post.
- **No MCP surface:** this task touches only local files, Node packaging, docs, and GitHub repo settings. Per the MCP Servers discovery flow in `MARCOS-AI-BOOTSTRAP.md`, no discovered server (`azure`, `cloudflare`, etc.) is relevant to the plan, so none is queried or folded in. (The only live-platform action is `gh repo edit`, which uses the GitHub CLI, not an MCP server.)

### Cross-references

- `documents/plans/20260720-plan-template-deployment.md` — its deferred, opt-in "Phase 5" floated exactly the `test/materialize.test.js` + `"test"` script this plan now implements. That plan deliberately deferred it as manual-only; this plan supersedes that deferral.
- `src/MARCOS-AI-BOOTSTRAP.md` — Guardrails (lines ~94–101), the `watch-ci` Skills entry (lines ~111–116), the MCP mapping table (line ~33), and Documentation Rules (lines ~151–156): the source-of-truth prose edits in Phase 1.
- `src/AGENTS-BOOTSTRAP.md` — three `watch-ci` SKILL bodies (fix-loop step 6 "Commit & push" at lines ~395, ~1049, ~1708; plus each body's `## Guardrails`): the skill-body edits in Phase 1.
- `src/HUMAN.md` — hardcoded "opus 4.8 @ medium effort" at lines 22 and 25: genericized in Phase 1.
- `src/lib/materialize.js`, `src/bin/ai-bootstrap.js` — subject under test (Phase 2) and the files to re-grep for the SECURITY.md claim (Phase 4). Verified in Stage 1: zero network/telemetry/credential/`process.env` usage today.
- `src/extract-agents.py` — regeneration tool run at the end of Phase 1.

## 3. Phases

### Phase 1 — Source-of-truth rule fixes + regeneration

**Objective:** Fix, in the `src/` source-of-truth files, (1) the guardrails contradiction via a tightly-scoped user-authorized commit/push carve-out, (2) the matching `watch-ci` wording in both the Skills summary and the three SKILL bodies, (3) the missing "illustrative, may churn" disclaimer on the MCP mapping table, (4) the over-broad "update the root README on every change" Documentation Rule, and (5) the hardcoded "opus 4.8" model reference in `HUMAN.md`. Then run `python src/extract-agents.py` to regenerate the `src/.<tool>/` templates and sync the repo-root self-hosted copies, and verify no unintended drift.

**Agent:** code-claude — this phase edits the agent-network's own rule/config source-of-truth files and, critically, runs the `extract-agents.py` regeneration tooling and verifies generated artifacts match byte-for-byte. That regeneration/verification step is build-tooling work, so it routes to `code-claude` rather than `docs-claude` (whose remit excludes running scripts and touching config).

**Files to change:**
- `src/MARCOS-AI-BOOTSTRAP.md` (Guardrails, `watch-ci` Skills entry, MCP table disclaimer, Documentation Rules)
- `src/AGENTS-BOOTSTRAP.md` (three `watch-ci` SKILL bodies — step 6 and each `## Guardrails`)
- `src/HUMAN.md` (model-reference genericization, lines 22 & 25)
- Regenerated by the script (do NOT hand-edit): `src/.claude/skills/watch-ci/SKILL.md`, `src/.github/skills/watch-ci/SKILL.md`, `src/.agents/skills/watch-ci/SKILL.md`, and the root self-hosted copies `MARCOS-AI-BOOTSTRAP.md`, `HUMAN.md`, `.claude/skills/watch-ci/SKILL.md`, `.github/skills/watch-ci/SKILL.md`, `.agents/skills/watch-ci/SKILL.md`.

**Design:**

Guardrails — `src/MARCOS-AI-BOOTSTRAP.md` (replace the first three bullets). Keep `main` unconditional; scope the exception to user-invoked skills on a feature branch:

```markdown
- **No agent commits or pushes autonomously.** Agents modify files and write
  changes; the user owns committing and pushing. The single exception is a skill
  the user has explicitly invoked to do so (e.g. `watch-ci`): such a skill may
  commit and push **only on a feature branch**, and **only to perform the action
  the user invoked it for**. It must never commit or push unprompted.
- **Never commit to `main`.** No exception — the carve-out above never applies to `main`.
- **Never push to `main`.** No exception — the carve-out above never applies to `main`.
- Always work on a feature / chore / bugfix branch
- Never merge a Pull Request
- Never update cloud infrastructure manually — all changes must go through IAC or deployment pipelines
```

`watch-ci` Skills entry — `src/MARCOS-AI-BOOTSTRAP.md` (append to its **Guardrails:** line so the summary matches the carve-out):

```markdown
**Guardrails:** Runs only because the user invoked it; on that authority it may
commit and push its fixes **on the feature branch only**. Never pushes or commits
to `main`, never force-pushes, never `--no-verify`. For remote-repo targets it
cannot edit locally, so it watches, diagnoses, and reports the fix back to the user.
```

`watch-ci` SKILL bodies — `src/AGENTS-BOOTSTRAP.md`, all three tool variants. Amend fix-loop step 6 and each `## Guardrails` block:

```markdown
6. **Commit & push** — because the user invoked this skill to drive CI green, commit
   the fix and push **on the current feature branch only**; never commit or push to `main`.
```
```markdown
## Guardrails
- This skill commits and pushes as an explicitly user-invoked action, on the
  feature branch only — never autonomously and never on `main`.
- Never push to `main`.
- Never force-push.
- Never use `--no-verify`.
- Never merge a PR.
- For remote-repo targets this skill cannot edit locally: diagnose, propose the fix, and report back to the user without pushing.
```

MCP mapping table disclaimer — `src/MARCOS-AI-BOOTSTRAP.md`, add a sentence immediately above or below the table (line ~33):

```markdown
> The package/endpoint values below are **illustrative and may churn** — MCP
> server names, packages, and URLs change upstream. Treat them as starting
> points and confirm the current command against the server's own docs before
> installing.
```

Documentation Rules — `src/MARCOS-AI-BOOTSTRAP.md`, narrow the blanket rule:

```markdown
- Update the root `README.md` when a change affects how the tool is installed,
  invoked, or what it produces — not for internal-only changes with no user-facing effect.
```

`src/HUMAN.md` — genericize the model reference (lines 22 & 25), removing the dated "opus 4.8" hardcode while keeping the medium-then-low effort guidance model-agnostic (e.g. "your most capable model at medium effort" / "…at low effort to save tokens", with any concrete model named only as an interchangeable example or dropped).

Regeneration (run after edits): `python src/extract-agents.py` (no `--src-only`, so it also syncs the root copies via the CLI).

**Acceptance criteria:**
- Guardrails in `src/MARCOS-AI-BOOTSTRAP.md` contain the scoped carve-out; the two `main` bullets explicitly state no exception applies to `main`.
- The `watch-ci` Skills summary and all three `src/AGENTS-BOOTSTRAP.md` SKILL bodies consistently describe commit/push as a user-invoked, feature-branch-only action.
- The MCP table carries the "illustrative and may churn" disclaimer; the Documentation Rules README bullet is narrowed.
- `src/HUMAN.md` no longer hardcodes a specific model as a requirement (no bare "opus 4.8 @ medium effort" mandate).
- After running `python src/extract-agents.py`: the materialised `watch-ci` SKILL copies under `src/.claude/`, `src/.github/skills/`, `src/.agents/skills/` and the root `.claude/`, `.github/skills/`, `.agents/skills/` copies match the regenerated output exactly, and the root `MARCOS-AI-BOOTSTRAP.md` / `HUMAN.md` match their `src/` sources.
- `git status` / `git diff` shows changes confined to the intended source files and their regenerated derivatives — no incidental drift in unrelated agent/skill files.

### Phase 2 — Real `node:test` suite, engines bump, and CI wiring

**Objective:** Replace the placeholder CI with a genuine zero-dependency test suite for `materialize.js`, add a `test` script, bump the documented Node engine minimum to `>=18`, and wire the suite into `ci.yml` in place of the `echo` placeholder. Implements the opt-in idea deferred in `20260720-plan-template-deployment.md`.

**Agent:** test-runner-claude — authoring the test suite and its regression guards is its core remit; it also owns the coupled `package.json` (`test` script + `engines`) and `ci.yml` edits that make the suite run. (Judgment call: `ci.yml` is nominally infra, but it is inseparable from "make the tests actually run," so it stays in this phase rather than being split to `infra-claude`.)

**Files to change:**
- `test/materialize.test.js` (new)
- `package.json` (`scripts.test`, `engines.node`)
- `.github/workflows/ci.yml` (replace placeholder step)

**Design:**

`test/materialize.test.js` — use the built-in runner (`node:test` + `node:assert`), no new dependencies; run against a throwaway temp dir under the OS temp root, cleaned up after:

```js
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { materialize, CORE_FILES } = require("../src/lib/materialize");

const mkTmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "aib-test-"));

test("CORE_FILES maps the three shipped source-of-truth files", () => {
  const dests = CORE_FILES.map((f) => f.dest);
  assert.deepEqual(dests, [
    "MARCOS-AI-BOOTSTRAP.md",
    "HUMAN.md",
    "documents/templates/plan-template.md",
  ]);
});

test("dry-run reports expected files and writes nothing", () => {
  const dest = mkTmp();
  const { results } = materialize(["claude"], { destRoot: dest, dryRun: true });
  const rels = results.map((r) => r.relPath);
  for (const expected of [
    "MARCOS-AI-BOOTSTRAP.md",
    "HUMAN.md",
    "documents/templates/plan-template.md",
    "AGENTS.md",
    ".claude/skills/watch-ci/SKILL.md",
  ]) assert.ok(rels.includes(expected), `missing ${expected}`);
  assert.equal(fs.readdirSync(dest).length, 0, "dry-run must not write");
});

test("real run creates, re-run skips, --force overwrites", () => {
  const dest = mkTmp();
  const first = materialize(["claude"], { destRoot: dest });
  assert.ok(first.results.some((r) => r.status === "created"));
  const second = materialize(["claude"], { destRoot: dest });
  assert.ok(second.results.some((r) => r.status === "skipped-exists"));
  const forced = materialize(["claude"], { destRoot: dest, force: true });
  assert.ok(forced.results.some((r) => r.status === "overwritten"));
});

test("entry-point wiring is idempotent (AGENTS.md already-wired on re-run)", () => {
  const dest = mkTmp();
  materialize(["codex"], { destRoot: dest });
  const again = materialize(["codex"], { destRoot: dest });
  assert.ok(again.results.some(
    (r) => r.relPath === "AGENTS.md" && r.status === "already-wired"));
});
```

`package.json` — add the script and bump the engine (no dependencies added):

```json
  "scripts": {
    "test": "node --test"
  },
  "engines": {
    "node": ">=18"
  },
```

`.github/workflows/ci.yml` — replace the placeholder step with a real install-free test run plus a package-sanity dry-run (the suite is zero-dependency, so no `npm ci`/lockfile is required):

```yaml
      - name: Run tests
        run: npm test

      - name: Package sanity (dry-run materialise)
        run: node src/bin/ai-bootstrap.js --all --dry-run --dest "$RUNNER_TEMP/aib-check"
```

**Acceptance criteria:**
- `npm test` passes locally (all `node:test` cases green) and writes nothing outside the OS temp dir.
- `package.json` is valid JSON, declares `"test": "node --test"`, and `engines.node` is `>=18`.
- `ci.yml` no longer contains the `echo "CI placeholder…"` step; it runs `npm test` and the dry-run sanity check on Node 24 (already configured), which satisfies `>=18`.
- The suite exercises `CORE_FILES`, dry-run non-writing, create/skip/force transitions, and entry-point idempotency.
- No runtime dependencies added to `package.json`.

### Phase 3 — README repositioning, badges, and maturity note

**Objective:** Reposition the README for an adoption audience: replace the opening with a neutral one-sentence "who this is for," add badges (npm version, license, CI status — the CI badge only now that Phase 2 made CI real), surface the pre-1.0 maturity note near the top, document the Node `>=18` requirement, and drop a placeholder marker for the future demo GIF. Runs after Phase 2 so the CI badge reflects a real workflow.

**Agent:** docs-claude — pure documentation, no code or config.

**Files to change:**
- `README.md`

**Design:**
- Opening line: a neutral, adoption-target sentence naming who it is for, e.g. "A tool-agnostic agent/skill network that gives Claude Code, Codex, and GitHub Copilot CLI a shared plan → implement → deploy → fix workflow — drop it into any repository with one command." (Replace "AI tools for doing work. No overcomplications." as the lede.)
- Badges block directly under the H1 (shields.io, self-contained):
  - npm version: `https://img.shields.io/npm/v/marcos-ai-bootstrap`
  - license: `https://img.shields.io/npm/l/marcos-ai-bootstrap`
  - CI status: the GitHub Actions workflow-status badge for `ci.yml` on `main`.
- Maturity note near the top (one line): pre-1.0 and evolving; SemVer stabilises at `1.0.0` — link down to the existing "Releasing to npm" section rather than duplicating it.
- Node requirement: state "Requires Node.js >= 18" near Quick start (reflecting the Phase 2 engines bump).
- Demo placeholder: an HTML comment or short "Demo (coming soon)" marker where a GIF/asciinema will go, so the user can drop it in later. Do not fabricate a recording.

**Acceptance criteria:**
- README opens with the neutral adoption-target sentence and a "who this is for" framing; the old lede is gone.
- Badges render (npm version, license, CI status) and point at real endpoints; the CI badge references the now-real `ci.yml`.
- A pre-1.0 maturity note appears near the top and cross-links the "Releasing to npm" section.
- "Requires Node.js >= 18" is documented and consistent with `package.json`.
- A visible placeholder for the demo GIF exists; no fake/broken media is embedded.
- No code or config files touched.

### Phase 4 — CONTRIBUTING.md and SECURITY.md

**Objective:** Add an adoption-target `CONTRIBUTING.md` with a real contributor workflow and a truthful, grep-verified `SECURITY.md`.

**Agent:** docs-claude — documentation-only; but note it must run a read-only grep to verify the SECURITY claim before writing it (read-only inspection, not a code change).

**Files to change:**
- `CONTRIBUTING.md` (new, repo root — governance file, not shipped in the npm `files` allowlist)
- `SECURITY.md` (new, repo root)

**Design:**
- `CONTRIBUTING.md` — imply PRs are welcome and give the actual workflow, consistent with adoption-target framing:
  - Branch naming: typed kebab-case (`feat/…`, `fix/…`, `chore/…`, dated to match repo convention).
  - Commit convention: Conventional Commits (feeds release-please); reference the `pr` skill.
  - Running tests locally: `npm test` (Node `>=18`).
  - The `src/` → materialised-copies regeneration flow: edit `src/AGENTS-BOOTSTRAP.md` / `src/MARCOS-AI-BOOTSTRAP.md` / `src/HUMAN.md`, run `python src/extract-agents.py`, never hand-edit generated copies; sanity-check with the `--all --dry-run` CLI command.
  - Pointer to `MARCOS-AI-BOOTSTRAP.md` for the agent rules and guardrails.
- `SECURITY.md` — **verify before asserting.** The agent must grep `src/lib/materialize.js` and `src/bin/ai-bootstrap.js` for network/telemetry/credential access and only state what is true. Stage 1 verified these files use only `fs`/`path` with no network, telemetry, credential, or `process.env` reads, so the intended claim ("runs entirely locally; only touches the filesystem; no network calls, no telemetry, no credential reads") is accurate as of now — but the implementing agent re-confirms rather than trusting this note. Include supported-versions (pre-1.0: latest released line) and a private reporting channel (GitHub private security advisory and/or the maintainer email).

**Acceptance criteria:**
- `CONTRIBUTING.md` exists with branch-naming, Conventional-Commit, local-test (`npm test`), and `src/`→regeneration guidance, in an adoption-target (PRs-welcome) tone.
- `SECURITY.md` exists, states a reporting channel and supported versions, and its "no network / no telemetry / local-only" assertion was confirmed by an actual grep of `src/lib/materialize.js` and `src/bin/ai-bootstrap.js` in this phase (not merely copied from this plan).
- Neither file is added to the `package.json` `files` allowlist (they are repo governance, not shipped package contents).
- No code or config files modified.

### Phase 5 — Set live GitHub repository topics

**Objective:** Set the repository's GitHub topics (currently empty) to a finalized list reconciling the existing npm keywords with the reviewer's suggestions.

**Agent:** infra-claude — this is a live repo-settings action via the GitHub CLI (not a file edit, and not an MCP-server operation). It runs `gh repo edit` directly. (Alternatively the user runs the command; the plan states the exact command so either path is unambiguous.)

**Files to change:**
- None (live GitHub repo settings only).

**Design:**
Reconcile npm keywords (`ai, agents, copilot, claude, codex, bootstrap, cli`) with the reviewer's suggestions (`ai-agents, claude-code, codex, github-copilot, cli, mcp`), preferring the more precise, discoverable GitHub-topic forms. **Finalized topic list:**

`ai-agents`, `claude-code`, `codex`, `github-copilot`, `cli`, `mcp`, `bootstrap`, `agentic-workflows`

Command:

```bash
gh repo edit marcorpetralia/marcos-ai-bootstrap \
  --add-topic ai-agents --add-topic claude-code --add-topic codex \
  --add-topic github-copilot --add-topic cli --add-topic mcp \
  --add-topic bootstrap --add-topic agentic-workflows
```

**Acceptance criteria:**
- `gh repo view --json repositoryTopics` lists exactly the eight finalized topics (no more, no fewer), all lowercase and hyphenated.
- No repository files changed by this phase.

## Open questions

- **Final topic list confirmation:** the eight-topic list above is the agent's reconciled judgment. If the user prefers to keep it to the reviewer's original six (`ai-agents, claude-code, codex, github-copilot, cli, mcp`) or wants `bootstrap`/`agentic-workflows` dropped, adjust before Phase 5 runs. Non-blocking default: apply all eight.
- **Engines-bump release semantics:** raising `engines.node` to `>=18` is technically breaking for anyone on Node 16. Should the enabling commit be typed `feat!:`/`BREAKING CHANGE:` (→ minor pre-1.0) or a plain `fix:`/`chore:` (→ patch)? Deferred to the `pr` skill / user at commit time; the plan does not dictate commit type. Node 16 is long EOL, so a patch is defensible.
- **SECURITY.md reporting channel:** use GitHub private security advisories, the maintainer email (`marcorpetralia@gmail.com`), or both? Default: mention GitHub advisories first, email as fallback.

## Risks

- **Regeneration drift (highest risk):** hand-editing a materialised copy instead of the `src/` source, or forgetting to run `python src/extract-agents.py`, leaves the shipped/self-hosted `watch-ci` copies inconsistent with the source — reintroducing the very contradiction this plan fixes. Mitigation: Phase 1 acceptance criteria require the regenerated copies to match and `git diff` to show only intended changes.
- **Carve-out too loose:** imprecise wording could be read as licensing autonomous commits or `main` pushes. Mitigation: the exact wording in Phase 1 keeps the `main` prohibitions unconditional and ties the exception to explicit user invocation + feature branch only; the summary line and all three SKILL bodies must agree.
- **CI badge/red-build optics:** if the badge is added before `ci.yml` is real, or if the new suite is flaky, the public badge shows red. Mitigation: badge is sequenced into Phase 3 (after Phase 2), and the suite is deterministic (temp-dir isolated, no network, no ordering assumptions).
- **`npm test` without a lockfile:** CI runs `npm test` with no `npm ci`; this works only because the suite is zero-dependency. Adding any dependency later would require adding a lockfile and an install step. Mitigation: Phase 2 acceptance criteria forbid new runtime dependencies.
- **Engines/`node --test` compatibility:** `node --test` and `node:test` are stable on Node `>=18`; CI already runs Node 24. Mitigation: engines bump documented; local runs must be on `>=18`.
- **SECURITY.md over-claiming:** if the runtime later adds a network/update-check call, the "no phone-home" claim silently becomes false. Mitigation: Phase 4 requires re-grepping the source at authoring time; treat future network additions as requiring a SECURITY.md update.
- **Topic churn / duplication:** GitHub topics and npm keywords can drift apart over time. Low impact; noted so future maintainers keep them roughly aligned.
