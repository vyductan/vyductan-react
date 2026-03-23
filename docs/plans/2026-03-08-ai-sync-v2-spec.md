# AI Sync v2 — Short Hybrid Spec

## 1. Goal
AI Sync v2 helps users safely sync shared folders like `@acme/` across multiple repos using a one-way file sync engine, while adding semantic review, reusable sync decisions, and better noise filtering.

## 2. Non-goals
- not a git merge replacement
- not a branch reconciliation tool
- not a general-purpose deployment system
- not responsible for generated artifacts unless explicitly requested

## 3. Core user problem
Users need to sync shared code from a primary workspace into one or more target repos, but current preview output contains too much noise and does not explain which diffs are meaningful, related, or safe to apply together.

## 4. Primary use cases
- sync `@acme/` from canonical repo to one target repo
- sync the same approved shared changes from primary to multiple targets
- review conflicts before overwrite
- preserve target-specific customizations where needed

## 5. Product behavior

### 5.1 Default flow
1. user selects:
   - primary path
   - target path(s)
   - sync scope
2. tool runs bidirectional dry-run
3. tool filters or de-prioritizes noise
4. tool groups meaningful diffs into:
   - single-file changes
   - related bundles
5. tool recommends one action per item:
   - Keep Primary
   - Keep Target
   - Manual Merge
   - Ignore
6. user approves selected actions
7. tool creates temporary backups
8. tool applies sync
9. tool verifies result
10. tool offers cleanup of backup artifacts

### 5.2 Multi-target flow
After approving a change set for target A, user can reuse the same decisions for target B and C, with automatic warnings when a target has extra drift that was not present in A.

## 6. Diff classification
Each differing path should be classified into one of:

- **runtime logic**
- **config/package**
- **storybook/docs**
- **generated/cache**
- **dependency install output**
- **backup/temp artifact**
- **unknown**

The UI should surface these labels directly in preview.

## 7. Noise filtering rules
By default, AI Sync v2 should suppress or de-prioritize:
- `.cache/`
- `.turbo/`
- `node_modules/`
- `.sync-backups/`
- `*.bak.*`
- lock/temp/generated outputs unless explicitly in scope

Users can toggle “show ignored noise”.

## 8. Related-file bundling
The engine should detect and recommend bundles such as:
- component + its types file
- config + package.json
- grouped internal refactors in same directory
- multi-file rename/refactor sets

Example:
- `select.tsx` + `select/types.ts` → one bundle
- `calendar/*` internal rename set → one bundle

## 9. Decision model
Each diff item stores:
- path or bundle ID
- classification
- recommended action
- confidence
- rationale
- whether safe to auto-apply
- whether decision can be reused across targets

## 10. Reusable sync memory
Approved decisions can be reused when:
- source file signatures are the same or compatible
- target diff pattern matches previous review

Example:
- “Keep Primary for calendar bundle”
- “Keep Target for local product page”
- “Ignore `.bak` files”

## 11. Safety requirements
- no destructive apply without confirmation
- always offer inspect-first mode
- always create rollback backup before overwrite
- never sync ignored backup/temp artifacts unless explicitly requested
- verify post-sync equality for approved files

## 12. Output requirements
For each run, the tool should generate:
- summary counts
- meaningful diff list
- grouped bundles
- recommended action table
- exact apply plan
- post-sync verification report

## 13. Success criteria
AI Sync v2 is successful if it:
- reduces noisy preview output
- correctly separates meaningful diffs from generated files
- helps users approve related file groups together
- lets users reuse previous decisions across repos
- keeps manual merge cases rare and explicit

## 14. MVP for v2
Must-have:
- noise filtering
- semantic diff labels
- related-file bundling
- recommendation table
- temporary backup + cleanup flow
- reusable decisions across targets

Can wait:
- full sync history UI
- team collaboration workflows
- git-aware PR automation
