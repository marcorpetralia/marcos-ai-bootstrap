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

test("--gitignore skips entry-point wiring and writes ignore patterns instead", () => {
  const dest = mkTmp();
  const { results } = materialize(["claude"], { destRoot: dest, gitignore: true });

  assert.ok(
    !results.some((r) => r.relPath === "AGENTS.md"),
    "AGENTS.md must not be created or amended"
  );
  assert.ok(!fs.existsSync(path.join(dest, "AGENTS.md")));
  assert.ok(!fs.existsSync(path.join(dest, "CLAUDE.md")));

  const gitignoreResult = results.find((r) => r.relPath === ".gitignore");
  assert.ok(gitignoreResult, ".gitignore result missing");
  assert.equal(gitignoreResult.status, "created");

  const contents = fs.readFileSync(path.join(dest, ".gitignore"), "utf8");
  for (const expected of [
    "MARCOS-AI-BOOTSTRAP.md",
    "HUMAN.md",
    "documents/templates/plan-template.md",
    ".claude/agents/",
    ".claude/skills/",
  ]) {
    assert.ok(contents.includes(expected), `.gitignore missing ${expected}`);
  }
});

test("--gitignore is idempotent and extends existing .gitignore on re-run with more tools", () => {
  const dest = mkTmp();
  materialize(["claude"], { destRoot: dest, gitignore: true });
  const second = materialize(["claude"], { destRoot: dest, gitignore: true });
  assert.ok(
    second.results.some(
      (r) => r.relPath === ".gitignore" && r.status === "already-wired"
    )
  );

  const third = materialize(["codex"], { destRoot: dest, gitignore: true });
  assert.ok(
    third.results.some((r) => r.relPath === ".gitignore" && r.status === "appended")
  );
  const contents = fs.readFileSync(path.join(dest, ".gitignore"), "utf8");
  assert.ok(contents.includes(".codex/agents/"));
  assert.equal(
    contents.split("# Marcos AI-Bootstrap (materialised files)").length - 1,
    1,
    "marker heading must not be duplicated"
  );
});
