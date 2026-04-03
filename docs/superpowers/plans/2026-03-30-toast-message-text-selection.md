# Toast Message Text Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to drag-select and copy non-interactive text inside shared toasts/messages without changing the `message` API, toast positioning, auto-dismiss timing, or current toast styling.

**Architecture:** Keep the fix local to `@acme/ui/src/components/toast/toaster.tsx`. Sonner renders plain message text through the `[data-title]` slot, descriptions through `[data-description]`, and `toast.custom(...)` JSX inside the same `[data-title]` container, so a capture-phase guard at the shared `Toaster` boundary can cover plain messages, described toasts, and non-interactive custom-content descendants without touching `message.ts` or protected shadcn code. Stop pointer gestures before Sonner’s swipe-dismiss handlers only when they begin inside non-interactive descendants of `[data-title]` or `[data-description]`; let gestures from non-text toast surfaces and interactive controls continue through unchanged. Merge new selection-related `toastOptions.classNames` into the existing local defaults instead of overwriting them so the current success/error styling and any caller-supplied overrides still work.

**Tech Stack:** React, TypeScript, Sonner, Testing Library, Vitest, pnpm

---

## File Structure

### Existing files to modify
- `@acme/ui/src/components/toast/toaster.tsx`
  - Add a small DOM-target guard for “selectable text vs interactive/surface” decisions.
  - Wrap the local Sonner integration in a capture-phase pointer handler that blocks Sonner swipe setup only for selectable text targets.
  - Merge local `toastOptions.classNames` defaults with any incoming `props.toastOptions` instead of replacing them outright.

### Files to create
- `@acme/ui/src/components/toast/toaster.test.tsx`
  - Add focused unit tests that mock `@acme/ui/shadcn/sonner` and verify both the className merge behavior and the pointer-event boundary behavior.

### Existing files to inspect during implementation
- `docs/superpowers/specs/2026-03-30-toast-message-text-selection-design.md`
  - Approved scope and regression boundaries.
- `@acme/ui/src/shadcn/sonner.tsx`
  - Read-only reference for the protected shadcn integration surface. Do not edit it.
- `@acme/ui/package.json`
  - Source of the package-local test commands.
- `@acme/ui/vitest.config.ts`
  - Confirms the `unit` Vitest project for focused jsdom tests.
- `@acme/ui/src/components/message/message.stories.tsx`
  - Existing manual QA surfaces (`WithDescription`, `WithAction`, `CustomContent`) for final browser verification.

### Existing files that should remain unchanged
- `@acme/ui/src/components/message/message.ts`
  - Keep the current `top-center` defaults and public API unchanged.
- `@acme/ui/src/components/notification/notification.ts`
  - No notification API changes are needed.
- `@acme/ui/src/shadcn/sonner.tsx`
  - Protected path; treat as read-only.

This stays intentionally narrow. Do not turn this into a broader toast redesign, `message` API refactor, or Sonner vendoring change.

---

### Task 1: Add focused failing tests for toast text-selection boundaries

**Files:**
- Create: `@acme/ui/src/components/toast/toaster.test.tsx`
- Inspect: `docs/superpowers/specs/2026-03-30-toast-message-text-selection-design.md`
- Inspect: `@acme/ui/src/components/toast/toaster.tsx`
- Inspect: `@acme/ui/src/shadcn/sonner.tsx`
- Inspect: `@acme/ui/package.json`
- Inspect: `@acme/ui/vitest.config.ts`

- [ ] **Step 1: Re-read the approved spec and current toaster integration**

Read:
- `docs/superpowers/specs/2026-03-30-toast-message-text-selection-design.md`
- `@acme/ui/src/components/toast/toaster.tsx`
- `@acme/ui/src/shadcn/sonner.tsx`

Expected reminders:
- standard shared text slots are the in-scope selectable regions
- non-text surfaces must keep current swipe-dismiss behavior
- close/action controls must stay clickable
- `@acme/ui/src/shadcn/sonner.tsx` is protected and must not be edited
- the current local `Toaster` hardcodes `toastOptions.classNames` and does not yet guard pointer gestures for text selection

- [ ] **Step 2: Write the failing local toaster test file**

Create `@acme/ui/src/components/toast/toaster.test.tsx`.

Use a mocked `@acme/ui/shadcn/sonner` so the test stays local to the integration layer and never touches the protected file.

