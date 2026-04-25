# AutoComplete Storybook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full Storybook package for `AutoComplete` that matches the `button` component pattern with stories, MDX docs, example source files, MDX partials, and regression tests.

**Architecture:** Keep all new Storybook assets colocated under `packages/ui/src/components/auto-complete/`. First add regression tests that define the required story/docs wiring, then add focused example components and MDX partials, then build the Storybook stories and docs page on top of those examples. Reuse the existing `AutoComplete` runtime component as-is unless a story reveals a blocking defect.

**Tech Stack:** Storybook 10, MDX docs, Vitest storybook project, React 19, TypeScript, pnpm

---

## File Structure

### Existing files to modify
- `packages/ui/src/components/auto-complete/AGENTS.md`
  - Expand the component map so future work points to the new stories, docs, examples, and tests.
- `packages/ui/src/components/auto-complete/index.ts`
  - Keep export surface unchanged unless a type import used by examples/docs must be re-exported.

### Existing files to inspect during implementation
- `packages/ui/src/components/auto-complete/auto-complete.tsx`
  - Source of truth for props and behavior to document.
- `packages/ui/src/components/button/button.stories.tsx`
  - Reference story organization and example reuse pattern.
- `packages/ui/src/components/button/button.mdx`
  - Reference docs structure and MDX partial imports.
- `packages/ui/src/components/button/button.story-structure.test.ts`
  - Reference story wiring regression test pattern.
- `packages/ui/src/components/button/button.docs-config.test.ts`
  - Reference docs wiring regression test pattern.
- `packages/ui/src/components/select/select.stories.tsx`
  - Reference interaction testing patterns for input/search/select behavior.
- `packages/ui/.storybook/main.ts`
  - Existing docs addon config verified by docs wiring test.

### Files to create
- `packages/ui/src/components/auto-complete/auto-complete.stories.tsx`
  - Storybook playground, visual stories, and interaction stories.
- `packages/ui/src/components/auto-complete/auto-complete.mdx`
  - Main docs page composed from MDX partials.
- `packages/ui/src/components/auto-complete/auto-complete.story-structure.test.ts`
  - Regression test that ensures visual stories reuse the example components.
- `packages/ui/src/components/auto-complete/auto-complete.docs-config.test.ts`
  - Regression test that ensures docs import the MDX partials and each partial points at a live example source file.
- `packages/ui/src/components/auto-complete/examples/basic.tsx`
- `packages/ui/src/components/auto-complete/examples/basic.mdx`
- `packages/ui/src/components/auto-complete/examples/combobox-mode.tsx`
- `packages/ui/src/components/auto-complete/examples/combobox-mode.mdx`
- `packages/ui/src/components/auto-complete/examples/input-mode.tsx`
- `packages/ui/src/components/auto-complete/examples/input-mode.mdx`
- `packages/ui/src/components/auto-complete/examples/allow-clear.tsx`
- `packages/ui/src/components/auto-complete/examples/allow-clear.mdx`
- `packages/ui/src/components/auto-complete/examples/disabled.tsx`
- `packages/ui/src/components/auto-complete/examples/disabled.mdx`
- `packages/ui/src/components/auto-complete/examples/loading.tsx`
- `packages/ui/src/components/auto-complete/examples/loading.mdx`
- `packages/ui/src/components/auto-complete/examples/custom-option-render.tsx`
- `packages/ui/src/components/auto-complete/examples/custom-option-render.mdx`
- `packages/ui/src/components/auto-complete/examples/search-filter.tsx`
- `packages/ui/src/components/auto-complete/examples/search-filter.mdx`
- `packages/ui/src/components/auto-complete/examples/dropdown-customization.tsx`
- `packages/ui/src/components/auto-complete/examples/dropdown-customization.mdx`

### Test commands to use
- `pnpm -F @acme/ui test -- --runInBand src/components/auto-complete/auto-complete.story-structure.test.ts`
- `pnpm -F @acme/ui test -- --runInBand src/components/auto-complete/auto-complete.docs-config.test.ts`
- `pnpm -F @acme/ui test -- --runInBand src/components/auto-complete/auto-complete.story-structure.test.ts src/components/auto-complete/auto-complete.docs-config.test.ts`

---

### Task 1: Add the failing story structure regression test

**Files:**
- Create: `packages/ui/src/components/auto-complete/auto-complete.story-structure.test.ts`
- Test: `packages/ui/src/components/auto-complete/auto-complete.story-structure.test.ts`

