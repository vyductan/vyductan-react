import type React from "react";

import { Divider } from "@acme/ui/components/divider";
import { Flex } from "@acme/ui/components/flex";
import { Tag } from "@acme/ui/components/tag";

const familyColors = [
  "red",
  "orange",
  "amber",
  "lime",
  "green",
  "cyan",
  "blue",
  "indigo",
  "purple",
  "pink",
  "rose",
] as const;

const hexColors = ["#f50", "#2db7f5", "#87d068", "#108ee9"] as const;

const variants = ["filled", "solid", "outlined"] as const;

const colorfulGroups = [
  {
    title: "Presets (filled)",
    variant: "filled",
    colors: familyColors,
  },
  {
    title: "Presets (solid)",
    variant: "solid",
    colors: familyColors,
  },
  {
    title: "Presets (outlined)",
    variant: "outlined",
    colors: familyColors,
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
  variant: (typeof variants)[number];
  colors: readonly string[];
}>;

const ColorfulExample: React.FC = () => (
  <div className="flex flex-col gap-6">
    {colorfulGroups.map((group) => (
      <section key={group.title} className="flex flex-col gap-3">
        <Divider orientation="start">{group.title}</Divider>
        <Flex gap="small" wrap>
          {group.colors.map((color) => (
            <Tag key={`${group.title}-${color}`} variant={group.variant} color={color}>
              {color}
            </Tag>
          ))}
        </Flex>
      </section>
    ))}
  </div>
);

export default ColorfulExample;
