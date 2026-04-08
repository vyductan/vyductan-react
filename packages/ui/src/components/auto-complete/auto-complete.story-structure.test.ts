import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";

const removedExampleStories = [
  "BasicUsage",
  "ComboboxMode",
  "InputMode",
  "AllowClear",
  "Disabled",
  "Loading",
  "CustomOptionRender",
  "SearchFilter",
  "DropdownCustomization",
] as const;

const removedExampleImports = [
  'import AllowClearDemo from "./examples/allow-clear";',
  'import BasicDemo from "./examples/basic";',
  'import ComboboxModeDemo from "./examples/combobox-mode";',
  'import CustomOptionRenderDemo from "./examples/custom-option-render";',
  'import DisabledDemo from "./examples/disabled";',
  'import DropdownCustomizationDemo from "./examples/dropdown-customization";',
  'import InputModeDemo from "./examples/input-mode";',
  'import LoadingDemo from "./examples/loading";',
  'import SearchFilterDemo from "./examples/search-filter";',
] as const;

test("auto-complete stories file keeps docs examples out of the Storybook sidebar", () => {
  const storiesSource = readFileSync(
    path.resolve(import.meta.dirname, "./auto-complete.stories.tsx"),
    "utf8",
  );

  for (const importStatement of removedExampleImports) {
    expect(storiesSource).not.toContain(importStatement);
  }

  for (const storyName of removedExampleStories) {
    expect(storiesSource).not.toContain(`export const ${storyName}: Story = {`);
  }
});
