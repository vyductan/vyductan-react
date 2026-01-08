---
description: Analyze git diffs and commit changes following Sentry conventions
---

1. Run `git status` to identify all modified, staged, and untracked files.
2. Group files logically by component, feature, or scope.
3. For each logical group:
   a. Run `git diff [files]` (or `git diff --cached [files]` if staged) to carefully analyze the changes.
   b. Identify the **Scope** of the change (e.g., specific component name, utility, configuration).
   c. Identify the **Type** of change based on Sentry/Conventional Commits:
   - `feat`: A new feature
   - `fix`: A bug fix
   - `chore`: Maintenance, build scripts, dependency updates (no production code change)
   - `refactor`: multiple code changes that neither fix a bug nor add a feature
   - `style`: Formatting, missing semi-colons, etc (no code change)
   - `test`: Adding missing tests or correcting existing tests
   - `perf`: A code change that improves performance
   - `ci`: Changes to CI configuration files and scripts
     d. Draft a **Subject** line:
   - Use imperative mood ("add" not "added").
   - No period at the end.
   - Concise and descriptive.
     e. Construct the commit message: `type(scope): subject`.
     f. Run `git add [files]` and `git commit -m "type(scope): subject"`.
4. If there are remaining files repeat step 3.
5. Verify all intended changes are committed with `git status`.
