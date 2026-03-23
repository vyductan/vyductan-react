# Form Password Error Story Design

**Goal:** Extend the shadcn form demo with a new `Password` field and add a Storybook variant that shows that field in an error state by default.

## Recommended approach

Add a real `password` field to `@acme/ui/src/components/form/demo/shadcn.tsx`, validated through the existing Zod + `react-hook-form` flow. Then update `@acme/ui/src/components/form/form.stories.tsx` to keep the current `Shadcn` story and add a second story that renders the same demo in a password-error scenario.

## Why this approach

- Keeps the error state honest by going through the real form validation path
- Avoids hardcoded visual-only errors that could drift from actual behavior
- Reuses the existing demo and story structure instead of duplicating form markup
- Preserves the current happy-path story while adding a focused error-state example

## Scope

- Add `password` to the shadcn form demo schema and defaults
- Render a new password field with label, input, description, and error message
- Allow the demo to start in a mode where password is invalid and visibly errored
- Add a second Storybook story for that scenario
- Keep changes limited to the form demo and its story file

## Design

### Demo changes

Update `@acme/ui/src/components/form/demo/shadcn.tsx` to:
- add `password` to the Zod schema with a simple validation rule such as minimum length
- add `password` to RHF `defaultValues`
- render a `Password` field near the username field
- optionally accept a small prop such as `initialMode` or `showPasswordError` so the same demo component can be reused for both normal and invalid Storybook variants
- initialize or trigger validation so the password error is visible in the error-state story without requiring manual interaction

### Story changes

Update `@acme/ui/src/components/form/form.stories.tsx` to:
- keep `Shadcn` as the default story
- add a second story such as `ShadcnWithPasswordError`
- render the same demo component with the prop/config that enables the initial password error state

### Error behavior

The password error should be real form validation output, not manually injected markup. The story should clearly show:
- `Password` label
- password input in invalid state
- `FieldError` visible for password on initial render in the error story

## Verification

After implementation, verify by:
- running `pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" typecheck`
- running `pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" storybook:build`
- confirming the default story still works and the error story is built successfully