- [ ] **Step 1: Write the failing story structure test**

Create `packages/ui/src/components/auto-complete/auto-complete.story-structure.test.ts` with this exact content:

```ts
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";

const reusedVisualStories = [
  {
    importStatement:
      'import BasicDemo from "./examples/basic";',
    storyName: "BasicUsage",
    renderPattern: "render: () => <BasicDemo />",
  },
  {
    importStatement:
      'import ComboboxModeDemo from "./examples/combobox-mode";',
    storyName: "ComboboxMode",
    renderPattern: "render: () => <ComboboxModeDemo />",
  },
  {
    importStatement:
      'import InputModeDemo from "./examples/input-mode";',
    storyName: "InputMode",
    renderPattern: "render: () => <InputModeDemo />",
  },
  {
    importStatement:
      'import AllowClearDemo from "./examples/allow-clear";',
    storyName: "AllowClear",
    renderPattern: "render: () => <AllowClearDemo />",
  },
  {
    importStatement:
      'import DisabledDemo from "./examples/disabled";',
    storyName: "Disabled",
    renderPattern: "render: () => <DisabledDemo />",
  },
  {
    importStatement:
      'import LoadingDemo from "./examples/loading";',
    storyName: "Loading",
    renderPattern: "render: () => <LoadingDemo />",
  },
  {
    importStatement:
      'import CustomOptionRenderDemo from "./examples/custom-option-render";',
    storyName: "CustomOptionRender",
    renderPattern: "render: () => <CustomOptionRenderDemo />",
  },
  {
    importStatement:
      'import SearchFilterDemo from "./examples/search-filter";',
    storyName: "SearchFilter",
    renderPattern: "render: () => <SearchFilterDemo />",
  },
  {
    importStatement:
      'import DropdownCustomizationDemo from "./examples/dropdown-customization";',
    storyName: "DropdownCustomization",
    renderPattern: "render: () => <DropdownCustomizationDemo />",
  },
] as const;

test("auto-complete visual stories reuse shared example components", () => {
  const storiesSource = readFileSync(
    path.resolve(import.meta.dirname, "./auto-complete.stories.tsx"),
    "utf8",
  );

  for (const {
    importStatement,
    storyName,
    renderPattern,
  } of reusedVisualStories) {
    expect(storiesSource).toContain(importStatement);
    expect(storiesSource).toContain(`export const ${storyName}: Story = {`);
    expect(storiesSource).toContain(renderPattern);
  }
});
```

- [ ] **Step 2: Run the story structure test and verify it fails**

Run:

```bash
cd "/Users/vyductan/Developer/vyductan/vyductan-react" && pnpm -F @acme/ui test -- --runInBand src/components/auto-complete/auto-complete.story-structure.test.ts
```

Expected: FAIL because `auto-complete.stories.tsx` does not exist yet.

---

### Task 2: Add the failing docs wiring regression test

**Files:**
- Create: `packages/ui/src/components/auto-complete/auto-complete.docs-config.test.ts`
- Test: `packages/ui/src/components/auto-complete/auto-complete.docs-config.test.ts`

- [ ] **Step 1: Write the failing docs wiring test**

Create `packages/ui/src/components/auto-complete/auto-complete.docs-config.test.ts` with this exact content:

```ts
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const autoCompleteExampleInventory: ReadonlyArray<{
  heading: string;
  sourcePath: string;
  partialImportPath: string;
  partialComponentName: string;
}> = [
  {
    heading: "Basic Usage",
    sourcePath: "auto-complete/examples/basic.tsx",
    partialImportPath: "./examples/basic.mdx",
    partialComponentName: "BasicExample",
  },
  {
    heading: "Combobox Mode",
    sourcePath: "auto-complete/examples/combobox-mode.tsx",
    partialImportPath: "./examples/combobox-mode.mdx",
    partialComponentName: "ComboboxModeExample",
  },
  {
    heading: "Input Mode",
    sourcePath: "auto-complete/examples/input-mode.tsx",
    partialImportPath: "./examples/input-mode.mdx",
    partialComponentName: "InputModeExample",
  },
  {
    heading: "Allow Clear",
    sourcePath: "auto-complete/examples/allow-clear.tsx",
    partialImportPath: "./examples/allow-clear.mdx",
    partialComponentName: "AllowClearExample",
  },
  {
    heading: "Disabled State",
    sourcePath: "auto-complete/examples/disabled.tsx",
    partialImportPath: "./examples/disabled.mdx",
    partialComponentName: "DisabledExample",
  },
  {
    heading: "Loading State",
    sourcePath: "auto-complete/examples/loading.tsx",
    partialImportPath: "./examples/loading.mdx",
    partialComponentName: "LoadingExample",
  },
  {
    heading: "Custom Option Render",
    sourcePath: "auto-complete/examples/custom-option-render.tsx",
    partialImportPath: "./examples/custom-option-render.mdx",
    partialComponentName: "CustomOptionRenderExample",
  },
  {
    heading: "Search & Filter",
    sourcePath: "auto-complete/examples/search-filter.tsx",
    partialImportPath: "./examples/search-filter.mdx",
    partialComponentName: "SearchFilterExample",
  },
  {
    heading: "Dropdown Customization",
    sourcePath: "auto-complete/examples/dropdown-customization.tsx",
    partialImportPath: "./examples/dropdown-customization.mdx",
    partialComponentName: "DropdownCustomizationExample",
  },
] as const;

describe("AutoComplete docs Storybook config", () => {
  test("configures addon-docs with remark-gfm so markdown tables render as tables in MDX docs", () => {
    const configSource = readFileSync(
      path.resolve(import.meta.dirname, "../../../.storybook/main.ts"),
      "utf8",
    );

    expect(configSource).toContain('name: "@storybook/addon-docs"');
    expect(configSource).toContain("mdxPluginOptions");
    expect(configSource).toContain("remarkPlugins: [remarkGfm]");
  });

  test("does not keep addon-onboarding enabled after the workspace is already onboarded", () => {
    const configSource = readFileSync(
      path.resolve(import.meta.dirname, "../../../.storybook/main.ts"),
      "utf8",
    );

    expect(configSource).not.toContain('"@storybook/addon-onboarding"');
  });

  test("assembles example docs from examples MDX partials instead of raw markdown", () => {
    const docsSource = readFileSync(
      path.resolve(import.meta.dirname, "./auto-complete.mdx"),
      "utf8",
    );

    expect(docsSource).toContain("## Examples");
    expect(docsSource).not.toContain(
      'import ReactMarkdown from "react-markdown"',
    );
    expect(docsSource).not.toContain("?raw");

    for (const {
      partialImportPath,
      partialComponentName,
    } of autoCompleteExampleInventory) {
      expect(docsSource).toContain(
        `import ${partialComponentName} from "${partialImportPath}"`,
      );
      expect(docsSource).toMatch(
        new RegExp(String.raw`## Examples[\s\S]*?<${partialComponentName} ?/>`),
      );
    }
  });

  test("keeps the visual example sections wired to live ComponentSource examples through the MDX partials", () => {
    const docsSource = readFileSync(
      path.resolve(import.meta.dirname, "./auto-complete.mdx"),
      "utf8",
    );

    for (const {
      partialImportPath,
      partialComponentName,
    } of autoCompleteExampleInventory) {
      expect(docsSource).toContain(
        `import ${partialComponentName} from "${partialImportPath}"`,
      );
      expect(docsSource).toContain(`<${partialComponentName} />`);
    }

    for (const {
      heading,
      partialImportPath,
      sourcePath,
    } of autoCompleteExampleInventory) {
      const partialFilePath = path.resolve(
        import.meta.dirname,
        partialImportPath,
      );
      const legacyInlineSectionPattern = new RegExp(
        String.raw`### ${heading}[\s\S]*?(?=### |## API Reference|## Migration from Ant Design|$)`,
        "s",
      );

      expect(
        existsSync(partialFilePath),
        `Expected MDX partial for ${heading} at ${partialImportPath}`,
      ).toBe(true);
      expect(docsSource).not.toMatch(legacyInlineSectionPattern);

      const partialSource = readFileSync(partialFilePath, "utf8");

      expect(partialSource).toContain("ComponentSource");
      expect(partialSource).toContain(`### ${heading}`);
      expect(partialSource).toContain(`src="${sourcePath}"`);
      expect(partialSource).toMatch(
        new RegExp(
          String.raw`### ${heading}[\s\S]*?<ComponentSource[^>]*src="${sourcePath}"`,
          "s",
        ),
      );
    }
  });
});
```

- [ ] **Step 2: Run the docs wiring test and verify it fails**

Run:

```bash
cd "/Users/vyductan/Developer/vyductan/vyductan-react" && pnpm -F @acme/ui test -- --runInBand src/components/auto-complete/auto-complete.docs-config.test.ts
```

Expected: FAIL because `auto-complete.mdx` and the MDX partial files do not exist yet.

---

### Task 3: Create the example source files and MDX partials

**Files:**
- Create: `packages/ui/src/components/auto-complete/examples/basic.tsx`
- Create: `packages/ui/src/components/auto-complete/examples/basic.mdx`
- Create: `packages/ui/src/components/auto-complete/examples/combobox-mode.tsx`
- Create: `packages/ui/src/components/auto-complete/examples/combobox-mode.mdx`
- Create: `packages/ui/src/components/auto-complete/examples/input-mode.tsx`
- Create: `packages/ui/src/components/auto-complete/examples/input-mode.mdx`
- Create: `packages/ui/src/components/auto-complete/examples/allow-clear.tsx`
- Create: `packages/ui/src/components/auto-complete/examples/allow-clear.mdx`
- Create: `packages/ui/src/components/auto-complete/examples/disabled.tsx`
- Create: `packages/ui/src/components/auto-complete/examples/disabled.mdx`
- Create: `packages/ui/src/components/auto-complete/examples/loading.tsx`
- Create: `packages/ui/src/components/auto-complete/examples/loading.mdx`
- Create: `packages/ui/src/components/auto-complete/examples/custom-option-render.tsx`
- Create: `packages/ui/src/components/auto-complete/examples/custom-option-render.mdx`
- Create: `packages/ui/src/components/auto-complete/examples/search-filter.tsx`
- Create: `packages/ui/src/components/auto-complete/examples/search-filter.mdx`
- Create: `packages/ui/src/components/auto-complete/examples/dropdown-customization.tsx`
- Create: `packages/ui/src/components/auto-complete/examples/dropdown-customization.mdx`
- Test: `packages/ui/src/components/auto-complete/auto-complete.docs-config.test.ts`

- [ ] **Step 1: Create the shared options and example components**

Add the example TSX files with these component responsibilities and exact prop shapes:

```tsx
// basic.tsx
import { AutoComplete } from "@acme/ui/components/auto-complete";

