import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import React from "react";

import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("@acme/ui/components/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("./collapsible-code-block", () => ({
  CollapsibleCodeBlock: ({
    language,
    content,
  }: {
    language: string;
    content: string;
  }) => (
    <div>
      <div data-testid="language">{language}</div>
      <pre data-testid="content">{content}</pre>
    </div>
  ),
}));

import { ComponentSource } from "./component-source";

function ExampleComponent() {
  return <div>example</div>;
}

describe("ComponentSource", () => {
  test("passes actual source code content to the code block instead of the example file path", () => {
    render(<ComponentSource src="button/examples/sizes.tsx" __comp__={ExampleComponent} />);

    expect(screen.getByTestId("language")).toHaveTextContent("tsx");
    expect(screen.getByTestId("content").textContent).toContain(
      'import { Button } from "@acme/ui/components/button";',
    );
    expect(screen.getByTestId("content").textContent).not.toBe(
      "button/examples/sizes.tsx",
    );
  });

  test("table docs reference the renamed expand example source path", () => {
    const tableDocsSource = readFileSync(
      resolve(import.meta.dirname, "../table/table.mdx"),
      "utf8",
    );

    expect(tableDocsSource).toContain(
      'import TableExpandableDemo from "./examples/expand";',
    );
    expect(tableDocsSource).toContain('src="table/examples/expand.tsx"');
    expect(tableDocsSource).not.toContain('src="table/examples/expandable.tsx"');
  });

  test("component docs infrastructure no longer references legacy example directories", () => {
    const componentsRoot = resolve(import.meta.dirname, "..");
    const filesToCheck = [
      resolve(import.meta.dirname, "./component-source.tsx"),
      resolve(import.meta.dirname, "./component-source.test.tsx"),
      resolve(componentsRoot, "button/button.docs-config.test.ts"),
      resolve(componentsRoot, "button/button.story-structure.test.ts"),
      resolve(componentsRoot, "editor/editor.story-structure.test.ts"),
      resolve(componentsRoot, "button/button.stories.tsx"),
      resolve(componentsRoot, "table/table.stories.tsx"),
      resolve(componentsRoot, "form/form.stories.tsx"),
      resolve(componentsRoot, "menu/menu.test.tsx"),
      resolve(componentsRoot, "editor/editor.stories.tsx"),
    ];

    const legacyDirectorySegment = `/${"demo"}/`;
    const legacyRelativeImport = `"./${"demo"}/`;
    const legacyGlobImport = `"../**/${"demo"}/`;

    for (const filePath of filesToCheck) {
      const fileSource = readFileSync(filePath, "utf8");
      expect(fileSource).not.toContain(legacyDirectorySegment);
      expect(fileSource).not.toContain(legacyRelativeImport);
      expect(fileSource).not.toContain(legacyGlobImport);
    }

    for (const entry of readdirSync(componentsRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }

      expect(entry.name).not.toBe("demo");
      expect(readdirSync(resolve(componentsRoot, entry.name))).not.toContain("demo");
    }
  });
});