The test file should cover these behaviors:
1. local `title` and `description` classNames include `select-text`
2. existing local `closeButton`, `success`, and `error` classes are preserved
3. caller-supplied `toastOptions.classNames` are merged, not discarded
4. plain message text is covered because Sonner renders it through `[data-title]`
5. `pointerdown` from non-interactive descendants of `[data-title]` is stopped before the mocked Sonner toast root receives it
6. `pointerdown` from `[data-description]` is stopped before the mocked Sonner toast root receives it
7. `pointerdown` from a non-text surface still reaches the mocked Sonner toast root
8. `pointerdown` from action/close buttons still reaches the mocked Sonner toast root
9. `pointerdown` from non-interactive custom content nested inside `[data-title]` is also stopped before the mocked Sonner toast root receives it

Use a test shape equivalent to this:

```tsx
import React from "react";
import "@testing-library/jest-dom/vitest";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

const sonnerPointerDown = vi.fn();
let lastToastOptions: Record<string, any> | undefined;

vi.mock("@acme/ui/shadcn/sonner", async () => {
  const React = await import("react");

  const MockSonner = React.forwardRef<HTMLDivElement, any>(
    ({ className, toastOptions }, ref) => {
      lastToastOptions = toastOptions;

      return (
        <div ref={ref} data-testid="mock-sonner" className={className}>
          <div
            data-sonner-toast=""
            data-testid="toast-root"
            onPointerDown={sonnerPointerDown}
          >
            <div data-title="" data-testid="toast-title">
              Selectable title
              <span data-testid="toast-title-child">Nested plain message text</span>
              <div data-testid="toast-custom-text">Custom JSX text</div>
            </div>
            <div data-description="" data-testid="toast-description">
              Selectable description
            </div>
            <div data-testid="toast-surface-gap">Surface gap</div>
            <button data-button data-action data-testid="toast-action">
              Action
            </button>
            <button data-close-button data-testid="toast-close">
              Close
            </button>
          </div>
        </div>
      );
    },
  );

  return { Toaster: MockSonner };
});

import { Toaster } from "./toaster";

beforeEach(() => {
  sonnerPointerDown.mockClear();
  lastToastOptions = undefined;
});

describe("Toaster text selection integration", () => {
  test("merges local selection and styling classNames into toastOptions", () => {
    render(
      <Toaster
        toastOptions={{
          classNames: {
            success: "custom-success",
            title: "custom-title",
          },
        }}
      />,
    );

    expect(lastToastOptions?.classNames?.title).toContain("select-text");
    expect(lastToastOptions?.classNames?.title).toContain("custom-title");
    expect(lastToastOptions?.classNames?.description).toContain("select-text");
    expect(lastToastOptions?.classNames?.success).toContain("!bg-green-100");
    expect(lastToastOptions?.classNames?.success).toContain("custom-success");
    expect(lastToastOptions?.classNames?.error).toContain("!bg-red-100");
    expect(lastToastOptions?.classNames?.closeButton).toContain("-right-3.5");
  });

  test("blocks Sonner swipe setup when pointerdown starts on title text", () => {
    render(<Toaster />);

    fireEvent.pointerDown(screen.getByTestId("toast-title"), {
      button: 0,
      pointerId: 1,
    });

    expect(sonnerPointerDown).not.toHaveBeenCalled();
  });

  test("blocks Sonner swipe setup for nested plain message text inside the title slot", () => {
    render(<Toaster />);

    fireEvent.pointerDown(screen.getByTestId("toast-title-child"), {
      button: 0,
      pointerId: 1,
    });

    expect(sonnerPointerDown).not.toHaveBeenCalled();
  });

  test("blocks Sonner swipe setup for non-interactive custom JSX text inside the title slot", () => {
    render(<Toaster />);

    fireEvent.pointerDown(screen.getByTestId("toast-custom-text"), {
      button: 0,
      pointerId: 1,
    });

    expect(sonnerPointerDown).not.toHaveBeenCalled();
  });

  test("keeps Sonner swipe setup for non-text toast surface drags", () => {
    render(<Toaster />);

    fireEvent.pointerDown(screen.getByTestId("toast-surface-gap"), {
      button: 0,
      pointerId: 1,
    });

    expect(sonnerPointerDown).toHaveBeenCalledTimes(1);
  });

  test("keeps Sonner pointer handling for interactive controls", () => {
    render(<Toaster />);

    fireEvent.pointerDown(screen.getByTestId("toast-action"), {
      button: 0,
      pointerId: 1,
    });

    expect(sonnerPointerDown).toHaveBeenCalledTimes(1);
  });
});
```

