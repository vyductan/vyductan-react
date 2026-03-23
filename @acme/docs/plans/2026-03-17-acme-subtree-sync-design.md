# ACME subtree sync skill design

## Goal
Create a Claude skill that synchronizes the source `@acme` repository with consumer repositories that embed it using `git subtree` with `--prefix @acme`, in both directions.

## Approved product decisions
- Use a single skill: `acme-subtree-sync`
- Use a hybrid interaction model:
  - interactive by default for safety
  - supports pre-supplied arguments for faster repeat use
- Support both configured repositories and ad-hoc repositories
- Default safety policy is block-by-default when the working tree is dirty or the branch is not the expected branch
- Do not auto-stash or auto-switch branches
- Do not push to remotes automatically unless the user explicitly asks

## Primary use cases
1. Push changes from the `@acme` repository into a consumer repository that vendors `@acme` as a subtree under the `@acme` prefix.
2. Pull changes made inside a consumer repository's `@acme` subtree back into the source `@acme` repository.
3. Reuse known consumer repository definitions from configuration while still allowing ad-hoc sync targets.

## High-level architecture
The skill will act as a workflow orchestrator rather than a thin command expander.

It will:
- resolve target repository information from either configuration or user-supplied values
- validate repository state before attempting subtree operations
- present a preview of the planned sync action
- require confirmation before mutating git state
- run the appropriate subtree workflow for the requested direction
- verify and summarize the resulting repository state

## Interaction model
### Modes
- **Configured mode**: choose a known consumer repository from a registry file in the `@acme` repository
- **Ad-hoc mode**: provide a local path and/or repository URL, branch, and optional remote name at runtime

### Actions
- **Push**: sync from `@acme` into a consumer repository's `@acme` subtree
- **Pull**: sync from a consumer repository's `@acme` subtree back into the `@acme` source repository
- **Analyze-only**: inspect subtree safety and divergence signals without mutating git state

### Hybrid behavior
The skill should default to an interactive flow, but if the user provides clear arguments such as target repository and direction up front, the skill should use them to reduce prompts while still preserving safety checks and confirmations.

## Detailed flow
### Push flow (`@acme` -> consumer)
1. Resolve the target repository from config or ad-hoc input.
2. Validate:
   - `@acme` is a git repo
   - target repository exists locally or can be prepared deliberately
   - expected branch exists
   - working trees are clean
   - subtree prefix is exactly `@acme`
   - remote URL matches config when applicable
3. Present a sync preview:
   - source repo and branch
   - target repo and branch
   - subtree prefix
   - planned git steps
4. After confirmation, run the subtree update workflow in the consumer repository.
5. Verify:
   - `git status`
   - changed files under `@acme/`
   - commit summary or diff summary

### Pull flow (consumer -> `@acme`)
1. Resolve the source consumer repository from config or ad-hoc input.
2. Validate:
   - consumer repository is clean
   - `@acme` repository is clean
   - current branches match expected branches
   - `@acme` subtree prefix exists in the consumer repository
   - there are relevant changes to import
3. Present a sync preview:
   - source consumer repo and branch
   - destination `@acme` repo and branch
   - subtree prefix being extracted
   - planned git steps
4. After confirmation, extract/apply the subtree changes back into `@acme`.
5. Verify:
   - `git status` in `@acme`
   - diff summary
   - commit summary
   - warnings if changes appear outside the subtree scope

## Safety policy
### Default behavior
Block by default when:
- either repository has a dirty working tree
- the current branch does not match the expected branch
- the prefix is missing or not exactly `@acme`
- repository or remote resolution is ambiguous

### Explicit non-goals
The skill should not:
- guess repository URLs when not configured or explicitly supplied
- silently overwrite local changes
- sync content outside the subtree prefix scope
- auto-stash or auto-switch branches
- auto-push to a remote without explicit user approval
- silently resolve merge conflicts

### Confirmation points
Require explicit confirmation before:
- cloning or otherwise preparing a new local copy of a consumer repository
- creating a temporary worktree
- running subtree commands that mutate git state
- creating commits if the workflow requires one
- pushing to a remote

## Configuration design
Add a dedicated configuration file in the `@acme` repository.

Recommended location:
- `.claude/acme-subtree-projects.json`

Reasoning:
- this is operational config for Claude workflows, not product documentation
- it keeps registry data close to the automation that consumes it
- it supports future extension without polluting user-facing docs

### Proposed schema
Each configured consumer repository entry should support:
- `name`
- `repoUrl`
- `localPath` (optional)
- `defaultBranch`
- `remoteName` (optional, default `origin`)

The subtree prefix should be treated as a skill invariant with the fixed value `@acme`, rather than per-project data.

Example target:
- `vyductan.dev`

## Error reporting
Failures should be actionable and specific.

The skill should report:
- which step failed
- which repository was involved
- what expectation was not met
- what the user should do next

Examples:
- Consumer repository has uncommitted changes; commit or stash them before syncing.
- Current branch is `feat/x`; expected `main`.
- Could not find subtree prefix `@acme` in the target repository.

## Implementation recommendation
Implement a single hybrid skill, `acme-subtree-sync`, backed by a repository registry config file and strict preflight validation. Optimize for correctness, reversibility, and clarity over automation aggressiveness.

