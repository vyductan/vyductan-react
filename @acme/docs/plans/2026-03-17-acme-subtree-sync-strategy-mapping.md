# ACME Subtree Sync Strategy Mapping Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend `acme-subtree-sync` so `analyze-only` returns a concrete read-only strategy recommendation for diverged subtree consumers instead of only reporting `manual-strategy-required`.

**Architecture:** Keep the existing `analyze-only` workflow and add a small rule-based decision layer inside the skill text. The new layer should normalize observed divergence signals into a few decision factors, map them to a primary and fallback strategy, and extend the analysis result template without introducing any mutating workflow.

**Tech Stack:** Claude local skills, Markdown skill instructions, JSON eval definitions, read-only git inspection commands, Bash JSON validation.

---

### Task 1: Update the design doc with the approved strategy-mapping design

**Files:**
- Modify: `docs/plans/2026-03-17-acme-subtree-sync-design.md`

**Step 1: Read the approved design section**

Read the follow-up design section that currently describes `analyze-only` so you can extend it without rewriting unrelated decisions.

**Step 2: Write the failing expectation checklist**

Add these expectations to your scratch area before editing:
- `analyze-only` keeps assessment output
- `analyze-only` adds strategy recommendation output
- recommendations stay read-only
- no repair workflow is introduced in this phase

**Step 3: Add the approved design details**

Update the design doc to describe:
- signal-to-strategy mapping
- the decision factors:
  - working tree usable or not
  - subtree metadata present or absent
  - manual sync history light or heavy
  - `@acme/` history light or heavy
- the strategy catalog:
  - `inspect-full-history`
  - `manual-reconcile`
  - `replace-subtree-from-source`
- the safety boundary that this phase remains read-only

**Step 4: Re-read the edited section**

Read the updated lines and verify the design now clearly states:
- why strategy mapping exists
- which strategies are supported
- that they are recommendation labels only

**Step 5: Commit**

Do not commit yet.

---

### Task 2: Extend the skill contract for strategy recommendations

**Files:**
- Modify: `~/.claude/skills/acme-subtree-sync/SKILL.md`
- Reference: `docs/plans/2026-03-17-acme-subtree-sync-design.md`

**Step 1: Read the current analyze-only sections**

Read the `Analyze-Only Workflow`, `Divergence signals`, and `Analysis result` sections in `SKILL.md`.

**Step 2: Write the failing expectation checklist**

List the behavior that does not exist yet:
- analysis returns a primary strategy
- analysis returns a fallback strategy
- analysis explains why the strategy was chosen
- recommendations remain non-executing labels only

**Step 3: Add the minimal contract wording**

Update the skill so `analyze-only` explicitly says that after classifying safe vs diverged state it must also recommend a non-mutating next strategy.

Add wording that the strategy recommendation is advisory only and must not be treated as permission to mutate git state.

**Step 4: Extend the result template**

