# ACME Subtree Sync Analyze-Only Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend the `acme-subtree-sync` skill with a non-mutating `analyze-only` mode that detects subtree drift and recommends whether mutation is safe.

**Architecture:** Keep the existing local-first source model and augment the skill instructions with a third action, `analyze-only`. The new mode should inspect git state and subtree-related history, report divergence signals, and return a recommendation such as `safe-for-subtree-pull` or `manual-strategy-required` without mutating git state.

**Tech Stack:** Claude local skills, Markdown skill instructions, JSON config, git history inspection commands, Bash verification commands.

---

### Task 1: Update the skill contract to add analyze-only mode

**Files:**
- Modify: `~/.claude/skills/acme-subtree-sync/SKILL.md`
- Reference: `docs/plans/2026-03-17-acme-subtree-sync-design.md`

**Step 1: Write the failing expectation checklist**

Write down the expected new behavior inside the skill draft area before editing the implementation sections:
- `analyze-only` is a first-class action beside `push` and `pull`
- `analyze-only` never mutates git state
- `analyze-only` can be used on configured or ad-hoc repos
- `analyze-only` returns an assessment and recommended next strategy

**Step 2: Read the existing action sections and identify whether the contract still matches the intended behavior**

Read the current `SKILL.md` and verify whether the action model clearly and consistently supports:
- `push`
- `pull`
- `analyze-only`

Expected: if the contract is incomplete, tighten the wording so the analyze-only behavior is explicit and consistent.

**Step 3: Add the minimal new action contract**

Update `SKILL.md` so the action model clearly supports:
- `push`
- `pull`
- `analyze-only`

Document that `analyze-only` is the preferred safe action when subtree drift is suspected.

**Step 4: Re-read the edited section**

Run a file read and verify the skill now exposes `analyze-only` clearly and unambiguously.

**Step 5: Commit**

Do not commit yet.

---

### Task 2: Add divergence-detection rules and analysis output format

**Files:**
- Modify: `~/.claude/skills/acme-subtree-sync/SKILL.md`

**Step 1: Write the failing expectation checklist**

List the new outputs that do not exist yet:
- subtree metadata signals
- notable `@acme` sync commits
- divergence assessment
- recommended next strategy

**Step 2: Confirm the current skill lacks this analysis output**

Read the current verification/reporting sections and verify they do not yet define these analyze-only outputs.

**Step 3: Add divergence signal rules**

Add instructions that the skill should look for evidence such as:
- subtree metadata commits (`git-subtree-dir`, `git-subtree-split`, `git-subtree-mainline`)
- manual sync or merge commit messages involving `@acme`
- large or repeated history under `@acme/`
- prior selected-sync/manual-sync workflows that imply drift

**Step 4: Add a fixed analysis result template**

Define a response structure like:

```md
## Analysis result
- Source repo: ...
- Source branch: ...
- Target repo: ...
- Target branch: ...
- Prefix: @acme
- Working tree status: clean|blocked|overridden
- Subtree metadata signals: ...
- Notable sync history: ...
- Assessment: safe-for-subtree-pull|manual-strategy-required
- Recommended next step: ...
```

**Step 5: Re-read and verify**

Read the updated section and confirm the output format is explicit enough for repeated use.

---

### Task 3: Add analyze-only workflow steps and safety behavior

**Files:**
- Modify: `~/.claude/skills/acme-subtree-sync/SKILL.md`

**Step 1: Write the failing expectation checklist**

State the missing workflow details to add:
- resolve repos
- run read-only preflight
- inspect history
- classify drift
- recommend strategy
- never ask for mutation confirmation unless the user later chooses a mutating action

**Step 2: Verify the current skill defines this end-to-end workflow clearly enough**

Read the workflow sections and confirm the analyze-only path is explicit, read-only, and distinct from `push` and `pull`.

**Step 3: Add the analyze-only steps**

Document the exact flow:
1. resolve source and target
2. validate repo existence, branch, and working tree state
3. inspect prefix existence
4. inspect subtree metadata and notable sync history
5. classify as safe or diverged
6. return recommendation without mutation

**Step 4: Add recommendation categories**

At minimum support:
- `safe-for-subtree-pull`
- `manual-strategy-required`

Optionally mention future strategy classes, but do not implement extra modes in this patch.

**Step 5: Re-read and verify**

Read the updated workflow section and ensure it clearly states no git mutation occurs in `analyze-only` mode.