const basicOptions = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
] as const;

const BasicDemo = () => (
  <div className="w-[280px]">
    <AutoComplete
      placeholder="Pick a fruit"
      options={[...basicOptions]}
      className="w-full"
    />
  </div>
);

export default BasicDemo;
```

```tsx
// combobox-mode.tsx
import { AutoComplete } from "@acme/ui/components/auto-complete";

const teamOptions = [
  { label: "Design", value: "design" },
  { label: "Engineering", value: "engineering" },
  { label: "Marketing", value: "marketing" },
] as const;

const ComboboxModeDemo = () => (
  <div className="w-[280px]">
    <AutoComplete
      mode="combobox"
      placeholder="Choose a team"
      options={[...teamOptions]}
      className="w-full"
      allowClear
    />
  </div>
);

export default ComboboxModeDemo;
```

```tsx
// input-mode.tsx
import { AutoComplete } from "@acme/ui/components/auto-complete";

const cityOptions = [
  { label: "Ho Chi Minh City", value: "hcm" },
  { label: "Ha Noi", value: "hn" },
  { label: "Da Nang", value: "dn" },
] as const;

const InputModeDemo = () => (
  <div className="w-[320px]">
    <AutoComplete
      mode="input"
      placeholder="Search a city"
      searchPlaceholder="Type to filter"
      options={[...cityOptions]}
      allowClear
    />
  </div>
);

