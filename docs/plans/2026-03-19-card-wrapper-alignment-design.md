# Card Wrapper Alignment Design

**Date:** 2026-03-19

## Goal
Align the local Card wrapper behavior more closely with shadcn/reference spacing while preserving the repo’s existing Card API, including `size` support.

## Context
- The read-only shadcn reference at `@acme/ui/src/shadcn/card.tsx` keeps `CardAction` as `row-span-2` and does not add `flex-1` to `CardTitle`.
- The local wrapper at `@acme/ui/src/components/card/_components/index.tsx` adds `flex-1` to `CardTitle` and overrides `CardAction` with `row-span-1`, which changes header layout behavior.
- The external reference at `/Users/vyductan/Developer/vyductan/refs/ui/apps/v4/examples/radix/ui/card.tsx` also supports a `size` prop and confirms the shadcn-like `CardAction` grid behavior.
- The local Card already has `size` support wired through `CardRoot`, `CardHeader`, `CardContent`, and `CardFooter`.

## Chosen Approach
Update only the local Card wrapper abstractions to remove the layout overrides that drift from shadcn, while keeping and lightly refining the existing `size` support rather than replacing the whole component with the reference implementation.

### Why this approach
- Fixes the actual source of header spacing drift.
- Keeps public API compatibility.
- Minimizes blast radius compared with porting the entire reference styling model.

## Planned Changes
- In `@acme/ui/src/components/card/_components/index.tsx`:
  - remove `flex-1` from `CardTitle`
  - remove the `row-span-1` override from `CardAction`
  - review existing `size === "small"` class adjustments and keep them only where they still make sense
- Keep `@acme/ui/src/shadcn/card.tsx` untouched because it is protected read-only reference code.
- Re-verify `WithAction` and other Card stories via typecheck and Storybook usage.

## Non-goals
- Do not rewrite the Card component to fully match the external reference visual system.
- Do not edit files under `@acme/ui/src/shadcn/`.
- Do not introduce a new public Card API.

## Verification
- Run fresh typecheck from workspace root:
  - `pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui typecheck`
- Optionally inspect the existing Card stories, especially `WithAction`, in Storybook after the wrapper changes.
