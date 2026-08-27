# Fix: `<Form>` re-renders the whole form on every validation error emission

## TL;DR

`FormErrorsNotification` reads react-hook-form's **root** `formState` proxy at render time. That single read permanently latches `control._proxyFormState.errors = 'all'`, which promotes *every* `errors` state emission into a full re-render of the component that owns `useForm()` — i.e. the entire form subtree. Because `FormErrorsNotification` is mounted unconditionally by every `<Form>` / `FormProvider`, **every form in every consuming app pays this**, on submit *and* on per-keystroke validation.

Fix by giving the component its own scoped subscription via `useFormState({ control })` (which uses `isRoot=false` and therefore does **not** escalate the root).

## Where

- **Primary bug:** `@acme/ui/src/components/form/_components/form-errors-notification.tsx:11`
  ```ts
  const formErrors = formContext?.form?.formState.errors;
  ```
- Mounted unconditionally at `@acme/ui/src/components/form/_components/form-root.tsx` (the `<FormErrorsNotification />` sibling inside `FormContext.Provider`).
- **Secondary read (same latch, lower blast radius):** `@acme/ui/src/components/form/hooks/use-form.ts:190`
  ```ts
  const errorFieldsAll = buildErrorFields(methods.formState.errors);
  ```
  This one sits inside the `validateFields` `useCallback`, so it only latches when `validateFields()` is actually called — but once called, the form is permanently escalated for the lifetime of that `control`.

## Why it matters (field evidence)

Measured on production `vyductan.dev/english`, clicking OK in the "Add Vocabulary" modal:

- INP total **404ms**, worst interaction = the modal footer OK button with **click / processingDuration = 264ms** (input delay and presentation delay were both fine — the cost is handler processing).
- `handleSubmit` in react-hook-form emits state 4 times: `{isSubmitting:true}` (1 key → no subscriber matches → no render), then `_subjects.state.next({errors:{}})` after `_runSchema()`, then `await onValid(...)`, then a final 5-key payload including `errors`.
- Only the two `errors`-bearing emissions match the root subscription — and they match **solely** because of the latched `errors === 'all'`. So the click contains **3 full-form renders instead of 1**.
- Both emissions are microtask continuations of the click on already-resolved promises (zod resolver, no I/O), and `window.event` is still the click, so React 19 resolves them to `DiscreteEventPriority` → `SyncLane` and flushes them *inside* the event dispatch — i.e. inside `processingDuration`. They are not a later task.

Beyond submit: because the latch is permanent and `setError` / `clearErrors` / onChange+onBlur validation all emit `errors`, this also inflates **typing latency** on every form.

## Mechanism (verified against react-hook-form 7.76.1 dist)

1. `use-form.ts` assigns `_formControl.current.formState = methods.formState`. `methods.formState` is built by `getProxyFormState(formState, control)` with `isRoot` defaulting to **true**.
2. `getProxyFormState` getter:
   ```js
   if (control._proxyFormState[key] !== 'all') control._proxyFormState[key] = !isRoot || 'all'
   ```
   → with `isRoot=true` this writes the string `'all'`, and never downgrades it.
3. `useForm()` subscribes with `{ formState: control._proxyFormState, reRenderRoot: true }`.
4. `shouldRenderFormState` renders the root when `_proxyFormState[key] === 'all'`.
5. `useFormState` deliberately passes `isRoot=false`, so it writes `true` instead of `'all'` — a *scoped* subscription that re-renders only the calling component. `@acme/ui/src/shadcn/form.tsx` and the Controllers already do this correctly; `_components/form-list.tsx` sidesteps it via the raw non-proxy `control._formState`.

So this one component defeats the scoping the rest of the form layer is built around.

## The fix

`useFormState({ control })` works **outside** `RHFormProvider` as long as `control` is passed explicitly, so the mount position in `form-root.tsx` does not need to change. Hooks can't run conditionally, so split the component in two: an outer guard that bails when there is no form, and an inner one that owns the hooks.

Rewrite `form-errors-notification.tsx`:

