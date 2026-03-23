# Button Link/Form demo partials Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert `Link as Button` and `Form Integration` into live Button docs sections using the same `demo/*.tsx` + `demo/*.mdx` partial pattern as the other examples.

**Architecture:** Keep `@acme/ui/src/components/button/button.mdx` as the page root and thin assembler. Add one `.tsx` demo and one `.mdx` partial for each of the two sections, then import and render those partials under `## Examples`. Extend the docs regression test first so the new pattern is locked before implementation.

**Tech Stack:** React 19, TypeScript, Next.js Link, MDX, Storybook 10, Vitest, PNPM workspace, `@acme/ui`

---

### Task 1: Extend the docs regression test for the two new partial-backed sections

**Files:**
- Modify: `@acme/ui/src/components/button/button.docs-config.test.ts`
- Reference: `@acme/ui/src/components/button/button.mdx`

**Step 1: Write the failing test**

Extend `buttonExampleInventory` so it includes the two new sections:

```ts
{
  heading: "Link as Button",
  sourcePath: "button/demo/link-as-button.tsx",
  partialImportPath: "./demo/link-as-button.mdx",
  partialComponentName: "LinkAsButtonExample",
},
{
  heading: "Form Integration",
  sourcePath: "button/demo/form-integration.tsx",
  partialImportPath: "./demo/form-integration.mdx",
  partialComponentName: "FormIntegrationExample",
},
```

Keep the existing test shape:
- assert `button.mdx` imports both new partials
- assert `button.mdx` renders both new partial components under `## Examples`
- assert each new partial contains `### <heading>` and a `ComponentSource` pointing at the matching `src`

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/button/button.docs-config.test.ts
```

Expected:
- FAIL because `button.mdx` and the new partial files do not exist yet

**Step 3: Do not modify implementation yet**

Leave production files unchanged. Keep the test red.

**Step 4: Re-run after implementation**

Run the same command after Tasks 2–3.

Expected:
- PASS

**Step 5: Commit**

```bash
git add @acme/ui/src/components/button/button.docs-config.test.ts
git commit -m "test: cover button link and form demo partials"
```

### Task 2: Create live demo files and MDX partials for Link as Button and Form Integration

**Files:**
- Create: `@acme/ui/src/components/button/demo/link-as-button.tsx`
- Create: `@acme/ui/src/components/button/demo/link-as-button.mdx`
- Create: `@acme/ui/src/components/button/demo/form-integration.tsx`
- Create: `@acme/ui/src/components/button/demo/form-integration.mdx`
- Reference: `@acme/ui/src/components/button/button.mdx`

**Step 1: Use the failing Task 1 test as the red state**

Do not touch `button.mdx` yet.

**Step 2: Run the targeted test and keep it red**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/button/button.docs-config.test.ts
```

Expected:
- FAIL because the parent docs file still does not import/render the new partials

**Step 3: Write the new demo implementations**

Create `link-as-button.tsx` with a minimal live demo:

```tsx
import Link from "next/link";

import { Button } from "@acme/ui/components/button";

export default function LinkAsButtonDemo() {
  return (
    <Button asChild>
      <Link href="/login">Login</Link>
    </Button>
  );
}
```

Create `form-integration.tsx` by adapting the current inline snippet into a minimal component:

```tsx
import { z } from "zod";

import { Button } from "@acme/ui/components/button";
import { Form, FormItem, useForm } from "@acme/ui/components/form";
import { Input } from "@acme/ui/components/input";

const formSchema = z.object({
  username: z.string().min(1, { message: "Please input your username!" }),
  password: z.string().min(1, { message: "Please input your password!" }),
});

export default function FormIntegrationDemo() {
  const form = useForm({
    schema: formSchema,
    defaultValues: {
      username: "",
      password: "",
    },
    onSubmit: (data) => {
      console.log("data", data);
    },
  });

  return (
    <Form form={form}>
      <FormItem name="username" control={form.control} label="Username">
        <Input />
      </FormItem>
      <FormItem name="password" control={form.control} label="Password">
        <Input.Password />
      </FormItem>
      <FormItem>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </FormItem>
    </Form>
  );
}
```

Create the two MDX partials in the same structure as the existing Button examples:

```mdx
import { ComponentSource } from "@acme/ui/components/mdx";
import LinkAsButtonDemo from "./link-as-button";

### Link as Button

Use the `asChild` prop when you want a semantic link that keeps Button styling.

<ComponentSource src="button/demo/link-as-button.tsx" __comp__={LinkAsButtonDemo} />
```

