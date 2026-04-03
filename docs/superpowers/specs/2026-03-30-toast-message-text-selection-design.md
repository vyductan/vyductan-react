# Toast/message text selection design

## Summary
Update the shared toast/message layer so users can drag to select and copy toast text across all `message` and toast variants. Keep the existing API, positioning, auto-dismiss behavior, close/action buttons, and current success/error styling unchanged.

## Context
In [message.ts](../../../../@acme/ui/src/components/message/message.ts), the shared `message` API is a thin wrapper around Sonner with `top-center` defaults. In [toaster.tsx](../../../../@acme/ui/src/components/toast/toaster.tsx), the shared `Toaster` applies global Sonner configuration and type styling.

The current bug is interaction-specific: double-clicking text inside a toast can select it, but drag selection does not work. Sonner's toast implementation handles pointer-driven swipe dismissal on the toast root, which competes with native browser text selection when the user clicks and drags. Because `@acme/ui/src/shadcn/` is protected read-only reference code, the fix must stay in the local toast integration layer rather than editing vendored shadcn code.

## Decision
- Keep the public API of `message` unchanged.
- Keep the current `top-center` defaults in `message.*` methods.
- Keep the current `Toaster` styling behavior, including the existing success and error class overrides.
- Make all visible non-interactive toast/message text selectable and copyable by drag across all toasts, not just specific variants.
- Treat the selectable region as the standard shared text slots: toast title, description, and plain message text rendered by the shared toast layer.
- Do not require action buttons, close buttons, icons, or other interactive controls to become selectable; those regions should remain primarily clickable.
- For custom toast JSX, only explicitly non-interactive text regions are in scope for drag selection support.
- Fix the issue in the shared `Toaster` integration layer so all callers benefit automatically.
- Prefer a targeted interaction fix that lets text-selection gestures win over swipe-dismiss when the gesture begins on selectable text regions.
- Preserve existing swipe-dismiss behavior for gestures that begin outside selectable text regions.
- Keep the current auto-dismiss timing unchanged even while text is selected or the pointer is down; selection support must not silently change toast lifetime behavior.
- Do not edit files under `@acme/ui/src/shadcn/`.

## Why this approach
This is the smallest change that fixes the user-facing bug at the shared integration point.

Compared with alternatives:
- CSS-only `user-select: text` updates are likely insufficient because Sonner also captures pointer/swipe interaction on the toast root.
- Disabling swipe dismissal globally would make selection easier, but it would also change toast behavior more than requested.
- Editing vendored shadcn integration code would violate the protected-path rule and make future updates harder.

## Scope boundaries
- No API changes to `message`, `toast`, or `Toaster` props.
- No changes to toast duration, position, colors, or rendering structure beyond what is needed for text selection.
- No redesign of toast visuals.
- No changes to unrelated consumers.

## Expected outcomes
- Users can click-and-drag to select toast/message text in standard shared text regions.
- Users can copy selected toast/message text normally.
- Double-click text selection continues to work.
- Dragging from selectable text regions selects text instead of accidentally dismissing the toast.
- Dragging from non-text toast surface areas keeps the current swipe-dismiss behavior.
- Close buttons and action buttons remain clickable.
- Existing `message.success`, `message.info`, `message.warning`, `message.error`, `message.loading`, `message.message`, and custom/promise flows continue to render through the same shared layer.

## Verification notes
At implementation time, verify these cases:
1. A basic text-only message can be drag-selected.
2. A toast with `description` can be drag-selected across title and description text.
3. Dragging from selectable text does not accidentally dismiss the toast.
4. Dragging from a non-text toast surface area still follows the existing swipe-dismiss behavior.
5. Action buttons remain clickable and do not get broken by the selection change.
6. Close buttons remain clickable.
7. Success and error toasts still use the current shared styling overrides.
8. Auto-dismiss timing remains unchanged.
9. No protected files under `@acme/ui/src/shadcn/` are modified.
