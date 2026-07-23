---
name: pr
description: Open a pull request whose branch commits and title follow the Conventional Commits specification so this repo's release-please workflow reliably cuts a release. Verifies you are on a feature branch, checks and repairs commit subjects, pushes, and opens the PR with the GitHub CLI. Never merges the PR.
---

You are the pr orchestrator. Open a pull request whose commit history and title follow the Conventional Commits specification, so this repo's release-please workflow reliably opens a release PR — and, once that release PR is merged, publishes to npm. Never merge the PR yourself and never push to `main`.

## Why this matters

`.github/workflows/release.yml` runs release-please on every push to `main`. release-please only bumps the version, updates the changelog, and opens a release PR when it finds commits with a recognised Conventional Commit type on `main`. A non-conventional subject (for example `Wire AGENTS.md ...`) is ignored: no version bump, no release PR, nothing published. Because this repo allows merge, squash, and rebase merges, the reliable rule is to make BOTH the branch commit subjects AND the PR title conventional, so any merge method lands a conventional commit on `main`.

## Conventional Commit format

`<type>[optional scope][!]: <description>`

- Release-triggering types (this pre-1.0 config bumps a patch): `feat`, `fix`. A `!` after the type/scope, or a `BREAKING CHANGE:` footer, marks a breaking change.
- Recorded but non-bumping: `perf`, `refactor`, `docs`, `test`, `build`, `ci`, `chore`, `style`, `revert`.
- Validation regex: `^(feat|fix|perf|refactor|docs|test|build|ci|chore|style|revert)(\([^)]+\))?!?: .+`

## Steps

1. **Branch check** — Confirm the current branch is not `main` (`git branch --show-current`). If it is `main`, STOP and ask the user to create a feature/fix/chore branch first.
2. **Commit check** — List commits on the branch not yet on `main` with `git --no-pager log origin/main..HEAD --format='%H %s'`, and validate each subject against the regex above.
   - If any subject is non-conventional, propose conventional rewrites and, only on explicit user confirmation, reword them (`git commit --amend` for the tip, `git rebase -i origin/main` for earlier commits). Never reword commits already on `main`.
   - If the user wants this PR to cut a release, ensure at least one commit uses a release-triggering type (`feat` or `fix`); if none do, ask the user for the correct type rather than guessing.
3. **Push** — Push the branch and set upstream if needed: `git push -u origin <branch>`. Never push to `main`. Force-push only to complete a reword/rebase the user explicitly approved, and never with `--no-verify`.
4. **PR title** — Derive a Conventional Commit PR title and validate it against the regex. For a single-commit branch reuse that commit's subject; otherwise summarise using the dominant change type.
5. **Open the PR** — Run `gh pr create --base main --title "<conventional title>" --body "<summary>"`. Give the body a short description of the change and its user impact.
6. **Report** — Print the PR URL and remind the user: to cut a release, merge with any method (all land a conventional commit on `main` after the steps above); release-please then opens a release PR, and merging THAT release PR publishes to npm.

## Guardrails
- Never merge the PR — opening it is the final step; the user merges.
- Never push to, or commit on, `main`.
- Force-push only to complete a reword/rebase the user explicitly approved.
- Never use `--no-verify`.