```mdx
import { ComponentSource } from "@acme/ui/components/mdx";
import FormIntegrationDemo from "./form-integration";

### Form Integration

Buttons can be used directly inside `FormItem` layouts for submit actions and other form flows.

<ComponentSource src="button/demo/form-integration.tsx" __comp__={FormIntegrationDemo} />
```

**Step 4: Re-run the targeted test**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/button/button.docs-config.test.ts
```

Expected:
- Still FAIL because `button.mdx` has not been rewired yet

**Step 5: Commit**

```bash
git add @acme/ui/src/components/button/demo/link-as-button.tsx @acme/ui/src/components/button/demo/link-as-button.mdx @acme/ui/src/components/button/demo/form-integration.tsx @acme/ui/src/components/button/demo/form-integration.mdx
git commit -m "docs: add button link and form demo partials"
```

### Task 3: Reassemble `button.mdx` so the two sections use the new partials

**Files:**
- Modify: `@acme/ui/src/components/button/button.mdx`
- Reference: `@acme/ui/src/components/button/demo/link-as-button.mdx`
- Reference: `@acme/ui/src/components/button/demo/form-integration.mdx`
- Reference: `@acme/ui/src/components/button/button.docs-config.test.ts`

**Step 1: Use the failing Task 1 test as the red state**

The docs regression should still be red when this task starts.

**Step 2: Run the targeted test to confirm the red state**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/button/button.docs-config.test.ts
```

Expected:
- FAIL because the parent docs file still has inline `Link as Button` and `Form Integration` code fences

**Step 3: Write minimal docs assembly implementation**

Add imports near the top of `button.mdx`:

```mdx
import LinkAsButtonExample from "./demo/link-as-button.mdx";
import FormIntegrationExample from "./demo/form-integration.mdx";
```

Then replace the inline sections with ordered partial renders under `## Examples`:

```mdx
<WithIconExample />

<LinkAsButtonExample />

<FormIntegrationExample />
```

Delete the old inline code fences completely. Do not leave duplicate headings or snippets behind.

**Step 4: Run the targeted test to verify it passes**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/button/button.docs-config.test.ts
```

Expected:
- PASS

**Step 5: Commit**

```bash
git add @acme/ui/src/components/button/button.mdx @acme/ui/src/components/button/button.docs-config.test.ts @acme/ui/src/components/button/demo/link-as-button.tsx @acme/ui/src/components/button/demo/link-as-button.mdx @acme/ui/src/components/button/demo/form-integration.tsx @acme/ui/src/components/button/demo/form-integration.mdx
git commit -m "docs: render button link and form sections as demos"
```

### Task 4: Verify the full Button docs page after the new sections are migrated

**Files:**
- Verify: `@acme/ui/src/components/button/button.mdx`
- Verify: `@acme/ui/src/components/button/button.docs-config.test.ts`
- Verify: `@acme/ui/src/components/button/button.story-structure.test.ts`
- Verify: `@acme/ui/src/components/button/demo/link-as-button.tsx`
- Verify: `@acme/ui/src/components/button/demo/link-as-button.mdx`
- Verify: `@acme/ui/src/components/button/demo/form-integration.tsx`
- Verify: `@acme/ui/src/components/button/demo/form-integration.mdx`

**Step 1: Run focused automated verification**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/button/button.docs-config.test.ts src/components/button/button.story-structure.test.ts
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui typecheck
```

Expected:
- PASS

**Step 2: Verify Storybook docs page**

Use:

```text
http://localhost:6008/?path=/docs/components-button--docs
```

Confirm:
- `Link as Button` renders as a live demo section
- `Form Integration` renders as a live demo section
- both sections follow the same pattern as the other Button example partials
- Button props still render as a table

**Step 3: Re-run final automated verification**

Run:

```bash
pnpm --dir "/Users/vyductan/Developer/vyductan/vyductan-react/@acme/ui" exec vitest run src/components/button/button.docs-config.test.ts src/components/button/button.story-structure.test.ts
pnpm -C "/Users/vyductan/Developer/vyductan/vyductan-react" -F @acme/ui typecheck
```

Expected:
- PASS

**Step 4: Commit**

```bash
git add @acme/ui/src/components/button/button.mdx @acme/ui/src/components/button/button.docs-config.test.ts @acme/ui/src/components/button/button.story-structure.test.ts @acme/ui/src/components/button/demo/link-as-button.tsx @acme/ui/src/components/button/demo/link-as-button.mdx @acme/ui/src/components/button/demo/form-integration.tsx @acme/ui/src/components/button/demo/form-integration.mdx
git commit -m "refactor: unify button link and form docs demos"
```
