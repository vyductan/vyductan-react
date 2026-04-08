import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const checkboxExampleInventory: ReadonlyArray<{
  heading: string;
  sourcePath: string;
  partialImportPath: string;
  partialComponentName: string;
}> = [
  {
    heading: "Basic Usage",
    sourcePath: "checkbox/examples/basic.tsx",
    partialImportPath: "./examples/basic.mdx",
    partialComponentName: "BasicExample",
  },
  {
    heading: "Card Variant",
    sourcePath: "checkbox/examples/card.tsx",
    partialImportPath: "./examples/card.mdx",
    partialComponentName: "CardExample",
  },
] as const;

describe("Checkbox docs Storybook config", () => {
  test("configures addon-docs with remark-gfm so markdown tables render as tables in MDX docs", () => {
    const configSource = readFileSync(
      path.resolve(import.meta.dirname, "../../../.storybook/main.ts"),
      "utf8",
    );

    expect(configSource).toContain('name: "@storybook/addon-docs"');
    expect(configSource).toContain("mdxPluginOptions");
    expect(configSource).toContain("remarkPlugins: [remarkGfm]");
  });

  test("marks examples MDX partials as templates so Storybook does not index them as standalone sidebar entries", () => {
    for (const { partialImportPath } of checkboxExampleInventory) {
      const partialSource = readFileSync(
        path.resolve(import.meta.dirname, partialImportPath),
        "utf8",
      );
      const templateMarkerIndex = partialSource.indexOf("<Meta isTemplate />");

      expect(partialSource).toContain('import { Meta } from "@storybook/addon-docs/blocks"');
      expect(templateMarkerIndex).toBeGreaterThan(-1);
      expect(partialSource.slice(templateMarkerIndex)).not.toContain("\nimport ");
    }
  });

  test("does not keep addon-onboarding enabled after the workspace is already onboarded", () => {
    const configSource = readFileSync(
      path.resolve(import.meta.dirname, "../../../.storybook/main.ts"),
      "utf8",
    );

    expect(configSource).not.toContain('"@storybook/addon-onboarding"');
  });

  test("attaches MDX docs to the Checkbox stories tree so the sidebar stays grouped", () => {
    const docsSource = readFileSync(
      path.resolve(import.meta.dirname, "./checkbox.mdx"),
      "utf8",
    );

    expect(docsSource).toContain(
      'import * as CheckboxStories from "./checkbox.stories"',
    );
    expect(docsSource).toContain("<Meta of={CheckboxStories} />");
  });

  test("assembles example docs from examples MDX partials instead of raw markdown", () => {
    const docsSource = readFileSync(
      path.resolve(import.meta.dirname, "./checkbox.mdx"),
      "utf8",
    );

    expect(docsSource).toContain("## Examples");
    expect(docsSource).not.toContain('import ReactMarkdown from "react-markdown"');
    expect(docsSource).not.toContain("?raw");

    for (const {
      partialImportPath,
      partialComponentName,
    } of checkboxExampleInventory) {
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
      path.resolve(import.meta.dirname, "./checkbox.mdx"),
      "utf8",
    );

    for (const {
      partialImportPath,
      partialComponentName,
    } of checkboxExampleInventory) {
      expect(docsSource).toContain(
        `import ${partialComponentName} from "${partialImportPath}"`,
      );
      expect(docsSource).toContain(`<${partialComponentName} />`);
    }

    for (const {
      heading,
      partialImportPath,
      sourcePath,
    } of checkboxExampleInventory) {
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
