import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, test } from "vitest";

const buttonExampleInventory: ReadonlyArray<{
  heading: string;
  sourcePath: string;
  partialImportPath: string;
  partialComponentName: string;
}> = [
  {
    heading: "Basic Usage",
    sourcePath: "button/demo/basic.tsx",
    partialImportPath: "./demo/basic.mdx",
    partialComponentName: "BasicExample",
  },
  {
    heading: "Color & Variant",
    sourcePath: "button/demo/color-variant.tsx",
    partialImportPath: "./demo/color-variant.mdx",
    partialComponentName: "ColorVariantExample",
  },
  {
    heading: "Different Sizes",
    sourcePath: "button/demo/sizes.tsx",
    partialImportPath: "./demo/sizes.mdx",
    partialComponentName: "SizesExample",
  },
  {
    heading: "Button Types",
    sourcePath: "button/demo/types.tsx",
    partialImportPath: "./demo/types.mdx",
    partialComponentName: "TypesExample",
  },
  {
    heading: "Danger Button",
    sourcePath: "button/demo/danger.tsx",
    partialImportPath: "./demo/danger.mdx",
    partialComponentName: "DangerExample",
  },
  {
    heading: "Disabled State",
    sourcePath: "button/demo/disabled.tsx",
    partialImportPath: "./demo/disabled.mdx",
    partialComponentName: "DisabledExample",
  },
  {
    heading: "Loading State",
    sourcePath: "button/demo/loading.tsx",
    partialImportPath: "./demo/loading.mdx",
    partialComponentName: "LoadingExample",
  },
  {
    heading: "Icon Button",
    sourcePath: "button/demo/icon.tsx",
    partialImportPath: "./demo/icon.mdx",
    partialComponentName: "IconExample",
  },
  {
    heading: "Button with Icon",
    sourcePath: "button/demo/with-icon.tsx",
    partialImportPath: "./demo/with-icon.mdx",
    partialComponentName: "WithIconExample",
  },
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
] as const;

describe("Button docs Storybook config", () => {
  test("configures addon-docs with remark-gfm so markdown tables render as tables in MDX docs", () => {
    const configSource = readFileSync(
      resolve(import.meta.dirname, "../../../.storybook/main.ts"),
      "utf8",
    );

    expect(configSource).toContain('name: "@storybook/addon-docs"');
    expect(configSource).toContain("mdxPluginOptions");
    expect(configSource).toContain("remarkPlugins: [remarkGfm]");
  });

  test("assembles example docs from demo MDX partials instead of raw markdown", () => {
    const docsSource = readFileSync(resolve(import.meta.dirname, "./button.mdx"), "utf8");

    expect(docsSource).toContain("## Examples");
    expect(docsSource).not.toContain('import ReactMarkdown from "react-markdown"');
    expect(docsSource).not.toContain("?raw");

    for (const { partialImportPath, partialComponentName } of buttonExampleInventory) {
      expect(docsSource).toContain(`import ${partialComponentName} from "${partialImportPath}"`);
      expect(docsSource).toMatch(
        new RegExp(`## Examples[\\s\\S]*?<${partialComponentName} ?/>`),
      );
    }
  });

  test("keeps the visual example sections wired to live ComponentSource demos through the MDX partials", () => {
    const docsSource = readFileSync(resolve(import.meta.dirname, "./button.mdx"), "utf8");

    for (const { partialImportPath, partialComponentName } of buttonExampleInventory) {
      expect(docsSource).toContain(`import ${partialComponentName} from "${partialImportPath}"`);
      expect(docsSource).toContain(`<${partialComponentName} />`);
    }

    for (const { heading, partialImportPath, sourcePath } of buttonExampleInventory) {
      const partialFilePath = resolve(import.meta.dirname, partialImportPath);
      const legacyInlineSectionPattern = new RegExp(
        `### ${heading}[\\s\\S]*?(?=### |## API Reference|## Migration from Ant Design|$)`,
        "s",
      );

      expect(existsSync(partialFilePath), `Expected MDX partial for ${heading} at ${partialImportPath}`).toBe(true);
      expect(docsSource).not.toMatch(legacyInlineSectionPattern);

      const partialSource = readFileSync(partialFilePath, "utf8");

      expect(partialSource).toContain("ComponentSource");
      expect(partialSource).toContain(`### ${heading}`);
      expect(partialSource).toContain(`src="${sourcePath}"`);
      expect(partialSource).toMatch(
        new RegExp(`### ${heading}[\\s\\S]*?<ComponentSource[^>]*src="${sourcePath}"`, "s"),
      );
    }
  });
});
