# ACME Subtree Sync Skill Implementation Plan

> **For Claude:** Prefer `superpowers:executing-plans` to implement this plan task-by-task when that skill is available. Otherwise, execute the tasks directly in order with the same verification discipline.

**Goal:** Build a Claude skill that safely synchronizes the `@acme` repository with consumer repositories that use `git subtree --prefix @acme`, supporting both push and pull workflows.

**Architecture:** Implement one local Claude skill, `acme-subtree-sync`, backed by a JSON registry of known consumer repositories. The skill should guide an interactive-by-default workflow, support pre-supplied arguments, perform strict git preflight checks, preview the planned sync action, and only run subtree mutations after explicit confirmation.

**Tech Stack:** Claude local skills, Markdown skill instructions, JSON configuration, git subtree, Bash, Python helper scripts only if needed for deterministic validation.

---

### Task 1: Create the skill workspace

**Files:**
- Create: `~/.claude/skills/acme-subtree-sync/SKILL.md`
- Create: `~/.claude/skills/acme-subtree-sync/.skillfish.json`
- Create: `.claude/acme-subtree-projects.json`

**Step 1: Create the skill directory structure**

Run:
```bash
ls -la "/Users/vyductan/.claude/skills"
mkdir -p "/Users/vyductan/.claude/skills/acme-subtree-sync"
ls -la "/Users/vyductan/.claude/skills/acme-subtree-sync"
```
Expected: the new skill directory exists and is empty.

**Step 2: Create the initial registry file**

Write a minimal JSON file at `@acme/.claude/acme-subtree-projects.json` with this exact starting structure:

```json
{
  "version": 1,
  "projects": [
    {
      "name": "vyductan.dev",
      "repoUrl": "https://github.com/vyductan/vyductan.dev",
      "localPath": null,
      "defaultBranch": "main",
      "remoteName": "origin"
    }
  ]
}
```

**Step 3: Create the skill manifest marker**

Write `.skillfish.json` with a minimal valid object:

```json
{
  "version": 1
}
```

**Step 4: Verify created files**

Run:
```bash
ls -la "/Users/vyductan/.claude/skills/acme-subtree-sync"
cat "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/.claude/acme-subtree-projects.json"
```
Expected: both files exist and the JSON is valid by inspection.

**Step 5: Commit**

Do not commit yet. This plan batches commits after tested logical chunks.

---

### Task 2: Draft the skill frontmatter and trigger description

**Files:**
- Modify: `~/.claude/skills/acme-subtree-sync/SKILL.md`
- Reference: `/Users/vyductan/.claude/skills/skill-lookup/SKILL.md:1-77`

**Step 1: Write the SKILL.md frontmatter**

Start the file with exact frontmatter like:

```md
---
name: acme-subtree-sync
description: >
  Synchronize the @acme repository with consumer repositories that vendor it using git subtree under the @acme prefix. Use this whenever the user wants to push @acme changes into a consumer project, pull changes back from a consumer project's @acme subtree into the source repository, maintain subtree sync workflows, or work with repositories like vyductan.dev that embed @acme with --prefix @acme. Prefer this skill even if the user only says "sync @acme" or describes updating a vendored @acme copy.
---
```

**Step 2: Add a short overview section**

Include:
- what the skill does
- when to use it
- that it is hybrid: interactive by default, args-aware when the user already supplied enough detail

**Step 3: State non-negotiable safety rules**

List the approved defaults:
- block on dirty working tree
- block on wrong branch
- no auto-stash
- no auto-switch branch
- no auto-push
- require confirmation before mutating git state

**Step 4: Read back the file**

Run:
```bash
sed -n '1,120p' "/Users/vyductan/.claude/skills/acme-subtree-sync/SKILL.md"
```
Expected: frontmatter is present and the description is explicit enough to trigger reliably.

**Step 5: Commit**

Do not commit yet.

---

### Task 3: Write the configured and ad-hoc resolution flow

**Files:**
- Modify: `~/.claude/skills/acme-subtree-sync/SKILL.md`
- Reference: `.claude/acme-subtree-projects.json`

**Step 1: Add repository resolution instructions**

Document the exact order:
1. If the user names a configured project, load it from `@acme/.claude/acme-subtree-projects.json`
2. Otherwise, collect ad-hoc values: local path and/or repo URL, branch, remote name
3. Never guess a repo URL
4. Default prefix must always be `@acme`