export default InputModeDemo;
```

```tsx
// allow-clear.tsx
import * as React from "react";

import { AutoComplete } from "@acme/ui/components/auto-complete";

const assigneeOptions = [
  { label: "An", value: "an" },
  { label: "Binh", value: "binh" },
  { label: "Chi", value: "chi" },
] as const;

const AllowClearDemo = () => {
  const [value, setValue] = React.useState<string | undefined>("binh");

  return (
    <div className="space-y-2">
      <div className="w-[280px]">
        <AutoComplete
          placeholder="Assign owner"
          options={[...assigneeOptions]}
          value={value}
          onChange={setValue}
          allowClear
          className="w-full"
        />
      </div>
      <div data-testid="selected-value">{value ?? "empty"}</div>
    </div>
  );
};

export default AllowClearDemo;
```

```tsx
// disabled.tsx
import { AutoComplete } from "@acme/ui/components/auto-complete";

const statusOptions = [
  { label: "Backlog", value: "backlog" },
  { label: "In Progress", value: "in-progress" },
] as const;

const DisabledDemo = () => (
  <div className="flex w-[280px] flex-col gap-4">
    <AutoComplete
      placeholder="Disabled"
      options={[...statusOptions]}
      disabled
      className="w-full"
    />
    <AutoComplete
      placeholder="Disabled with value"
      options={[...statusOptions]}
      value="in-progress"
      disabled
      allowClear
      className="w-full"
    />
  </div>
);

