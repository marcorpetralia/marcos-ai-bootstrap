# Plan-file template: package, deploy, and wire into the planner agents

**Date:** 2026-07-20
**Branch:** `chore/20260720-plan-template-deployment`
**Mode:** Two-stage planning — Stage 2 (Full Implementation Plan)

## 1. Goal

Ship a canonical, tool-agnostic **plan-file template** as part of the `marcos-ai-bootstrap` npm package so that every repository bootstrapped by this tool receives a consistent scaffold for future implementation plans. The template mirrors the section structure of the real cycle-hub plans (`cycle-hub/documents/plans/pre-golive/*.md`) but ships as **empty scaffolding** (placeholder text / HTML comments — no worked example). It is deployed as a first-class core file — **always written** regardless of `--claude`/`--codex`/`--copilot` flags, exactly like `AGENTS.md`/`HUMAN.md` — to the target path `documents/templates/plan-template.md`, honouring the standard skip/force/dry-run semantics. In the same change, the Stage-2 planner agent definitions (copilot/claude/codex) are updated to **read `documents/templates/plan-template.md` and follow its structure** before writing any plan, so the template is actually consumed rather than merely present. Success = a fresh `npx marcos-ai-bootstrap --<tool>` run drops the template into the target repo, re-runs skip it, `--force` overwrites it, the file is genuinely published in the npm tarball, and the planner agents point at it.

## 2. Constraints

- **Branch:** `chore/20260720-plan-template-deployment`. **Never commit or push to `main`.** All work lands on the feature branch; the implementing agents do not commit or push (per repo agent rules — commits/pushes are a human step).
- **Agent split:** documentation/scaffolding/agent-prose changes go to **docs-copilot**; JavaScript/`package.json` logic changes go to **code-copilot**; verification goes to **test-runner-copilot**. Do not mix code and docs edits in one agent turn.
- **npm `files` allowlist gotcha (load-bearing):** `package.json` uses a `"files"` allowlist. A new source file referenced by `materialize.js` will **not** be published to the npm registry unless its path is added to `"files"`. Adding the `CORE_FILES` entry *without* updating `"files"` will pass all local tests (the file exists on disk in the repo) yet **silently ship a broken package** where `copyOne` reports `missing-source` for end users. Both edits are mandatory and must land together.
- **Self-hosted canonical source:** the template source path == destination path (`documents/templates/plan-template.md` at the package root, **not** under `src/`). This single file is simultaneously the shipped source-of-truth and this repo's own self-hosted copy. Consequence: this repo will now permanently carry a `documents/templates/` directory (in addition to the new `documents/plans/` created by this very plan).
- **Standard copy semantics only:** skip-if-exists by default, overwrite on `--force`, respect `--dry-run`. These are inherited automatically from `copyOne`; do **not** add bespoke handling.
- **Template fidelity:** the scaffold must contain the **full section set** observed in cycle-hub plans (title, metadata block, Goal, Constraints + Cross-references, Phases with per-phase fields, Open questions, Risks) but remain empty (placeholders / HTML comments), with no dummy phase or example content.
- **No cloud/MCP surface:** this task touches only local files, Node packaging, and agent prose. No discovered MCP server (`azure`, etc.) is relevant, so none is queried. (Checked per the MCP Servers flow in `AGENTS.md`; nothing to fold in.)
- **Node engine:** keep compatibility with `"node": ">=16"` (no new syntax/deps; no new runtime dependencies at all).

### Cross-references

- `src/lib/materialize.js` — `CORE_FILES`, `copyOne`, `materialize()` (deployment pipeline; load-bearing edit in Phase 2).
- `src/bin/ai-bootstrap.js` — CLI summary printer (`created`/`overwritten`/`skipped`/`missing-source`); no edit, used for verification in Phase 5.
- `package.json` — `"files"` allowlist (Phase 3) and absence of a `"test"` script (Phase 5 scoping).
- `.github/agents/planner-copilot.agent.md`, `.claude/agents/planner-claude.md`, `.codex/agents/planner-codex.toml` — Stage-2 planner agents to wire (Phase 4).
- `.github/agents/planner-discovery-copilot.agent.md` (+ claude/codex siblings) — Stage-1 discovery agents; optional lightweight mention only (Phase 4).
- Reference structure source (external, read-only): `C:\localCode\Github-Personal\cycle-hub\documents\plans\pre-golive\20260622-ui-bugs.md`.
- This plan itself is the first file created under `documents/plans/` in this repo.

## 3. Phases

### Phase 1 — Author the plan-template scaffold

**Objective:** Create `documents/templates/plan-template.md` as empty scaffolding that mirrors the cycle-hub plan structure, using placeholder text and HTML comments only (no worked example, no dummy phase). This file is both the shipped source and the repo's self-hosted copy.

**Agent:** docs-copilot

**Files to change:**
- `documents/templates/plan-template.md` (new)

**Design:** The template must reproduce the full section set observed in `cycle-hub/.../20260622-ui-bugs.md`. Target shape (empty scaffolding):

