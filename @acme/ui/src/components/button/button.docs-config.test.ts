import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const buttonExampleInventory: ReadonlyArray<{
  heading: string;
  sourcePath: string;
  partialImportPath: string;
  partialComponentName: string;
}> = [
  {
    heading: "Basic Usage",
    sourcePath: "button/examples/basic.tsx",
    partialImportPath: "./examples/basic.mdx",
    partialComponentName: "BasicExample",
  },
  {
    heading: "Color & Variant",
    sourcePath: "button/examples/color-variant.tsx",
    partialImportPath: "./examples/color-variant.mdx",
    partialComponentName: "ColorVariantExample",
  },
  {
    heading: "Different Sizes",
    sourcePath: "button/examples/sizes.tsx",
    partialImportPath: "./examples/sizes.mdx",
    partialComponentName: "SizesExample",
  },
  {
    heading: "Button Types",
    sourcePath: "button/examples/types.tsx",
    partialImportPath: "./examples/types.mdx",
    partialComponentName: "TypesExample",
  },
  {
    heading: "Danger Button",
    sourcePath: "button/examples/danger.tsx",
    partialImportPath: "./examples/danger.mdx",
    partialComponentName: "DangerExample",
  },
  {
    heading: "Disabled State",
    sourcePath: "button/examples/disabled.tsx",
    partialImportPath: "./examples/disabled.mdx",
    partialComponentName: "DisabledExample",
  },
  {
    heading: "Loading State",
    sourcePath: "button/examples/loading.tsx",
    partialImportPath: "./examples/loading.mdx",
    partialComponentName: "LoadingExample",
  },
  {
    heading: "Icon Button",
    sourcePath: "button/examples/icon.tsx",
    partialImportPath: "./examples/icon.mdx",
    partialComponentName: "IconExample",
  },
  {
    heading: "Button with Icon",
    sourcePath: "button/examples/with-icon.tsx",
    partialImportPath: "./examples/with-icon.mdx",
    partialComponentName: "WithIconExample",
  },
  {
    heading: "Link as Button",
    sourcePath: "button/examples/link-as-button.tsx",
    partialImportPath: "./examples/link-as-button.mdx",
    partialComponentName: "LinkAsButtonExample",
  },
  {
    heading: "Form Integration",
    sourcePath: "button/examples/form-integration.tsx",
    partialImportPath: "./examples/form-integration.mdx",
    partialComponentName: "FormIntegrationExample",
  },
] as const;

describe("Button docs Storybook config", () => {
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
      path.resolve(import.meta.dirname, "./button.mdx"),
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
    } of buttonExampleInventory) {
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
      path.resolve(import.meta.dirname, "./button.mdx"),
      "utf8",
    );

    for (const {
      partialImportPath,
      partialComponentName,
    } of buttonExampleInventory) {
      expect(docsSource).toContain(
        `import ${partialComponentName} from "${partialImportPath}"`,
      );
      expect(docsSource).toContain(`<${partialComponentName} />`);
    }

    for (const {
      heading,
      partialImportPath,
      sourcePath,
    } of buttonExampleInventory) {
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