export default DisabledDemo;
```

```tsx
// loading.tsx
import { AutoComplete } from "@acme/ui/components/auto-complete";

const loadingOptions = [
  { label: "Searching...", value: "searching" },
  { label: "Loading result", value: "loading-result" },
] as const;

const LoadingDemo = () => (
  <div className="flex w-[320px] flex-col gap-4">
    <AutoComplete
      placeholder="Loading combobox"
      options={[...loadingOptions]}
      loading
      className="w-full"
    />
    <AutoComplete
      mode="input"
      placeholder="Loading input"
      searchPlaceholder="Type to search"
      options={[...loadingOptions]}
      loading
    />
  </div>
);

export default LoadingDemo;
```

```tsx
// custom-option-render.tsx
import { AutoComplete } from "@acme/ui/components/auto-complete";

const repositoryOptions = [
  {
    label: "acme/ui",
    value: "ui",
    description: "Shared design system package",
    icon: "icon-[lucide--package]",
  },
  {
    label: "acme/www",
    value: "www",
    description: "Next.js application",
    icon: "icon-[lucide--globe]",
  },
] as const;

const CustomOptionRenderDemo = () => (
  <div className="w-[340px]">
    <AutoComplete
      placeholder="Choose a repository"
      options={[...repositoryOptions]}
      optionLabelProp="label"
      optionRender={{
        label: (option) => (
          <div className="flex flex-col text-left">
            <span className="font-medium">{String(option.label)}</span>
            <span className="text-muted-foreground text-xs">
              {String(option.description)}
            </span>
          </div>
        ),
      }}
      className="w-full"
    />
  </div>
);

export default CustomOptionRenderDemo;
```

```tsx
// search-filter.tsx
import * as React from "react";

import { AutoComplete, removeTones } from "@acme/ui/components/auto-complete/auto-complete";

const searchOptions = [
  { label: "Cà phê sữa", value: "cafe-sua" },
  { label: "Bánh mì", value: "banh-mi" },
  { label: "Phở bò", value: "pho-bo" },
] as const;

const SearchFilterDemo = () => {
  const [search, setSearch] = React.useState("");

  return (
    <div className="space-y-2">
      <div className="w-[320px]">
        <AutoComplete
          mode="input"
          placeholder="Search menu items"
          searchPlaceholder="Type to filter"
          options={[...searchOptions]}
          onSearchChange={setSearch}
          filter={(value, query) => {
            const option = searchOptions.find((item) => item.value === value);
            if (!option) return 0;
            return removeTones(String(option.label).toLowerCase()).includes(
              removeTones(query.toLowerCase()),
            )
              ? 1
              : 0;
          }}
        />
      </div>
      <div data-testid="search-value">{search || "empty"}</div>
    </div>
  );
};

export default SearchFilterDemo;
```

```tsx
// dropdown-customization.tsx
import { Button } from "@acme/ui/components/button";
import { AutoComplete } from "@acme/ui/components/auto-complete";

const serviceOptions = [
  { label: "Email", value: "email" },
  { label: "Push", value: "push" },
  { label: "SMS", value: "sms" },
] as const;

const DropdownCustomizationDemo = () => (
  <div className="w-[340px]">
    <AutoComplete
      placeholder="Select a service"
      options={[...serviceOptions]}
      dropdownFooter={
        <div className="border-border border-t p-2">
          <Button variant="text" className="w-full justify-start px-2">
            Create service
          </Button>
        </div>
      }
      className="w-full"
    />
  </div>
);