`documents/templates/plan-template.md`
```markdown
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

<!-- Ordered phases. Duplicate the block below per phase. Name the specific -copilot/-claude/-codex custom agent. -->

### Phase 1 — <title>

**Objective:** <what this phase achieves>

**Agent:** <docs-copilot | code-copilot | test-runner-copilot | ...>

**Files to change:**
- <path>

**Design:** <!-- optional: fenced code snippets for load-bearing changes -->

**Acceptance criteria:**
- <verifiable outcome>

## Open questions

<!-- Anything still needing user input before implementation. -->
- <question>

## Risks

<!-- Known unknowns or risky assumptions. -->
- <risk>
```

**Acceptance criteria:**
- File exists at package-root `documents/templates/plan-template.md`.
- Contains, in order: `#` title, metadata block (`**Date:**`, `**Branch:**`, `**Mode:**`), `## 1. Goal`, `## 2. Constraints` with a `### Cross-references` subsection, `## 3. Phases` with a per-phase block exposing **Objective**, **Agent**, **Files to change**, optional **Design**, **Acceptance criteria**, then trailing `## Open questions` and `## Risks`.
- All content is placeholder text / HTML comments — no real goal, no dummy phase, no example prose.
- Markdown lints cleanly (well-formed headings/lists; fenced blocks closed).

### Phase 2 — Register the template as a core file in the materialisation pipeline

**Objective:** Add a third `CORE_FILES` entry so the template is always deployed (independent of tool flags), reusing existing `copyOne` behaviour (skip/force/dry-run/nested-mkdir all handled).

**Agent:** code-copilot

**Files to change:**
- `src/lib/materialize.js`

**Design:** source path == dest path; `copyOne` already `mkdir`s `path.dirname(dest)`, so the nested `documents/templates/` destination is created automatically.

`src/lib/materialize.js`
```js
const CORE_FILES = [
  { src: "src/AGENTS.md", dest: "AGENTS.md" },
  { src: "src/HUMAN.md", dest: "HUMAN.md" },
  {
    src: "documents/templates/plan-template.md",
    dest: "documents/templates/plan-template.md",
  },
];
```

**Acceptance criteria:**
- `CORE_FILES` contains exactly the three entries above; the new entry has identical `src` and `dest`.
- No change to `copyOne`, `materialize()`, or the `TOOLS` map (behaviour inherited).
- `node -e "console.log(require('./src/lib/materialize').CORE_FILES.length)"` prints `3`.
- A dry-run for any single tool lists `documents/templates/plan-template.md` among the results.

### Phase 3 — Add the template path to the npm `files` allowlist

**Objective:** Ensure the template is actually published in the npm tarball. Without this, the `CORE_FILES` reference resolves to `missing-source` for installed users.

**Agent:** code-copilot

**Files to change:**
- `package.json`

**Design:** add the `documents/templates` directory to the `"files"` array (directory form so future templates are also included).

`package.json`
```json
  "files": [
    "src/bin",
    "src/lib",
    "src/AGENTS.md",
    "src/HUMAN.md",
    "documents/templates",
    ".claude",
    ".codex",
    ".agents",
    ".github/agents",
    ".github/skills"
  ],
```

**Acceptance criteria:**
- `"files"` includes `"documents/templates"`.
- `package.json` remains valid JSON (`node -e "require('./package.json')"` exits 0).
- `npm pack --dry-run` (or `npm publish --dry-run`) lists `documents/templates/plan-template.md` in the tarball contents.

### Phase 4 — Wire the Stage-2 planner agents to read the template

**Objective:** Update the three Stage-2 planner agent definitions to instruct the agent to read `documents/templates/plan-template.md` and follow its structure before writing a plan. Add a lightweight, optional mention in the Stage-1 discovery agents (they only produce outlines, so this is informational — not a hard requirement).

**Agent:** docs-copilot

**Files to change:**
- `.github/agents/planner-copilot.agent.md`
- `.claude/agents/planner-claude.md`
- `.codex/agents/planner-codex.toml`
- (lightweight, optional) `.github/agents/planner-discovery-copilot.agent.md`, `.claude/agents/planner-discovery-claude.md`, `.codex/agents/planner-discovery-codex.toml`

**Design:** In each Stage-2 planner, add an instruction near the "Plan structure" section pointing at the template as the source of truth for section ordering. Suggested prose to insert into `planner-copilot.agent.md` (adapt tone/format for the `.md` vs `.toml` siblings):

`.github/agents/planner-copilot.agent.md`
```markdown
## Plan template
Before drafting, read `documents/templates/plan-template.md` and follow its
section structure exactly (title, metadata block, Goal, Constraints +
Cross-references, Phases, Open questions, Risks). If the template is missing
from the target repo, fall back to the "Plan structure" section below.
```

