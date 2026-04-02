import { readFileSync } from "node:fs";
import { posix, resolve } from "node:path";

import { expect, test } from "vitest";

type RegistryFile = {
  target: string;
  content: string;
};

type RegistryItem = {
  name: string;
  files: RegistryFile[];
  registryDependencies?: string[];
  dependencies?: string[];
};

const registryDir = resolve(import.meta.dirname, "../../../public/registry");
const registryExtensions = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".css"];

function readRegistryItem(name: string): RegistryItem {
  return JSON.parse(
    readFileSync(resolve(registryDir, `${name}.json`), "utf8"),
  ) as RegistryItem;
}

function collectRegistryItems(entryName: string): RegistryItem[] {
  const visited = new Set<string>();
  const items: RegistryItem[] = [];

  const visit = (name: string) => {
    if (visited.has(name)) {
      return;
    }

    visited.add(name);
    const item = readRegistryItem(name);
    items.push(item);

    for (const dependency of item.registryDependencies ?? []) {
      visit(dependency);
    }
  };

  visit(entryName);

  return items;
}

function readRegistryFileContent(entryName: string, target: string): string {
  const file = collectRegistryItems(entryName)
    .flatMap((item) => item.files)
    .find((candidate) => candidate.target === target);

  if (!file) {
    throw new Error(`Missing registry file: ${target}`);
  }

  return file.content;
}

function extractModuleSpecifiers(source: string): string[] {
  const specifiers = new Set<string>();
  const fromPattern = /\b(?:import|export)\s+(?:type\s+)?[^"']*?\sfrom\s+["']([^"']+)["']/g;
  const sideEffectPattern = /\bimport\s+["']([^"']+)["']/g;

  for (const pattern of [fromPattern, sideEffectPattern]) {
    for (const match of source.matchAll(pattern)) {
      const specifier = match[1];
      if (specifier) {
        specifiers.add(specifier);
      }
    }
  }

  return [...specifiers];
}

function resolveImportCandidates(fromTarget: string, specifier: string): string[] {
  const baseTarget = posix.normalize(
    posix.join(posix.dirname(fromTarget), specifier),
  );

  if (posix.extname(baseTarget)) {
    return [baseTarget];
  }

  return [
    ...registryExtensions.map((extension) => `${baseTarget}${extension}`),
    ...registryExtensions.map((extension) => posix.join(baseTarget, `index${extension}`)),
  ];
}

function collectRegistryImportIssues(entryName: string) {
  const items = collectRegistryItems(entryName);
  const files = items.flatMap((item) => item.files);
  const availableTargets = new Set(files.map((file) => file.target));

  const unresolvedRelativeImports: string[] = [];

  for (const file of files) {
    for (const specifier of extractModuleSpecifiers(file.content)) {
      if (!specifier.startsWith(".")) {
        continue;
      }

      const resolved = resolveImportCandidates(file.target, specifier);
      if (!resolved.some((candidate) => availableTargets.has(candidate))) {
        unresolvedRelativeImports.push(`${file.target} -> ${specifier}`);
      }
    }
  }

  return { unresolvedRelativeImports };
}

test("table registry types keep local table dependency imports", () => {
  const content = readRegistryFileContent("table", "components/table/types.ts");

  expect(content).toContain('from "../checkbox"');
  expect(content).toContain('from "../pagination"');
  expect(content).toContain('from "../tooltip"');
});

test("table registry base compose primitives keep local shadcn table imports", () => {
  const base = readRegistryFileContent("table", "components/table/_components/base.tsx");
  const table = readRegistryFileContent("table", "shadcn/table.tsx");

  expect(base).toContain('from "../../../shadcn/table"');
  expect(table).toContain('from "@acme/ui/lib/utils"');
});

test("table registry tooltip support keeps local shadcn tooltip imports", () => {
  const components = readRegistryFileContent("table", "components/tooltip/_components.tsx");
  const tooltip = readRegistryFileContent("table", "shadcn/tooltip.tsx");

  expect(components).toContain('from "../../shadcn/tooltip"');
  expect(tooltip).toContain('from "@acme/ui/lib/utils"');
});