**Step 2: Add missing-data prompts**

Specify that the skill should ask only for unresolved values and should not re-ask for values already provided by the user.

**Step 3: Add target summary output format**

Define a fixed preview structure like:

```md
## Sync plan
- Direction: push|pull
- Source repo: ...
- Source branch: ...
- Target repo: ...
- Target branch: ...
- Prefix: @acme
- Remote: ...
```

**Step 4: Verify the instructions read clearly**

Read the updated section and ensure it distinguishes configured vs ad-hoc workflows with no ambiguity.

**Step 5: Commit**

Do not commit yet.

---

### Task 4: Write the preflight validation checklist

**Files:**
- Modify: `~/.claude/skills/acme-subtree-sync/SKILL.md`

**Step 1: Add the validation checklist**

Include checks for:
- repository path exists
- repository is a git repo
- current branch matches expected branch
- working tree is clean
- prefix exists when required
- remote URL matches configured URL when config exists

**Step 2: Add exact command guidance**

Include the expected commands the skill should prefer, such as:

```bash
git status --short
git branch --show-current
git remote get-url origin
git rev-parse --is-inside-work-tree
```

Also mention that subtree-related commands should only run after successful preflight.

**Step 3: Add fail-fast behavior**

Document that any failed check must stop the workflow and return an actionable explanation instead of attempting recovery automatically.

**Step 4: Add user-facing failure message patterns**

Provide short examples for dirty tree, branch mismatch, missing prefix, and ambiguous repo resolution.

**Step 5: Commit**

Do not commit yet.

---

### Task 5: Write the push workflow in the skill

**Files:**
- Modify: `~/.claude/skills/acme-subtree-sync/SKILL.md`

**Step 1: Document push prerequisites**

State that push means syncing from the source `@acme` repo into the consumer repo's `@acme` subtree.

**Step 2: Add the push execution sequence**

Document the exact workflow the skill should follow:
1. resolve consumer repo
2. validate both repos
3. show sync preview
4. ask for confirmation before mutation
5. run the subtree update workflow in the consumer repo
6. run verification commands

Do not over-specify one exact git command unless you have verified it during implementation; keep the plan at the workflow level if command details are still open.

**Step 3: Add push verification output**

Require:
- `git status`
- diff summary scoped to `@acme/`
- changed file summary
- commit summary if created

**Step 4: Add push refusal rules**

Refuse to proceed if:
- consumer repo is dirty
- `@acme` repo is dirty
- branch mismatch exists
- prefix is not `@acme`

**Step 5: Commit**

Do not commit yet.

---

### Task 6: Write the pull workflow in the skill

**Files:**
- Modify: `~/.claude/skills/acme-subtree-sync/SKILL.md`

**Step 1: Document pull prerequisites**

State that pull means extracting changes from a consumer repo's `@acme` subtree and applying them back to the source `@acme` repo.

**Step 2: Add the pull execution sequence**

Document the exact workflow the skill should follow:
1. resolve consumer repo
2. validate both repos
3. show sync preview
4. ask for confirmation before mutation
5. extract/apply subtree changes into `@acme`
6. run verification commands in `@acme`

**Step 3: Add pull scope guardrails**

Require the skill to warn or stop if the detected changes are outside the subtree scope or if the prefix cannot be validated.

**Step 4: Add pull verification output**

Require:
- `git status` in `@acme`
- diff summary
- commit summary if created
- explicit warning if non-prefix changes appear involved

**Step 5: Commit**

Do not commit yet.

---

### Task 7: Add helper scripts only if deterministic parsing is needed

**Files:**
- Optional create: `~/.claude/skills/acme-subtree-sync/scripts/validate_registry.py`
- Optional create: `~/.claude/skills/acme-subtree-sync/scripts/resolve_project.py`
- Modify: `~/.claude/skills/acme-subtree-sync/SKILL.md`

**Step 1: Try to keep the skill script-free first**

Prefer plain skill instructions unless deterministic parsing becomes awkward or repetitive.

**Step 2: If needed, add one tiny helper at a time**

Examples:
- validate registry JSON schema
- resolve configured project by name and print normalized fields

**Step 3: If a helper script is added, document exactly when to use it**

Add a brief “Use helper scripts only for deterministic registry parsing” section to `SKILL.md`.