export default DropdownCustomizationDemo;
```

Expected: each example is a focused, standalone live demo with width constraints appropriate for Storybook docs.

- [ ] **Step 2: Create the MDX partials that point at the live example sources**

For each example, create a matching MDX partial using this pattern:

```mdx
import { ComponentSource } from "@acme/ui/components/mdx";

import BasicDemo from "./basic";

### Basic Usage

Start with the default combobox experience when users need to choose from a short list.

<ComponentSource src="auto-complete/examples/basic.tsx" __comp__={BasicDemo} />
```

Use the same exact structure for the rest of the partials with these headings and import/component names:
- `combobox-mode.mdx` → `Combobox Mode` → `ComboboxModeDemo` → `src="auto-complete/examples/combobox-mode.tsx"`
- `input-mode.mdx` → `Input Mode` → `InputModeDemo` → `src="auto-complete/examples/input-mode.tsx"`
- `allow-clear.mdx` → `Allow Clear` → `AllowClearDemo` → `src="auto-complete/examples/allow-clear.tsx"`
- `disabled.mdx` → `Disabled State` → `DisabledDemo` → `src="auto-complete/examples/disabled.tsx"`
- `loading.mdx` → `Loading State` → `LoadingDemo` → `src="auto-complete/examples/loading.tsx"`
- `custom-option-render.mdx` → `Custom Option Render` → `CustomOptionRenderDemo` → `src="auto-complete/examples/custom-option-render.tsx"`
- `search-filter.mdx` → `Search & Filter` → `SearchFilterDemo` → `src="auto-complete/examples/search-filter.tsx"`
- `dropdown-customization.mdx` → `Dropdown Customization` → `DropdownCustomizationDemo` → `src="auto-complete/examples/dropdown-customization.tsx"`

Expected: every docs section is backed by `ComponentSource` instead of inline markdown code.

- [ ] **Step 3: Run the docs wiring test and verify it passes after adding the partials**

Run:

```bash
cd "/Users/vyductan/Developer/vyductan/vyductan-react" && pnpm -F @acme/ui test -- --runInBand src/components/auto-complete/auto-complete.docs-config.test.ts
```

Expected: may still FAIL because `auto-complete.mdx` is not created yet. If so, continue to Task 4 before re-running.

---

### Task 4: Build the docs page and story file

**Files:**
- Create: `packages/ui/src/components/auto-complete/auto-complete.mdx`
- Create: `packages/ui/src/components/auto-complete/auto-complete.stories.tsx`
- Modify: `packages/ui/src/components/auto-complete/AGENTS.md`
- Test: `packages/ui/src/components/auto-complete/auto-complete.story-structure.test.ts`
- Test: `packages/ui/src/components/auto-complete/auto-complete.docs-config.test.ts`

- [ ] **Step 1: Create `auto-complete.mdx`**

Write `packages/ui/src/components/auto-complete/auto-complete.mdx` with this structure:

```mdx
import AllowClearExample from "./examples/allow-clear.mdx";
import BasicExample from "./examples/basic.mdx";
import ComboboxModeExample from "./examples/combobox-mode.mdx";
import CustomOptionRenderExample from "./examples/custom-option-render.mdx";
import DisabledExample from "./examples/disabled.mdx";
import DropdownCustomizationExample from "./examples/dropdown-customization.mdx";
import InputModeExample from "./examples/input-mode.mdx";
import LoadingExample from "./examples/loading.mdx";
import SearchFilterExample from "./examples/search-filter.mdx";

# AutoComplete

AutoComplete helps users search or choose from a known set of options while keeping the input compact.

## Features

- **Two trigger modes** — `combobox` for button-style selection and `input` for free typing with suggestions
- **Search assistance** — built-in filtering plus custom `filter` logic
- **State feedback** — supports `allowClear`, `loading`, and `disabled`
- **Custom rendering** — support for `optionLabelProp`, `optionRender`, and dropdown composition
- **Composable dropdown** — use footer and dropdown render slots to extend the menu

## Modes

- `combobox` uses the button trigger and is best when users pick one known option.
- `input` uses the text input trigger and is best when users type first and confirm from suggestions.

## Examples

<BasicExample />

<ComboboxModeExample />

<InputModeExample />

<AllowClearExample />

<DisabledExample />

<LoadingExample />

<CustomOptionRenderExample />

<SearchFilterExample />

<DropdownCustomizationExample />