```tsx
import type { Control, FieldValues } from "react-hook-form";
import { useEffect } from "react";
import { useFormState } from "react-hook-form";
import { z } from "zod";

import { notification } from "../../notification";
import { useFormContext } from "../context";

const FormErrorsNotificationInner = ({
  control,
  schema,
}: {
  control: Control<FieldValues>;
  schema: unknown;
}) => {
  // useFormState uses isRoot=false, so it sets _proxyFormState.errors = true
  // (not 'all'). The root useForm() subscription therefore does NOT re-render
  // the whole form on every errors emission — only this component does, and it
  // renders nothing.
  const { errors } = useFormState({ control });

  useEffect(() => {
    if (!(schema instanceof z.ZodObject)) return;
    if (Object.keys(errors).length === 0) return;

    // control._fields is mutated in place, so read it here rather than
    // treating it as an effect dependency (its identity never changes).
    const mountedFields = new Set(Object.keys(control._fields));
    const unmountedRequiredFields = new Set(
      Object.keys(schema.shape).filter(
        (key) =>
          !(schema.shape[key] instanceof z.ZodOptional) &&
          !mountedFields.has(key),
      ),
    );

    const descriptions = Object.keys(errors)
      .filter((key) => unmountedRequiredFields.has(key))
      .map((key) => {
        const message = errors[key]?.message;
        return `${key}: ${typeof message === "string" ? message : ""}`;
      });

    if (descriptions.length > 0) {
      notification.error({
        message: "Unexpected Form Errors",
        description: descriptions,
        duration: Infinity,
        closeButton: true,
      });
    }
  }, [errors, control, schema]);

  return <></>;
};

export const FormErrorsNotification = () => {
  const formContext = useFormContext();
  const control = formContext?.form?.control;
  if (!control) return <></>;

  return (
    <FormErrorsNotificationInner
      control={control as Control<FieldValues>}
      schema={formContext?.form?.schema}
    />
  );
};
```

### Do NOT take the tempting shortcut

Swapping line 11 to `control._formState.errors` (mirroring `form-list.tsx:107`) compiles and removes the latch, but is **not** behaviour-preserving here: `_formState.errors` is mutated **in place** by `set`/`unset` on nearly every path, so its object identity is stable and the `useEffect` dependency would stop firing for `setError` / `clearErrors` / field validation. `form-list.tsx` only gets away with it because it re-renders for other reasons.

### Also fix the secondary read

`use-form.ts:190` — read the non-proxy state inside the callback so calling `validateFields()` doesn't escalate the form either:

```ts
const errorFieldsAll = buildErrorFields(methods.control._formState.errors);
```

(Identity doesn't matter here — it's read imperatively inside a callback, not used as a dependency.)

## Regression test

Add next to the existing `@acme/ui/src/components/form/field-wiring.test.tsx`:

```ts
it("does not escalate the root formState proxy to 'all'", () => {
  // render <Form form={form} schema={...}> with at least one Field, then:
  expect(form.control._proxyFormState.errors).not.toBe("all");
});
```

Worth adding a render-count assertion too: **one** submit should produce **one** root render, not three. That is the property that actually regressed, and a future `.formState.` read anywhere in `@acme/ui` would silently re-break every form in the app.

Run both vitest projects (`unit` + `storybook`) — `test` runs both.

## Verify

1. `pnpm typecheck` + both vitest projects.
2. Storybook: submit a form with a validation error, confirm the "Unexpected Form Errors" notification still appears for **unmounted required fields** (that's the component's actual purpose — easy to break while refactoring). Also confirm `setError` / `clearErrors` still trigger it.
3. React DevTools Profiler → "Record why each component rendered" → submit a form. Before: the `useForm()` owner shows 2 renders attributed to *Hook change* for the errors emissions. After: 0.
4. Chrome DevTools Performance, **CPU 4× throttle**, record a submit click, select the interaction in the Interactions track, read **Processing duration**, and count `commitRoot` flushes inside the click task. Should drop from 3 to 1.

## After merging — sync downstream

`@acme/ui` is vendored into consuming apps (e.g. `apps/vyductan.dev/@acme/ui`, nlabs apps). Sync this change downstream so they pick it up.

Downstream field check: `vyductan.dev` self-reports INP attribution to `/api/vitals`, surfacing in Vercel logs as `[web-vitals]` JSON lines with `target` + phase breakdown:

```bash
vercel logs <deployment-url> | grep '\[web-vitals\]'
```

Look for entries whose `target` is the modal footer button (`h-8 rounded-md bg-primary`) and confirm the click phase dropped from ~264ms.

## Out of scope (tracked separately, in the consuming app)

Not part of this fix, but the same 264ms interaction is also amplified app-side by an unmemoized `MeaningsManager` receiving fresh inline props — that belongs in `vyductan.dev`, not here.

## Ruled out — don't chase

- **`react-textarea-autosize` reflow.** `@acme/ui` `Textarea` only uses `TextareaAutosize` when the `autoSize` prop is passed; the affected form doesn't pass it, and the live DOM had exactly one `<textarea>`.
- **DOM size.** Measured live on the affected page with the modal open: 463 total nodes, depth 20. Sub-millisecond layout.
- **Zod / drizzle-zod resolver parse.** ~5-field object, resolves in a microtask with no I/O.
- **Inline `standardSchemaResolver(schema)` construction** at `use-form.ts:101` (not memoized). Real hygiene smell — wrap in `useMemo` while you're in the file — but it's O(1) at render time and contributes ~0ms to the click phase.
- **Network round-trip / `invalidateQueries` / modal close.** All fire from mutation `onSuccess` a full round-trip later — a different task, outside `processingDuration`.
