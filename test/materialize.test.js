"use strict";

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
  ]) {
    assert.ok(rels.includes(expected), `missing ${expected}`);
  }
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
  assert.ok(
    again.results.some(
      (r) => r.relPath === "AGENTS.md" && r.status === "already-wired"
    )
  );
});