**Acceptance criteria:**
- All three Stage-2 planner files reference `documents/templates/plan-template.md` and instruct the agent to follow its structure, with a graceful fallback when the file is absent.
- The `.toml` edit keeps valid TOML (string value stays quoted/escaped correctly); the `.md` edits keep valid front-matter and Markdown.
- Discovery-stage edits (if made) are a single informational sentence and do not turn outline production into full-plan production.
- No behavioural code touched; no changes outside the named agent files.

### Phase 5 — Verify deployment and copy semantics

**Objective:** Prove the template deploys correctly end-to-end via the CLI, and that skip/force/dry-run all behave. Decide test scope given there is currently no `"test"` script.

**Agent:** test-runner-copilot

**Files to change:**
- None required for the core verification (manual/CLI checks). Optionally add a lightweight test only if warranted (see scoping note).

**Design / verification steps:** run against a throwaway scratch directory (e.g. a temp dir), not the repo root:
```powershell
# 1. Dry-run: template appears as would-be-created, nothing written
node src/bin/ai-bootstrap.js --copilot --dest $scratch --dry-run

# 2. Real run: template created
node src/bin/ai-bootstrap.js --copilot --dest $scratch

# 3. Re-run: template skipped (already exists)
node src/bin/ai-bootstrap.js --copilot --dest $scratch

# 4. Force: template overwritten
node src/bin/ai-bootstrap.js --copilot --dest $scratch --force

# 5. Confirm it ships in the tarball
npm pack --dry-run
```

**Scoping note (no test runner today):** `package.json` has **no `"test"` script** and there is no existing test suite. Default recommendation: **manual CLI verification suffices** for this change and no test harness is introduced in this plan. If the team wants a regression guard, the minimal option is a tiny Node assertion script (e.g. `test/materialize.test.js`) asserting `CORE_FILES` includes the template entry and that a `materialize(..., { dryRun: true })` result contains `documents/templates/plan-template.md`, wired to a `"test": "node test/materialize.test.js"` script — but this is **out of scope unless the user opts in** (see Open questions).

**Acceptance criteria:**
- Dry-run output lists `documents/templates/plan-template.md` and writes nothing to disk.
- First real run reports it under `created`; the file exists in the scratch dir with the Phase 1 content.
- Second run reports it under `skipped` (`already exists, use --force to overwrite`).
- `--force` run reports it under `overwritten`.
- `npm pack --dry-run` tarball listing includes `documents/templates/plan-template.md`.
- The CLI summary counts stay consistent (created/overwritten/skipped totals reflect the extra core file).

### Phase 6 — Document the new template in the README

**Objective:** Update the root `README.md` to document that bootstrapping now always deploys `documents/templates/plan-template.md`, and that the Stage-2 planner agents consume it.

**Agent:** docs-copilot

**Files to change:**
- `README.md`

**Acceptance criteria:**
- README lists `documents/templates/plan-template.md` among the always-written core files (alongside `AGENTS.md`/`HUMAN.md`).
- README notes the planner agents read the template before writing plans.
- Wording matches actual behaviour delivered in Phases 1–4; no stale or aspirational claims.
- No code or config files touched by this phase.

## Open questions

- **(Soft) Discovery-stage wiring depth:** Should the Stage-1 discovery planner agents get the lightweight informational mention (Phase 4 optional files), or be left untouched entirely? Decision leans "add one sentence"; harmless either way. This is the only genuinely open item — all deployment/path/semantics/fidelity decisions are locked.
- **(Opt-in only) Regression test:** Do we want the minimal `test/materialize.test.js` + `"test"` script from Phase 5, or is manual CLI verification acceptable? Default: manual only; add the test if the user requests a guardrail.

## Risks

- **`package.json` `"files"` omission silently breaks shipping (highest risk):** if Phase 3 is skipped or reverted, local runs and repo self-hosting still work (the file is on disk), but the *published* package reports `missing-source` for the template. Phase 5's `npm pack --dry-run` check is the mitigation — treat it as mandatory, not optional.
- **Template drift from cycle-hub structure:** the scaffold is a hand-authored mirror of `cycle-hub/.../*.md`; if cycle-hub's plan format evolves, this template can silently diverge. Mitigation: Phase 1 acceptance criteria enumerate the exact required sections; note the source-of-truth reference in the template's own comments if helpful.
- **New self-hosted directory in this repo:** the package root now permanently carries `documents/templates/` (source == dest), plus `documents/plans/` from this plan. Anyone treating `documents/` as generated-output-only could be surprised that a source file lives there. Mitigation: the README (Phase 6) and this plan document the dual role.
- **Agent-file format breakage:** the `.codex/agents/planner-codex.toml` edit risks invalid TOML if quoting/escaping is mishandled; the `.md` edits risk malformed front-matter. Mitigation: validate TOML/front-matter after editing (Phase 4 acceptance criteria).
- **Placeholder text mistaken for real content:** an implementing agent could copy the scaffold's HTML-comment placeholders into a real plan. Mitigation: keep placeholders visibly bracketed (`<...>`) and comment-wrapped so they are obviously fill-in markers.