Update the template to include:

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
- Primary strategy: inspect-full-history|manual-reconcile|replace-subtree-from-source
- Fallback strategy: ...
- Strategy rationale: ...
- Recommended next step: ...
```

**Step 5: Re-read the edited section**

Read the updated skill section and verify the output contract is explicit and repeatable.

---

### Task 3: Add rule-based strategy mapping guidance

**Files:**
- Modify: `~/.claude/skills/acme-subtree-sync/SKILL.md`

**Step 1: Write the failing expectation checklist**

State the missing rule layer:
- divergence signals are collected but not normalized
- no mapping exists from signal combinations to strategy labels
- `manual-strategy-required` is too vague on its own

**Step 2: Add decision-factor normalization**

Document a small decision layer that tells Claude to summarize observed signals into factors such as:
- working tree usable for later mutation or not
- subtree metadata present or absent
- manual sync history light or heavy
- `@acme/` history light or heavy

**Step 3: Add strategy mapping rules**

Document rules like:
- If drift signals exist but remain limited or ambiguous, prefer `inspect-full-history`.
- If subtree metadata, heavy manual sync history, or repeated `@acme/` history strongly suggest long-lived divergence, prefer `manual-reconcile`.
- If standard subtree pull no longer looks trustworthy and a future reset-from-source workflow is more plausible, prefer `replace-subtree-from-source` as fallback or primary recommendation depending on severity.

**Step 4: Add explicit safety limits**

Document that:
- strategy labels are not action modes
- no repair workflow is implemented in this phase
- `analyze-only` must never ask for confirmation to execute a chosen strategy

**Step 5: Re-read the workflow and rules**

Read the edited sections and verify the mapping rules are concrete enough to drive consistent outputs without over-designing a scoring system.

---

### Task 4: Add eval coverage for strategy-mapping output

**Files:**
- Modify: `~/.claude/skills/acme-subtree-sync/evals/evals.json`

**Step 1: Read the current eval set**

Confirm the existing evals cover configured push, pull, ad-hoc use, dirty-tree refusal, and analyze-only divergence detection.

**Step 2: Write the failing eval case**

Add one new eval that expects strategy recommendation output, for example:

```json
{
  "id": 6,
  "prompt": "Analyze only whether vyductan.dev is safe for syncing @acme right now, and recommend the best next strategy without mutating git state.",
  "expected_output": "Claude should inspect subtree history, classify the repo as manual-strategy-required, and return a primary strategy such as manual-reconcile with a fallback strategy, without attempting any mutation.",
  "files": []
}
```

**Step 3: Validate the JSON**

Run:
```bash
python - <<'PY'
import json
json.load(open('/Users/vyductan/.claude/skills/acme-subtree-sync/evals/evals.json'))
print('ok')
PY
```

Expected: prints `ok`.

**Step 4: Re-read the file**

Read the updated eval entry and verify it clearly asks for both assessment and strategy recommendation.

**Step 5: Commit**

Do not commit yet.

---

### Task 5: Manually verify the new analysis output shape against vyductan.dev

**Files:**
- Verify: `~/.claude/skills/acme-subtree-sync/SKILL.md`
- Use: `.claude/acme-subtree-projects.json`
- Use: `/Users/vyductan/Developer/vyductan/vyductan.dev`

**Step 1: Re-read the existing analyze-only findings**

Review the previously observed signals for `vyductan.dev`:
- subtree metadata commits exist
- notable `@acme` sync history exists
- `@acme/` history is heavy enough to indicate divergence
- current recommendation baseline is `manual-strategy-required`

**Step 2: Run read-only verification commands again**

Run:
```bash
git -C "/Users/vyductan/Developer/vyductan/vyductan.dev" branch --show-current
git -C "/Users/vyductan/Developer/vyductan/vyductan.dev" status --short
git -C "/Users/vyductan/Developer/vyductan/vyductan.dev" log --grep='git-subtree-dir\|git-subtree-split\|git-subtree-mainline' --all --oneline -n 10
git -C "/Users/vyductan/Developer/vyductan/vyductan.dev" log --grep='@acme\|subtree\|merge @acme\|Acme' --all --oneline -n 20
```

Expected: read-only evidence still supports the same diverged classification.

**Step 3: Produce the expected analysis result manually**

Draft the expected output using the new template. For `vyductan.dev`, the expected shape is likely:
- `Assessment: manual-strategy-required`
- `Primary strategy: manual-reconcile`
- `Fallback strategy: replace-subtree-from-source`
- `Strategy rationale: subtree metadata plus heavy manual sync history indicate long-lived divergence`

**Step 4: Verify no mutation occurred**

Run:
```bash
git -C "/Users/vyductan/Developer/vyductan/vyductan.dev" status --short
git -C "/Users/vyductan/Developer/vyductan/vyductan-react/@acme" status --short
```

Expected: no new mutation introduced by this verification.

**Step 5: Commit**

Do not commit yet.

---

### Task 6: Final verification and review

**Files:**
- Verify: `~/.claude/skills/acme-subtree-sync/SKILL.md`
- Verify: `~/.claude/skills/acme-subtree-sync/evals/evals.json`
- Verify: `docs/plans/2026-03-17-acme-subtree-sync-design.md`
- Verify: `.claude/acme-subtree-projects.json`
- Verify: `~/.claude/skills/acme-subtree-sync/.skillfish.json`

**Step 1: Run JSON validation**

Run:
```bash
python - <<'PY'
import json
paths = [
    '/Users/vyductan/Developer/vyductan/vyductan-react/@acme/.claude/acme-subtree-projects.json',
    '/Users/vyductan/.claude/skills/acme-subtree-sync/.skillfish.json',
    '/Users/vyductan/.claude/skills/acme-subtree-sync/evals/evals.json',
]
for path in paths:
    json.load(open(path))
    print('ok', path)
PY
```

Expected: one `ok` line per file.

**Step 2: Read the final skill text**

Verify it now contains:
- `push`
- `pull`
- `analyze-only`
- divergence detection
- decision-factor normalization
- strategy mapping rules
- primary and fallback strategy output
- read-only safety boundary for recommendations

**Step 3: Review the manual vyductan.dev result against the new contract**

Ensure the manual expected result actually matches the rules added to the skill and does not invent any mutating next step.

**Step 4: Run code review**

Use the code-reviewer or review workflow available in this environment to review the updated skill wording and eval maintainability.

**Step 5: Commit**

If the user wants a commit afterward, keep repo-tracked docs separate from local `~/.claude/skills` files unless they explicitly want them bundled together.