## Follow-up design decision: divergence-aware analysis mode
The initial push attempt into `vyductan.dev` showed that some consumer repositories have significant subtree drift and local sync history, so a blind `git subtree pull --prefix=@acme ... --squash` is not always safe.

For the current implementation phase, keep the source of truth local-first and defer multi-machine/canonical-source design until later.

### New action: `analyze-only`
Add a non-mutating action that:
- resolves the configured or ad-hoc consumer repository
- validates branch, working tree, and prefix state
- inspects subtree-related history and sync metadata
- detects signs of divergence or manual sync history
- returns a recommendation instead of mutating git state

### Analyze-only output
The analysis result should preserve the existing assessment-style output and add strategy recommendation output.

The analysis result should include:
- resolved source and target repos
- source branch and target branch
- prefix status
- working tree status
- subtree metadata signals, if present
- notable `@acme`-related sync commits, if present
- an assessment such as:
  - `safe-for-subtree-pull`
  - `manual-strategy-required`
- strategy recommendation fields:
  - `Primary strategy`
  - `Fallback strategy`
  - `Strategy rationale`

### Decision for this phase
Implement a minimal patch rather than a larger redesign:
- keep local source repository usage
- add `analyze-only`
- detect diverged subtree history before recommending mutation
- add signal-to-strategy mapping for non-mutating next-step guidance
- avoid introducing canonical GitHub source modeling in this phase
- avoid implementing any repair or semi-automated mutation flow in this phase

### Strategy recommendation model
After `analyze-only` gathers read-only signals, it should normalize them into a small set of decision factors rather than jumping straight from evidence to a vague recommendation.

Recommended decision factors:
- working tree usable or not usable for future mutation
- subtree metadata present or absent
- manual sync history light or heavy
- `@acme` history light or heavy

These are intentionally implementation-level heuristics, not exact product-level counters. For this phase, the implementation should keep them qualitative but make them repeatable by grounding each label in observable examples from git history.

Examples:
- `manual sync history heavy` means multiple commit subjects or merge points that clearly reference `@acme`, `subtree`, or manual sync activity rather than a one-off sync commit
- `@acme history heavy` means the prefix has substantial repeated local history rather than a shallow or nearly linear subtree import history
- `signals are mixed` means at least one divergence signal is present, but the overall evidence does not yet clearly justify `manual-reconcile` as the primary recommendation

Signal-to-strategy mapping for this phase:
- if the working tree is not usable, keep the assessment read-only and recommend `inspect-full-history` first because mutation is blocked before any deeper sync decision
- if subtree metadata is absent, prefer `inspect-full-history` unless other signals already indicate long-lived divergence
- if subtree metadata is present and manual sync history is heavy, recommend `manual-reconcile`
- if manual sync history is heavy and `@acme` history is also heavy, recommend `manual-reconcile` with `replace-subtree-from-source` as the fallback
- if subtree metadata is absent and both manual sync history and `@acme` history are heavy, recommend `replace-subtree-from-source` as the stronger fallback-oriented recovery direction
- if signals are mixed or only mildly suspicious, recommend `inspect-full-history` before any future mutation

The skill should then return:
- an `Assessment`
- a `Primary strategy` when the assessment is `manual-strategy-required`
- a `Fallback strategy` when the assessment is `manual-strategy-required`
- concise strategy rationale grounded in the observed signals

If the assessment is `safe-for-subtree-pull`, the strategy fields may be omitted and the recommendation can remain a normal subtree pull recommendation rather than forcing a strategy label from the divergence catalog.

### Strategy catalog for this phase
Support recommendation of these non-executing strategy labels:

These strategy labels are recommendation outputs only. They are not executable modes, and they do not introduce any repair workflow in this phase.

1. `inspect-full-history`
   - use when divergence signals exist but are not yet strong enough to justify a more disruptive recommendation
   - purpose: tell the user to inspect history more deeply before any mutation

2. `manual-reconcile`
   - use when subtree metadata, manual sync history, or repeated `@acme/` history strongly suggest long-lived divergence
   - purpose: tell the user the repo likely needs deliberate manual reconciliation instead of a blind subtree pull

3. `replace-subtree-from-source`
   - use when standard subtree pull is no longer trustworthy and a future reset-from-source style recovery may be safer
   - purpose: describe a possible later recovery direction without authorizing or executing it in this phase

### Analysis result extension
Extend the current `analyze-only` result format to include:
- `Primary strategy: inspect-full-history|manual-reconcile|replace-subtree-from-source`
- `Fallback strategy: ...`
- `Strategy rationale: ...`

For diverged repositories like `vyductan.dev`, the expected result is likely:
- `Assessment: manual-strategy-required`
- `Primary strategy: manual-reconcile`
- `Fallback strategy: replace-subtree-from-source`

### Safety boundary for this phase
This phase remains read-only:
- `analyze-only` must never mutate git state
- `analyze-only` must never ask for mutation confirmation during the same flow
- strategy labels are recommendations only, not executable mode names
- recommendations must remain read-only guidance
- no repair, replacement, or reconciliation workflow is implemented yet

## Open implementation notes
These are intentionally deferred to implementation planning:
- exact argument syntax for fast-path usage
- whether the skill shells out directly or delegates some repository inspection to helper scripts
- whether temporary worktrees are preferred over direct use of existing local clones for ad-hoc repos
- how a future phase should support canonical GitHub source repos across multiple machines
- how a future phase should execute a chosen repair strategy after user approval
