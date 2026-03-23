# Menu Sidebar Provider Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the Menu MDX demo so the vertical menu renders in Storybook/docs without throwing `useSidebar must be used within a SidebarProvider.`

**Architecture:** Keep the fix narrowly scoped to the menu demo used by `@acme/ui/src/components/menu/menu.mdx`. The demo component already renders the `Menu` in vertical mode, and vertical mode uses sidebar primitives internally via `MenuVertical` → `SidebarMenuButton`, so the correct fix is to wrap only that demo in `SidebarProvider` rather than changing global Storybook preview or unrelated stories.

**Tech Stack:** React, Storybook MDX docs, `@acme/ui` components, shadcn sidebar context, pnpm

---

### Task 1: Add a failing reproduction check

**Files:**
- Inspect: `@acme/ui/src/components/menu/menu.mdx`
- Inspect: `@acme/ui/src/components/menu/demo/nested.tsx`
- Inspect: `@acme/ui/src/components/menu/menu-vertical.tsx:141-160`
- Inspect: `@acme/ui/src/shadcn/sidebar.tsx:46-52`

**Step 1: Confirm the MDX page uses the nested demo**

Read `@acme/ui/src/components/menu/menu.mdx` and verify it renders:

```tsx
<ComponentSource src="menu/demo/nested.tsx" __comp__={NestedDemo} />
```

**Step 2: Confirm the nested demo renders vertical Menu**

Read `@acme/ui/src/components/menu/demo/nested.tsx` and verify it renders:

```tsx
<Menu className="w-64" mode="vertical" items={items} />
```

**Step 3: Confirm the provider requirement at the failing boundary**

Read `@acme/ui/src/components/menu/menu-vertical.tsx` and verify `SidebarMenuButton` is used for top-level and submenu entries.

Read `@acme/ui/src/shadcn/sidebar.tsx` and verify `useSidebar()` throws when no provider is present.

**Step 4: Run Storybook or docs reproduction to verify current failure**

Run from repo root:

```bash
pnpm -F @acme/ui storybook
```

Open the Menu docs page and verify the demo fails with:

```text
useSidebar must be used within a SidebarProvider.
```

**Step 5: Commit investigation notes only if you created a local scratch artifact**

Usually skip this step because no file should be changed yet.

---

### Task 2: Wrap only the nested Menu demo in SidebarProvider

**Files:**
- Modify: `@acme/ui/src/components/menu/demo/nested.tsx`
- Reference: `@acme/ui/src/components/sidebar/sidebar.stories.tsx:33-40`

**Step 1: Write the minimal failing expectation in plain language**

Before editing, state the intended behavior:

```text
The Menu MDX nested demo should render successfully in docs because the vertical menu's sidebar primitives receive SidebarProvider context.
```

**Step 2: Make the smallest implementation change**

Update `@acme/ui/src/components/menu/demo/nested.tsx` to import `SidebarProvider` and wrap only the demo output.

Target shape:

```tsx
import { SidebarProvider } from "@acme/ui/components/sidebar";

const App: React.FC = () => {
  return (
    <SidebarProvider>
      <Menu
        onSelect={(args) => {
          console.log("click", args);
        }}
        className="w-64"
        mode="vertical"
        items={items}
      />
    </SidebarProvider>
  );
};
```

If layout needs stabilization in docs, wrap the `Menu` in a simple width container inside `SidebarProvider`, but do not add extra styling unless necessary.

**Step 3: Do not change broader configuration**

Do not edit:
- `@acme/ui/.storybook/preview.tsx`
- `@acme/ui/src/components/menu/menu.mdx`
- unrelated sidebar or menu stories

**Step 4: Commit the scoped code change**

```bash
git add @acme/ui/src/components/menu/demo/nested.tsx
git commit -m "fix: wrap menu nested demo with sidebar provider"
```

---

### Task 3: Verify the fix in Storybook/docs

**Files:**
- Verify: `@acme/ui/src/components/menu/demo/nested.tsx`
- Verify visually via Storybook docs page for `@acme/ui/src/components/menu/menu.mdx`

**Step 1: Run the focused verification command**

Run from repo root:

```bash
pnpm -F @acme/ui storybook
```

**Step 2: Open the Menu docs page and verify expected behavior**

Verify:
- The Menu docs page loads.
- The nested demo renders.
- The `useSidebar must be used within a SidebarProvider.` error is gone.
- Nested menu interactions still work at a basic level.

**Step 3: Run any available lightweight package validation if needed**

If Storybook starts cleanly but you want a non-visual check, run one lightweight command from repo root:

```bash
pnpm -F @acme/ui typecheck
```

Expected: PASS.

Only run additional commands if the code change introduces obvious type or lint concerns.

**Step 4: If verification fails, stop and re-investigate**

Do not widen the fix to global preview immediately. First confirm whether:
- the MDX page renders a different demo than expected,
- another menu demo also uses `SidebarMenuButton`, or
- `Menu` vertical mode needs a container in addition to provider context.

**Step 5: Commit verification-safe final state**

```bash
git add @acme/ui/src/components/menu/demo/nested.tsx
git commit -m "fix: restore menu docs demo sidebar context"
```

Create only one commit total in practice; if you already committed in Task 2 and verification passes without further edits, skip this second commit.
