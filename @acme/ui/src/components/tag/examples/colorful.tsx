import type React from "react";

import { Divider } from "@acme/ui/components/divider";
import { Flex } from "@acme/ui/components/flex";
import { Tag } from "@acme/ui/components/tag";

const tailwindColors = [
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
  "black",
  "white",
] as const;

const antDesignColors = ["magenta", "volcano", "geekblue", "gold"] as const;
const hexColors = ["#f50", "#2db7f5", "#87d068", "#108ee9"] as const;

type TagVariant = "filled" | "solid" | "outlined";

const colorfulGroups = [
  {
    title: "Tailwind presets (filled)",
    variant: "filled",
    colors: tailwindColors,
  },
  {
    title: "Tailwind presets (solid)",
    variant: "solid",
    colors: tailwindColors,
  },
  {
    title: "Tailwind presets (outlined)",
    variant: "outlined",
    colors: tailwindColors,
  },
  {
    title: "Ant Design presets",
    variant: "filled",
    colors: antDesignColors,
  },
  {
    title: "Custom (filled)",
    variant: "filled",
    colors: hexColors,
  },
  {
    title: "Custom (solid)",
    variant: "solid",
    colors: hexColors,
  },
  {
    title: "Custom (outlined)",
    variant: "outlined",
    colors: hexColors,
  },
] as const satisfies ReadonlyArray<{
  title: string;
  variant: TagVariant;
  colors: readonly string[];
}>;

const ColorfulExample: React.FC = () => (
  <div className="flex flex-col gap-6">
    {colorfulGroups.map((group) => (
      <section key={group.title} className="flex flex-col gap-3">
        <Divider orientation="start">{group.title}</Divider>
        <Flex gap="small" wrap>
          {group.colors.map((color) => (
            <Tag
              key={`${group.title}-${color}`}
              variant={group.variant}
              color={color}
            >
              {color}
            </Tag>
          ))}
        </Flex>
      </section>
    ))}
  </div>
);

export default ColorfulExample;