**Step 4: Verify helper behavior**

Run the helper against the registry file and confirm it returns clean structured output.

**Step 5: Commit**

Commit only if helper scripts were actually added and verified.

---

### Task 8: Create eval prompts for the skill

**Files:**
- Create: `~/.claude/skills/acme-subtree-sync/evals/evals.json`

**Step 1: Write 3 realistic eval prompts**

Use this exact JSON shape:

```json
{
  "skill_name": "acme-subtree-sync",
  "evals": [
    {
      "id": 1,
      "prompt": "Sync @acme to vyductan.dev on main using the configured subtree project.",
      "expected_output": "Claude should resolve the configured repo, perform preflight checks, preview the sync, and request confirmation before mutating git state.",
      "files": []
    },
    {
      "id": 2,
      "prompt": "Pull changes from a local clone of vyductan.dev back into the source @acme repo. The project uses git subtree with --prefix @acme.",
      "expected_output": "Claude should choose the pull workflow, validate both repos, protect against dirty trees, and summarize verification steps.",
      "files": []
    },
    {
      "id": 3,
      "prompt": "I need to sync @acme into an ad-hoc repo that vendors it under @acme, but the repo is not in config yet.",
      "expected_output": "Claude should use the ad-hoc workflow, ask only for missing repo details, avoid guessing URLs, and keep the operation blocked until preflight passes.",
      "files": []
    }
  ]
}
```

**Step 2: Review the prompts manually**

Make sure they cover:
- configured push
- configured or local pull
- ad-hoc resolution

**Step 3: Optionally expand to a dirty-working-tree scenario**

If needed, add a fourth eval for failure-mode behavior.

**Step 4: Save and validate JSON**

Run a JSON validator command or load the file in a parser.

**Step 5: Commit**

Do not commit yet.

---

### Task 9: Run the first qualitative skill check

**Files:**
- Use: `~/.claude/skills/acme-subtree-sync/**`
- Use: `/Users/vyductan/.claude/plugins/cache/claude-plugins-official/skill-creator/205b6e0b3036/skills/skill-creator/**`

**Step 1: Snapshot the initial skill**

Copy the skill folder into a workspace directory for iteration 1 comparison.

**Step 2: Run with-skill and baseline executions for the eval prompts**

Follow the skill-creator workflow:
- run each eval with the skill
- run the same eval without the skill as baseline
- save outputs into iteration directories

**Step 3: Draft lightweight assertions while runs execute**

Focus on objective checks such as:
- asks for confirmation before mutation
- does not guess repo URL in ad-hoc mode
- blocks on dirty tree scenarios

**Step 4: Generate the reviewer output**

Use the skill-creator eval viewer workflow to prepare human review artifacts.

**Step 5: Review and iterate**

Tighten the trigger description and workflow wording based on failures or weak outputs.

---

### Task 10: Verify installation and package the finished skill

**Files:**
- Verify: `~/.claude/skills/acme-subtree-sync/SKILL.md`
- Verify: `~/.claude/skills/acme-subtree-sync/evals/evals.json`
- Verify: `.claude/acme-subtree-projects.json`

**Step 1: Verify the skill is discoverable locally**

Check that the skill folder and `SKILL.md` exist in `~/.claude/skills/acme-subtree-sync/`.

**Step 2: Verify the registry and eval files exist**

Read both files and confirm they match the intended workflows.

**Step 3: Run a final manual trigger sanity check**

Try at least these prompts mentally or via local evaluation:
- “sync @acme to vyductan.dev”
- “pull subtree changes from vyductan.dev back to @acme”
- “sync @acme to a repo not in config yet”

Expected: each prompt strongly suggests this skill should trigger.

**Step 4: Package if desired**

If packaging is wanted later, use the skill-creator packaging flow after the content stabilizes.

**Step 5: Commit**

Create a focused commit after verification:

```bash
git add \
  "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/.claude/acme-subtree-projects.json" \
  "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/docs/plans/2026-03-17-acme-subtree-sync-design.md" \
  "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/docs/plans/2026-03-17-acme-subtree-sync.md"
git commit -m "$(cat <<'EOF'
Add plan for @acme subtree sync skill.
EOF
)"
```

Make a separate commit for files under `~/.claude/skills` only if you intentionally want to track or export them elsewhere; they are not part of this git repository.