---

### Task 4: Update config documentation to reflect current local-first source model

**Files:**
- Modify: `~/.claude/skills/acme-subtree-sync/SKILL.md`
- Modify: `docs/plans/2026-03-17-acme-subtree-sync-design.md`

**Step 1: Write the failing expectation checklist**

Capture the intended wording:
- source remains local-first in this phase
- consumer prefix is `@acme`
- multi-machine/canonical GitHub source modeling is deferred

**Step 2: Verify current wording is incomplete for this phase decision**

Read the config and overview sections and confirm they do not yet explicitly describe the local-first decision plus future deferral.

**Step 3: Add the minimal wording update**

Document that:
- the current phase uses the local source repository
- the consumer subtree path is `@acme`
- canonical GitHub source support is intentionally deferred

**Step 4: Re-read both files**

Verify the wording is consistent in both the skill and the design doc.

**Step 5: Commit**

Do not commit yet.

---

### Task 5: Add analyze-only eval coverage

**Files:**
- Modify: `~/.claude/skills/acme-subtree-sync/evals/evals.json`

**Step 1: Write the failing eval case**

Add a new eval prompt covering a diverged repo, for example:

```json
{
  "id": 5,
  "prompt": "Analyze only whether vyductan.dev is safe for syncing @acme right now. Do not mutate git state.",
  "expected_output": "Claude should inspect subtree history and return an assessment such as manual-strategy-required without attempting a subtree pull or other mutation.",
  "files": []
}
```

**Step 2: Validate the JSON still parses**

Run a JSON parser and confirm `evals.json` remains valid.

**Step 3: Review eval coverage**

Confirm the eval set now covers:
- configured push
- pull
- ad-hoc repo
- dirty working tree refusal
- analyze-only divergence detection

**Step 4: Re-read the file**

Verify the prompt and expected output are clear.

**Step 5: Commit**

Do not commit yet.

---

### Task 6: Manually test analyze-only with vyductan.dev

**Files:**
- Use: `~/.claude/skills/acme-subtree-sync/SKILL.md`
- Use: `.claude/acme-subtree-projects.json`
- Use: `/Users/vyductan/Developer/vyductan/vyductan.dev`

**Step 1: Run read-only preflight commands**

Run commands to confirm:
- target repo is a git repo
- target branch is `dev`
- source repo is available locally
- prefix `@acme` exists in the target repo
- working tree status is known

Expected: all commands succeed without changing repo state.

**Step 2: Run read-only history inspection commands**

Inspect:
- subtree metadata commits
- notable `@acme`-related sync commits
- `@acme/` history depth

Expected: evidence is gathered to classify the repo.

**Step 3: Produce the analysis result manually following the skill template**

Expected: `vyductan.dev` is likely classified as `manual-strategy-required` if divergence signals are present.

**Step 4: Verify no mutation occurred**

Run:
```bash
git -C "/Users/vyductan/Developer/vyductan/vyductan.dev" status --short
git -C "/Users/vyductan/Developer/vyductan/vyductan-react/@acme" status --short
```

Expected: no new mutation introduced by analyze-only testing.

**Step 5: Commit**

Do not commit yet.

---

### Task 7: Final verification and review

**Files:**
- Verify: `~/.claude/skills/acme-subtree-sync/SKILL.md`
- Verify: `~/.claude/skills/acme-subtree-sync/evals/evals.json`
- Verify: `docs/plans/2026-03-17-acme-subtree-sync-design.md`

**Step 1: Run JSON validation again**

Run a parser against:
- `.claude/acme-subtree-projects.json`
- `~/.claude/skills/acme-subtree-sync/.skillfish.json`
- `~/.claude/skills/acme-subtree-sync/evals/evals.json`

Expected: all parse successfully.

**Step 2: Read the final skill text**

Verify it now contains:
- `push`
- `pull`
- `analyze-only`
- divergence detection
- analysis result template
- local-first wording for this phase

**Step 3: Review the analyze-only test result against the skill**

Ensure the manual vyductan.dev analysis actually follows the updated skill contract.

**Step 4: Run code review if available**

Use a review pass to check the updated skill wording and maintainability.

**Step 5: Commit**

If you want to commit the repo-tracked docs/config afterward, use a focused commit. Keep local `~/.claude/skills` files separate from repo-tracked files unless you intentionally export/package them.
