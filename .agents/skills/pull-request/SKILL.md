---
name: pull-request
description: Open a pull request that follows this repository's conventions for branch names, commit messages, and PR titles and bodies. Verifies you are on a working branch, checks and repairs the branch/commits/title against the active convention profile, pushes, and opens the PR with the GitHub CLI. Never merges the PR.
---

You are the pull-request orchestrator. Open a pull request that conforms to this repository's contribution conventions, then hand off to the user to merge. Never merge the PR yourself and never push to the default branch.

## Convention profile

Apply the rules in the "Repository conventions" section below. While that section still holds the shipped defaults, fall back to these widely-used best-practice defaults:

- **Branch names:** short, kebab-case, prefixed by change type - `feat/`, `fix/`, `chore/`, `docs/`, `refactor/`, `test/`. Never commit on the default branch.
- **Commit messages:** Conventional Commits - `<type>[optional scope][!]: <description>` in the imperative mood, subject <= 72 chars. Types: `feat`, `fix`, `perf`, `refactor`, `docs`, `test`, `build`, `ci`, `chore`, `style`, `revert`. A `!` or `BREAKING CHANGE:` footer marks a breaking change. Validation regex: `^(feat|fix|perf|refactor|docs|test|build|ci|chore|style|revert)(\([^)]+\))?!?: .+`
- **PR title:** one-line summary in the same style as the commit convention.
- **PR body:** what changed and why, linked issues, and user-facing impact / testing notes. Honour `.github/pull_request_template.md` if present.
- **Release automation:** some tools (release-please, semantic-release) only cut a release when a recognised commit type lands on the default branch. If this repo uses one, ensure at least one release-triggering commit (typically `feat`/`fix` or a breaking change) is present when a release is intended.

## Repository conventions

<!-- CONVENTIONS:START -->
_Not yet customised. Run the `initialize` skill to scan this repository's history (past PRs, branch names, commit subjects, and any CONTRIBUTING / PR-template / commit-lint config) and replace this block with the repo's actual conventions. Until then, the general defaults above apply._
<!-- CONVENTIONS:END -->

## Steps

1. **Determine the default branch** - `git symbolic-ref --quiet refs/remotes/origin/HEAD` (fallback `gh repo view --json defaultBranchRef -q .defaultBranchRef.name`); call it `<base>`.
2. **Branch check** - Confirm the current branch is not `<base>` (`git branch --show-current`). If it is, STOP and ask the user to create a working branch that matches the branch-name convention.
3. **Branch-name check** - Validate the current branch name against the active convention; if it does not match, offer to rename it (`git branch -m <new>`) before pushing.
4. **Commit check** - List commits not yet on `<base>` (`git --no-pager log origin/<base>..HEAD --format='%H %s'`) and validate each subject against the commit convention. If any fail, propose compliant rewrites and, only on explicit user confirmation, reword them (`git commit --amend` for the tip, `git rebase -i origin/<base>` for earlier commits). Never reword commits already on `<base>`. If a release is intended and the convention requires a release-triggering type, ensure at least one such commit exists.
5. **Push** - `git push -u origin <branch>`. Never push to `<base>`. Force-push only to complete a reword/rebase the user explicitly approved, and never with `--no-verify`.
6. **PR title & body** - Derive a title matching the PR-title convention and a body matching the PR-body convention (and template, if any); validate before submitting.
7. **Open the PR** - `gh pr create --base <base> --title "<title>" --body "<body>"`.
8. **Report** - Print the PR URL plus any repo-specific merge/release guidance from the conventions section.

## Guardrails
- Never merge the PR - opening it is the final step; the user merges.
- Never push to, or commit on, the default branch.
- Force-push only to complete a reword/rebase the user explicitly approved.
- Never use `--no-verify`.
