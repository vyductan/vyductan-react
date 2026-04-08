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
