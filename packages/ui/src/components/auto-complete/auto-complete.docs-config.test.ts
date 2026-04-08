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
    heading: "Numeric Values",
    sourcePath: "auto-complete/examples/numeric-values.tsx",
    partialImportPath: "./examples/numeric-values.mdx",
    partialComponentName: "NumericValuesExample",
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
  const storybookConfigFilePath = path.resolve(
    import.meta.dirname,
    "../../../.storybook/main.ts",
  );
  const docsFilePath = path.resolve(import.meta.dirname, "./auto-complete.mdx");

  function readUtf8(filePath: string): string {
    return readFileSync(filePath, "utf8");
  }

  test("configures addon-docs with remark-gfm so markdown tables render as tables in MDX docs", () => {
    const configSource = readUtf8(storybookConfigFilePath);

    expect(configSource).toContain('name: "@storybook/addon-docs"');
    expect(configSource).toContain("mdxPluginOptions");
    expect(configSource).toContain("remarkPlugins: [remarkGfm]");
  });

  test("marks examples MDX partials as templates so Storybook does not index them as standalone sidebar entries", () => {
    for (const { partialImportPath } of autoCompleteExampleInventory) {
      const partialSource = readUtf8(
        path.resolve(import.meta.dirname, partialImportPath),
      );
      const templateMarkerIndex = partialSource.indexOf("<Meta isTemplate />");

      expect(partialSource).toContain('import { Meta } from "@storybook/addon-docs/blocks"');
      expect(templateMarkerIndex).toBeGreaterThan(-1);
      expect(partialSource.slice(templateMarkerIndex)).not.toContain("\nimport ");
    }
  });

  test("does not keep addon-onboarding enabled after the workspace is already onboarded", () => {
    const configSource = readUtf8(storybookConfigFilePath);

    expect(configSource).not.toContain('"@storybook/addon-onboarding"');
  });

  test("attaches MDX docs to the AutoComplete stories tree so the sidebar stays grouped", () => {
    const docsSource = readUtf8(docsFilePath);

    expect(docsSource).toContain(
      'import * as AutoCompleteStories from "./auto-complete.stories"',
    );
    expect(docsSource).toContain("<Meta of={AutoCompleteStories} />");
  });

  test("assembles example docs from examples MDX partials without an Examples heading", () => {
    const docsSource = readUtf8(docsFilePath);

    expect(docsSource).not.toContain("## Examples");
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
      expect(docsSource).toContain(`<${partialComponentName} />`);
    }
  });

  test("keeps the visual example sections wired to live ComponentSource examples through the MDX partials", () => {
    const docsSource = readUtf8(docsFilePath);

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

      const partialSource = readUtf8(partialFilePath);

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