## API Reference

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `mode` | `"combobox" \| "input"` | `"combobox"` | Chooses between button trigger mode and text input trigger mode. |
| `value` | `string \| number` | - | Controlled selected option value. |
| `defaultValue` | `string \| number` | - | Initial selected option value for uncontrolled usage. |
| `options` | `OptionType[]` | - | Options available to render and select. |
| `optionsToSearch` | `{ value: string; label: string }[]` | - | Alternative search dataset when display and search data differ. |
| `optionLabelProp` | `string` | - | Field used as the label when syncing selected text. |
| `allowClear` | `boolean` | `false` | Shows a clear affordance for removing the current value. |
| `loading` | `boolean` | `false` | Shows a loading indicator in the trigger. |
| `disabled` | `boolean` | `false` | Disables interaction. |
| `placeholder` | `string` | - | Placeholder shown when no value is selected. |
| `searchPlaceholder` | `string` | - | Placeholder used by the search field inside the dropdown. |
| `filter` | `(value, search, option?) => number` | built-in accent-insensitive label matcher | Filters options during search. |
| `optionRender` | `{ label?, icon? }` | - | Customizes how each selected option label or icon is rendered. |
| `dropdownRender` | `(menu) => React.ReactNode` | - | Customizes the dropdown body around the menu. |
| `dropdownFooter` | `React.ReactNode` | - | Appends footer content below the options list. |
| `onChange` | `(value?, option?) => void` | - | Called when the selection changes. |
| `onOpenChange` | `(open: boolean) => void` | - | Called when the popover open state changes. |
| `onSearchChange` | `(search: string) => void` | - | Called when the search text changes. |
```

Expected: docs page imports all partials, has an examples section, and documents the key props without introducing raw markdown code embeds.

- [ ] **Step 2: Create `auto-complete.stories.tsx`**

Write `packages/ui/src/components/auto-complete/auto-complete.stories.tsx` with these exact story groups and names:

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { AutoComplete } from "./auto-complete";
import AllowClearDemo from "./examples/allow-clear";
import BasicDemo from "./examples/basic";
import ComboboxModeDemo from "./examples/combobox-mode";
import CustomOptionRenderDemo from "./examples/custom-option-render";
import DisabledDemo from "./examples/disabled";
import DropdownCustomizationDemo from "./examples/dropdown-customization";
import InputModeDemo from "./examples/input-mode";
import LoadingDemo from "./examples/loading";
import SearchFilterDemo from "./examples/search-filter";

const storyOptions = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
] as const;

const meta = {
  title: "Components/AutoComplete",
  component: AutoComplete,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    mode: {
      control: "radio",
      options: ["combobox", "input"],
    },
    size: {
      control: "radio",
      options: ["small", "middle", "large"],
    },
    disabled: {
      control: "boolean",
    },
    loading: {
      control: "boolean",
    },
    allowClear: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof AutoComplete>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Pick a fruit",
    options: [...storyOptions],
    className: "w-[280px]",
    allowClear: true,
  },
};

export const BasicUsage: Story = {
  render: () => <BasicDemo />,
};

export const ComboboxMode: Story = {
  render: () => <ComboboxModeDemo />,
};

export const InputMode: Story = {
  render: () => <InputModeDemo />,
};

export const AllowClear: Story = {
  render: () => <AllowClearDemo />,
};

export const Disabled: Story = {
  render: () => <DisabledDemo />,
};

export const Loading: Story = {
  render: () => <LoadingDemo />,
};

export const CustomOptionRender: Story = {
  render: () => <CustomOptionRenderDemo />,
};

export const SearchFilter: Story = {
  render: () => <SearchFilterDemo />,
};

export const DropdownCustomization: Story = {
  render: () => <DropdownCustomizationDemo />,
};

export const InteractionSelectOption: Story = {
  args: {
    placeholder: "Pick a fruit",
    options: [...storyOptions],
    className: "w-[280px]",
    onChange: fn(),
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("open the combobox and select Banana", async () => {
      const trigger = canvas.getByRole("combobox");
      await userEvent.click(trigger);

      const option = within(document.body).getByText("Banana");
      await userEvent.click(option);

      await waitFor(async () => {
        await expect(args.onChange).toHaveBeenCalledWith(
          "banana",
          expect.objectContaining({ label: "Banana", value: "banana" }),
        );
      });
    });
  },
};

export const InteractionClearValue: Story = {
  render: () => {
    const [value, setValue] = React.useState<string | undefined>("banana");

    return (
      <div className="space-y-2">
        <div className="w-[280px]">
          <AutoComplete
            placeholder="Pick a fruit"
            options={[...storyOptions]}
            value={value}
            onChange={setValue}
            allowClear
            className="w-full"
          />
        </div>
        <div data-testid="selected-value">{value ?? "empty"}</div>
      </div>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("clear the current value", async () => {
      const clearButton = canvasElement.querySelector(
        '[role="button"][icon="icon-[ant-design--close-circle-filled]"]',
      );

      if (!(clearButton instanceof HTMLElement)) {
        throw new TypeError("Clear button not found");
      }

      await userEvent.click(clearButton);

      await waitFor(async () => {
        await expect(canvas.getByTestId("selected-value")).toHaveTextContent(
          "empty",
        );
      });
    });
  },
};

export const InteractionInputSearch: Story = {
  render: () => {
    const [search, setSearch] = React.useState("");

    return (
      <div className="space-y-2">
        <div className="w-[320px]">
          <AutoComplete
            mode="input"
            placeholder="Search a city"
            searchPlaceholder="Type to filter"
            options={[
              { label: "Ho Chi Minh City", value: "hcm" },
              { label: "Ha Noi", value: "hn" },
              { label: "Da Nang", value: "dn" },
            ]}
            onSearchChange={setSearch}
            allowClear
          />
        </div>
        <div data-testid="search-value">{search || "empty"}</div>
      </div>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("type into input mode and confirm search callback state", async () => {
      const input = canvas.getByPlaceholderText("Search a city");
      await userEvent.type(input, "Ha");

      await waitFor(async () => {
        await expect(canvas.getByTestId("search-value")).toHaveTextContent("Ha");
      });

      await expect(within(document.body).getByText("Ha Noi")).toBeTruthy();
    });
  },
};
```