test("table registry checkbox support keeps local shadcn checkbox imports", () => {
  const checkboxComponent = readRegistryFileContent("table", "components/checkbox/checkbox.tsx");
  const checkboxIndex = readRegistryFileContent("table", "components/checkbox/index.tsx");
  const checkbox = readRegistryFileContent("table", "shadcn/checkbox.tsx");

  expect(checkboxComponent).toContain('from "../../shadcn/checkbox"');
  expect(checkboxIndex).toContain('from "./checkbox"');
  expect(checkbox).toContain('from "@acme/ui/lib/utils"');
});

test("table registry checkbox support closes narrowed helper and wave imports", () => {
  const { unresolvedRelativeImports } = collectRegistryImportIssues("table");

  expect(
    unresolvedRelativeImports.filter(
      (issue) =>
        issue === "components/checkbox/checkbox-group.tsx -> ../form" ||
        issue === "components/checkbox/checkbox.tsx -> ../../lib/wave" ||
        issue === "components/checkbox/checkbox.tsx -> ../button" ||
        issue ===
          "components/checkbox/checkbox.tsx -> ../config-provider/disabled-context" ||
        issue === "components/checkbox/checkbox.tsx -> ../form" ||
        issue === "components/checkbox/checkbox.tsx -> ../input" ||
        issue === "components/checkbox/checkbox.tsx -> ../label/label" ||
        issue === "components/checkbox/group-context.ts -> ../form",
    ),
  ).toEqual([]);
});

test("table registry checkbox support helper artifacts keep local shadcn label imports", () => {
  const label = readRegistryFileContent("table", "components/label/label.tsx");
  const shadcnLabel = readRegistryFileContent("table", "shadcn/label.tsx");

  expect(label).toContain('from "../../shadcn/label"');
  expect(shadcnLabel).toContain('from "@acme/ui/lib/utils"');
});

test("table checkbox support registry keeps button variant types self-contained", () => {
  const { unresolvedRelativeImports } = collectRegistryImportIssues(
    "table-checkbox-support",
  );

  expect(
    unresolvedRelativeImports.filter(
      (issue) =>
        issue ===
        "components/checkbox/checkbox-group.tsx -> ../button/button-variants",
    ),
  ).toEqual([]);
});

test("table checkbox support registry declares label shim runtime dependency", () => {
  const item = readRegistryItem("table-checkbox-support");

  expect(item.dependencies).toContain("radix-ui");
});

test("table registry table runtime keeps local shadcn skeleton imports", () => {
  const tableRuntime = readRegistryFileContent("table", "components/table/table.tsx");
  const skeleton = readRegistryFileContent("table", "shadcn/skeleton.tsx");

  expect(tableRuntime).toContain('from "../../shadcn/skeleton"');
  expect(skeleton).toContain('from "@acme/ui/lib/utils"');
});

test("table registry pagination support keeps local pagination imports", () => {
  const paginationIndex = readRegistryFileContent("table", "components/pagination/_components/index.tsx");
  const pagination = readRegistryFileContent("table", "components/pagination/pagination.tsx");

  expect(paginationIndex).toContain('from "../../../icons"');
  expect(pagination).toContain('from "./_components"');
  expect(pagination).toContain('from "../../icons"');
});

test("table registry page-size options use the local select wrapper", () => {
  const content = readRegistryFileContent(
    "table",
    "components/pagination/_components/page-size-options.tsx",
  );

  expect(content).toContain('from "../../select"');
});

test("table registry page-size options resolve local select wrapper artifacts", () => {
  const select = readRegistryFileContent("table", "components/select/index.tsx");
  const { unresolvedRelativeImports } = collectRegistryImportIssues("table");

  expect(select).toContain('from "../../shadcn/select"');
  expect(
    unresolvedRelativeImports.filter(
      (issue) =>
        issue ===
          "components/pagination/_components/page-size-options.tsx -> ../../select" ||
        issue.startsWith("components/select/"),
    ),
  ).toEqual([]);
});