Notes:
- Keep the test local to `toaster.tsx`; do not import or edit protected shadcn source.
- Do not add `message.ts` tests unless the `message` file actually needs to change.
- Add one short comment in the test file explaining that plain shared messages render through Sonner’s title slot, so the toaster integration tests are the authoritative automated coverage for `message.*` text-selection behavior.
- Keep the assertions focused on selection boundaries and className merging only.

- [ ] **Step 3: Run the focused toaster test file to verify it fails first**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run --project unit src/components/toast/toaster.test.tsx
```

Expected before implementation:
- FAIL
- at least the title/description selection tests should fail because the current toaster does not yet stop pointer propagation for text targets
- the className merge assertions should also fail because `title`/`description` selection classes are not yet added

- [ ] **Step 4: Commit the failing test baseline**

```bash
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" add @acme/ui/src/components/toast/toaster.test.tsx
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" commit -m "test: cover toast text selection boundaries"
```

If the working tree already contains unrelated staged changes, stage only the new toaster test file before committing.

---

### Task 2: Implement the local toaster selection guard

**Files:**
- Modify: `@acme/ui/src/components/toast/toaster.tsx`
- Test: `@acme/ui/src/components/toast/toaster.test.tsx`
- Inspect: `docs/superpowers/specs/2026-03-30-toast-message-text-selection-design.md`

- [ ] **Step 1: Re-read the local toaster file before editing**

Read: `@acme/ui/src/components/toast/toaster.tsx`

Expected findings:
- it currently renders `Sonner` directly
- it already applies `pointer-events-auto` and local success/error/closeButton class overrides
- it currently replaces `toastOptions` wholesale instead of merging caller-supplied values
- it does not yet distinguish selectable text targets from surface/control targets

- [ ] **Step 2: Implement the smallest local guard that satisfies the spec**

Edit `@acme/ui/src/components/toast/toaster.tsx`.

Implementation constraints:
- do not edit `@acme/ui/src/shadcn/sonner.tsx`
- do not edit `@acme/ui/src/components/message/message.ts`
- keep the current success/error/closeButton styling defaults
- merge those defaults with incoming `props.toastOptions?.classNames`
- add `select-text` to the standard shared text regions (`title`, `description`)
- treat plain message-only toasts as covered because Sonner renders them through the `title` slot
- allow non-interactive custom JSX text nested under the shared `title` slot to benefit from the same guard
- stop propagation only for pointer gestures that begin inside standard text regions and not inside interactive controls
- preserve Sonner behavior for non-text surfaces and buttons

A minimal implementation can follow this shape:

```tsx
"use client";

import { cn } from "@acme/ui/lib/utils";
import { Toaster as Sonner } from "@acme/ui/shadcn/sonner";

const SELECTABLE_TEXT_SELECTOR = "[data-title],[data-description]";
const INTERACTIVE_SELECTOR = [
  "button",
  "a",
  "input",
  "textarea",
  "select",
  '[role="button"]',
  '[role="link"]',
  "[contenteditable='true']",
  "[data-button]",
  "[data-action]",
  "[data-cancel]",
  "[data-close-button]",
].join(",");