If the clear-button selector above does not match the rendered DOM, replace only the selector with the smallest DOM query that reliably targets the clear icon in Storybook and keep the rest of the story behavior unchanged.

Expected: story file matches the visual story reuse pattern and covers the key interactions.

- [ ] **Step 3: Update `AGENTS.md` with the new Storybook map**

Extend `packages/ui/src/components/auto-complete/AGENTS.md` so the file table includes:
- `auto-complete.stories.tsx` — viewing examples and interaction tests
- `auto-complete.mdx` — docs page and API reference
- `auto-complete.story-structure.test.ts` — story wiring regression test
- `auto-complete.docs-config.test.ts` — docs wiring regression test
- `examples/` — live Storybook docs examples

Expected: future readers discover the new docs surface from the local agent guide.

- [ ] **Step 4: Run the story structure and docs wiring tests and verify they pass**

Run:

```bash
cd "/Users/vyductan/Developer/vyductan/vyductan-react" && pnpm -F @acme/ui test -- --runInBand src/components/auto-complete/auto-complete.story-structure.test.ts src/components/auto-complete/auto-complete.docs-config.test.ts
```

Expected: PASS for both tests.

---

### Task 5: Final verification and handoff

**Files:**
- Inspect: `packages/ui/src/components/auto-complete/auto-complete.stories.tsx`
- Inspect: `packages/ui/src/components/auto-complete/auto-complete.mdx`
- Inspect: `packages/ui/src/components/auto-complete/examples/*.tsx`
- Inspect: `packages/ui/src/components/auto-complete/examples/*.mdx`
- Inspect: `packages/ui/src/components/auto-complete/auto-complete.story-structure.test.ts`
- Inspect: `packages/ui/src/components/auto-complete/auto-complete.docs-config.test.ts`
- Test: combined targeted Storybook Vitest run from Task 4

- [ ] **Step 1: Re-read the created files against the spec**

Check that the final file set covers every requirement from `docs/superpowers/specs/2026-04-07-auto-complete-storybook-design.md`:
- stories
- main docs page
- separate example source files
- separate MDX partials
- story structure regression test
- docs wiring regression test
- both `combobox` and `input` modes
- clear, disabled, loading, custom render, search/filter, and dropdown customization coverage

Expected: every spec item maps to a created file or passing test.

- [ ] **Step 2: Prepare the completion summary**

Summarize:
- created Storybook files
- created example files
- created regression tests
- the exact test command that passed
- any runtime defect discovered while implementing stories

Expected: concise implementation handoff with references to the new files.