test("table registry remaining helper imports keep expected local paths", () => {
  const spin = readRegistryFileContent("table", "components/spin/spin.tsx");
  const head = readRegistryFileContent("table", "components/table/_components/table-head-advanced.tsx");
  const styles = readRegistryFileContent("table", "components/table/styles.ts");
  const expand = readRegistryFileContent("table", "components/table/utils/expand-util.tsx");
  const icon = readRegistryFileContent("table", "icons/icon-component.tsx");
  const wrapper = readRegistryFileContent("table", "icons/wrapper.tsx");

  expect(spin).toContain('from "class-variance-authority"');
  expect(head).toContain('from "../../../icons"');
  expect(styles).toContain('from "../../lib/utils"');
  expect(expand).toContain('from "../../../icons"');
  expect(icon).toContain('import "iconify-icon"');
  expect(wrapper).toContain('from "react"');
});

test("table registry next closure batch resolves local table barrels and helper artifacts", () => {
  const { unresolvedRelativeImports } = collectRegistryImportIssues("table");

  expect(
    unresolvedRelativeImports.filter(
      (issue) =>
        issue ===
          "components/pagination/pagination.tsx -> ./_components/page-size-options" ||
        issue === "components/table/_components/table-head-advanced.tsx -> ." ||
        issue === "components/table/hooks/use-pagination.ts -> ../../_util/extends-object" ||
        issue ===
          "components/table/hooks/use-selection.tsx -> ../../_util/hooks/use-multiple-select" ||
        issue === "components/table/table.tsx -> ./_components",
    ),
  ).toEqual([]);
});

test("table registry shared icons include local leaf exports", () => {
  const { unresolvedRelativeImports } = collectRegistryImportIssues("table");

  expect(
    unresolvedRelativeImports.filter((issue) => issue.startsWith("icons/index.ts -> ./")),
  ).toEqual([]);
});

test("table registry tree support avoids runtime tree component fanout", () => {
  const { unresolvedRelativeImports } = collectRegistryImportIssues("table");

  expect(
    unresolvedRelativeImports.filter(
      (issue) =>
        issue === "components/tree/tree.tsx -> ../button" ||
        issue === "components/tree/tree.tsx -> ../collapsible",
    ),
  ).toEqual([]);
});

test("table registry local control support resolves dropdown radio and button imports", () => {
  const { unresolvedRelativeImports } = collectRegistryImportIssues("table");

  expect(
    unresolvedRelativeImports.filter(
      (issue) =>
        issue === "components/table/hooks/use-selection.tsx -> ../../dropdown" ||
        issue === "components/table/hooks/use-selection.tsx -> ../../radio" ||
        issue === "components/table/types.ts -> ../dropdown" ||
        issue === "components/table/utils/expand-util.tsx -> ../../button",
    ),
  ).toEqual([]);
});

test("table registry selection dropdown keeps popup container support in exported types", () => {
  const content = readRegistryFileContent("table", "components/table/types.ts");

  expect(content).toContain("getPopupContainer?: GetPopupContainer;");
});

test("table registry selection dropdown stays portaled after local dropdown removal", () => {
  const content = readRegistryFileContent(
    "table",
    "components/table/hooks/use-selection.tsx",
  );

  expect(content).toContain("createPortal(");
});

test("table registry locale support avoids empty and locale hook fanout", () => {
  const { unresolvedRelativeImports } = collectRegistryImportIssues("table");

  expect(
    unresolvedRelativeImports.filter(
      (issue) =>
        issue === "components/locale/index.tsx -> ../empty" ||
        issue === "components/locale/index.tsx -> ./use-locale",
    ),
  ).toEqual([]);
});

test("table registry size context avoids input barrel fanout", () => {
  const { unresolvedRelativeImports } = collectRegistryImportIssues("table");

  expect(
    unresolvedRelativeImports.filter(
      (issue) => issue === "components/config-provider/size-context.tsx -> ../input",
    ),
  ).toEqual([]);
});