function shouldBypassSwipeDismiss(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (!target.closest("[data-sonner-toast]")) {
    return false;
  }

  if (target.closest(INTERACTIVE_SELECTOR)) {
    return false;
  }

  return Boolean(target.closest(SELECTABLE_TEXT_SELECTOR));
}

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ className, toastOptions, ...props }: ToasterProps) => {
  const mergedToastOptions = {
    ...toastOptions,
    classNames: {
      ...toastOptions?.classNames,
      title: cn("select-text", toastOptions?.classNames?.title),
      description: cn("select-text", toastOptions?.classNames?.description),
      closeButton: cn(
        "-right-3.5 left-[unset]",
        toastOptions?.classNames?.closeButton,
      ),
      success: cn(
        "!bg-green-100 !text-green-500 !border-green-300",
        toastOptions?.classNames?.success,
      ),
      error: cn(
        "!bg-red-100 !text-red-500 !border-red-300",
        toastOptions?.classNames?.error,
      ),
    },
  };

  return (
    <div
      onPointerDownCapture={(event) => {
        if (shouldBypassSwipeDismiss(event.target)) {
          event.stopPropagation();
        }
      }}
    >
      <Sonner
        className={cn("pointer-events-auto", className)}
        toastOptions={mergedToastOptions}
        {...props}
      />
    </div>
  );
};
```

Notes:
- Keep the helper logic inside `toaster.tsx` unless the file becomes materially harder to read.
- `select-text` should be added only to the standard shared text regions, not to the action/close controls.
- Do not add a new public prop for this behavior.

- [ ] **Step 3: Re-read the edited toaster file before running tests**

Read: `@acme/ui/src/components/toast/toaster.tsx`

Confirm:
- the guard bypasses Sonner swipe setup for non-interactive descendants of `[data-title]` and `[data-description]`
- plain message-only toasts are covered through `[data-title]`
- non-interactive custom JSX nested inside `[data-title]` is also covered
- interactive selectors are explicitly excluded
- incoming `toastOptions.classNames` are merged, not replaced
- current `pointer-events-auto`, success/error styling, and closeButton positioning are still present
- no protected shadcn file was touched

- [ ] **Step 4: Run the focused toaster test file again**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run --project unit src/components/toast/toaster.test.tsx
```

Expected after implementation:
- PASS
- all pointer-boundary and className merge assertions in `toaster.test.tsx` pass

- [ ] **Step 5: Commit the implementation once the focused tests pass**

```bash
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" add @acme/ui/src/components/toast/toaster.tsx @acme/ui/src/components/toast/toaster.test.tsx
git -C "/Users/vyductan/Developer/vyductan/vyductan-react" commit -m "fix: allow selecting toast text"
```

If the repo still has unrelated staged changes, stage only these toaster files before committing.

---

### Task 3: Final verification and delivery handoff

**Files:**
- Inspect: `@acme/ui/src/components/toast/toaster.tsx`
- Inspect: `@acme/ui/src/components/toast/toaster.test.tsx`
- Inspect: `docs/superpowers/specs/2026-03-30-toast-message-text-selection-design.md`
- Inspect for manual QA only: `@acme/ui/src/components/message/message.stories.tsx`

- [ ] **Step 1: Run one final focused unit verification command**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run --project unit src/components/toast/toaster.test.tsx
```

Expected:
- PASS
- no new failures in the focused toaster test file

- [ ] **Step 2: Run manual browser verification against the existing message stories**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" storybook
```

Expected:
- Storybook starts successfully and prints a local URL (typically `http://localhost:6006/`)

Then manually verify these existing stories in `Components/Message`:
- `Default`
- `WithDescription`
- `WithAction`
- `CustomContent`

Manual checks:
- dragging across plain message text in `Default` selects text, confirming the shared title-slot path
- dragging across title/description text in `WithDescription` selects text
- copying selected text works normally
- dragging from a non-text toast surface still behaves like the current swipe-dismiss interaction
- action and close buttons still click normally
- success/error styling still matches the current shared overrides
- `CustomContent` remains visually and behaviorally intact; only its non-interactive text nested inside the shared title container is expected to be selectable

- [ ] **Step 3: Re-read the final source and test files for spec alignment**

Read:
- `@acme/ui/src/components/toast/toaster.tsx`
- `@acme/ui/src/components/toast/toaster.test.tsx`
- `docs/superpowers/specs/2026-03-30-toast-message-text-selection-design.md`

Confirm:
- `message.ts` was left unchanged
- `notification.ts` was left unchanged
- protected `@acme/ui/src/shadcn/sonner.tsx` was left unchanged
- the selectable regions are still limited to the standard shared text slots
- non-text surfaces and interactive controls still preserve Sonner behavior
- auto-dismiss timing behavior was not changed

- [ ] **Step 4: Prepare the implementation summary with evidence**

Summarize:
- which files were created or modified
- the exact DOM boundary rule used (non-interactive descendants of `[data-title]` / `[data-description]` are selectable; interactive controls are excluded)
- that plain shared messages are covered through Sonner’s title slot
- the focused Vitest command that passed
- the Storybook stories used for manual verification
- that no protected shadcn files or public toast/message APIs were changed

- [ ] **Step 5: Stop after verified delivery**

Do not:
- change `message.ts` defaults unless new evidence proves the toaster-only fix is insufficient
- disable swipe-dismiss globally
- broaden selection to all toast surfaces
- edit `@acme/ui/src/shadcn/sonner.tsx`
- touch unrelated files in the working tree
