"use client";

import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from "@acme/ui/components/combobox";

const frameworkGroups = [
  {
    key: "meta-frameworks",
    label: "Meta-frameworks",
    items: ["Next.js", "Nuxt.js", "SvelteKit", "Remix", "Astro"],
  },
] as const;

function BasicShadcnLikeDemo(): React.JSX.Element {
  return (
    <Combobox items={frameworkGroups}>
      <ComboboxInput placeholder="Select a framework" />
      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(group: (typeof frameworkGroups)[number]) => (
            <ComboboxGroup key={group.key} items={group.items}>
              <ComboboxLabel>{group.label}</ComboboxLabel>
              <ComboboxCollection>
                {(item: string) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxCollection>
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export default BasicShadcnLikeDemo;