test("table registry config context avoids broad component and theme fanout", () => {
  const { unresolvedRelativeImports } = collectRegistryImportIssues("table");

  expect(
    unresolvedRelativeImports.filter(
      (issue) =>
        issue ===
          "components/config-provider/context.ts -> ../../lib/wave/interface" ||
        issue === "components/config-provider/context.ts -> ../button" ||
        issue === "components/config-provider/context.ts -> ../date-picker" ||
        issue === "components/config-provider/context.ts -> ../form" ||
        issue === "components/config-provider/context.ts -> ../input" ||
        issue === "components/config-provider/context.ts -> ../mentions" ||
        issue === "components/config-provider/context.ts -> ../result" ||
        issue === "components/config-provider/context.ts -> ../select" ||
        issue === "components/config-provider/context.ts -> ../tag" ||
        issue === "components/config-provider/context.ts -> ../textarea" ||
        issue === "components/config-provider/context.ts -> ../theme/interface" ||
        issue === "components/config-provider/context.ts -> ./default-render-empty",
    ),
  ).toEqual([]);
});

test("table registry responsive observer avoids theme internal fanout", () => {
  const { unresolvedRelativeImports } = collectRegistryImportIssues("table");

  expect(
    unresolvedRelativeImports.filter(
      (issue) => issue === "components/_util/responsive-observer.ts -> ../theme/internal",
    ),
  ).toEqual([]);
});

test("table registry shadcn artifacts preserve workspace utility imports", () => {
  const checkbox = readRegistryFileContent("table", "shadcn/checkbox.tsx");
  const select = readRegistryFileContent("table", "shadcn/select.tsx");
  const skeleton = readRegistryFileContent("table", "shadcn/skeleton.tsx");
  const table = readRegistryFileContent("table", "shadcn/table.tsx");
  const tooltip = readRegistryFileContent("table", "shadcn/tooltip.tsx");

  expect(checkbox).toContain('from "@acme/ui/lib/utils"');
  expect(checkbox).toContain("data-[state=checked]:border-primary");

  expect(select).toContain('from "@acme/ui/lib/utils"');
  expect(skeleton).toContain('from "@acme/ui/lib/utils"');
  expect(table).toContain('from "@acme/ui/lib/utils"');
  expect(tooltip).toContain('from "@acme/ui/lib/utils"');
});

test("table registry shared core avoids responsive config and locale fanout", () => {
  const { unresolvedRelativeImports } = collectRegistryImportIssues("table");

  expect(
    unresolvedRelativeImports.filter(
      (issue) =>
        issue === "components/_util/responsive-observer.ts -> ../theme/internal" ||
        issue ===
          "components/config-provider/context.ts -> ../../lib/wave/interface" ||
        issue === "components/config-provider/context.ts -> ../button" ||
        issue === "components/config-provider/context.ts -> ../date-picker" ||
        issue === "components/config-provider/context.ts -> ../form" ||
        issue === "components/config-provider/context.ts -> ../input" ||
        issue === "components/config-provider/context.ts -> ../mentions" ||
        issue === "components/config-provider/context.ts -> ../result" ||
        issue === "components/config-provider/context.ts -> ../select" ||
        issue === "components/config-provider/context.ts -> ../tag" ||
        issue === "components/config-provider/context.ts -> ../textarea" ||
        issue === "components/config-provider/context.ts -> ../theme/interface" ||
        issue === "components/config-provider/context.ts -> ./default-render-empty" ||
        issue === "components/config-provider/size-context.tsx -> ../input" ||
        issue === "components/locale/index.tsx -> ../empty" ||
        issue === "components/locale/index.tsx -> ./use-locale",
    ),
  ).toEqual([]);
});

test("table registry artifacts resolve transitive registry dependencies", () => {
  const { unresolvedRelativeImports } = collectRegistryImportIssues("table");

  expect(unresolvedRelativeImports.sort()).toEqual([]);
});
