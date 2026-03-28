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

  const aliasLeaks: string[] = [];
  const unresolvedRelativeImports: string[] = [];

  for (const file of files) {
    for (const specifier of extractModuleSpecifiers(file.content)) {
      if (specifier.startsWith("@acme/ui/")) {
        aliasLeaks.push(`${file.target} -> ${specifier}`);
        continue;
      }

      if (!specifier.startsWith(".")) {
        continue;
      }

      const resolved = resolveImportCandidates(file.target, specifier);
      if (!resolved.some((candidate) => availableTargets.has(candidate))) {
        unresolvedRelativeImports.push(`${file.target} -> ${specifier}`);
      }
    }
  }

  return { aliasLeaks, unresolvedRelativeImports };
}

test("table registry types use local shared breakpoint imports", () => {
  const { aliasLeaks } = collectRegistryImportIssues("table");

  expect(
    aliasLeaks.filter((leak) => leak.startsWith("components/table/types.ts ->")),
  ).toEqual([]);
});

test("table registry base compose primitives use local shadcn table imports", () => {
  const { aliasLeaks } = collectRegistryImportIssues("table");

  expect(
    aliasLeaks.filter(
      (leak) =>
        leak.startsWith("components/table/_components/base.tsx ->") ||
        leak.startsWith("shadcn/table.tsx ->"),
    ),
  ).toEqual([]);
});

test("table registry tooltip support uses local shared imports", () => {
  const { aliasLeaks } = collectRegistryImportIssues("table");

  expect(
    aliasLeaks.filter(
      (leak) =>
        leak.startsWith("components/tooltip/_components.tsx ->") ||
        leak.startsWith("shadcn/tooltip.tsx ->"),
    ),
  ).toEqual([]);
});

test("table registry checkbox support uses local shared imports", () => {
  const { aliasLeaks } = collectRegistryImportIssues("table");

  expect(
    aliasLeaks.filter(
      (leak) =>
        leak.startsWith("components/checkbox/checkbox.tsx ->") ||
        leak.startsWith("components/checkbox/index.tsx ->") ||
        leak.startsWith("shadcn/checkbox.tsx ->"),
    ),
  ).toEqual([]);
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
        issue === "components/checkbox/group-context.ts -> ../form",
    ),
  ).toEqual([]);
});

test("table registry checkbox support helper artifacts avoid alias leaks", () => {
  const { aliasLeaks } = collectRegistryImportIssues("table");

  expect(
    aliasLeaks.filter(
      (leak) =>
        leak.startsWith("components/button/loading-icon.tsx ->") ||
        leak.startsWith("lib/wave/index.ts ->") ||
        leak.startsWith("lib/wave/use-wave.ts ->") ||
        leak.startsWith("lib/wave/wave-effect.tsx ->"),
    ),
  ).toEqual([]);
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

test("table registry table runtime uses local shared skeleton imports", () => {
  const { aliasLeaks } = collectRegistryImportIssues("table");

  expect(
    aliasLeaks.filter(
      (leak) =>
        leak.startsWith("components/table/table.tsx ->") ||
        leak.startsWith("shadcn/skeleton.tsx ->"),
    ),
  ).toEqual([]);
});

test("table registry pagination support uses local shared imports", () => {
  const { aliasLeaks } = collectRegistryImportIssues("table");

  expect(
    aliasLeaks.filter(
      (leak) =>
        leak.startsWith("components/pagination/_components/index.tsx ->") ||
        leak.startsWith("components/pagination/pagination.tsx ->"),
    ),
  ).toEqual([]);
});

test("table registry remaining helper imports use local shared paths", () => {
  const { aliasLeaks } = collectRegistryImportIssues("table");

  expect(
    aliasLeaks.filter(
      (leak) =>
        leak.startsWith("components/spin/spin.tsx ->") ||
        leak.startsWith("components/table/_components/table-head-advanced.tsx ->") ||
        leak.startsWith("components/table/styles.ts ->") ||
        leak.startsWith("components/table/utils/expand-util.tsx ->") ||
        leak.startsWith("icons/icon-component.tsx ->") ||
        leak.startsWith("icons/wrapper.tsx ->"),
    ),
  ).toEqual([]);
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

test("table registry artifacts stay self-contained across transitive registry dependencies", () => {
  const { aliasLeaks, unresolvedRelativeImports } = collectRegistryImportIssues("table");

  expect(aliasLeaks.sort()).toEqual([]);
  expect(unresolvedRelativeImports.sort()).toEqual([]);
});
