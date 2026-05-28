import type React from "react";
import { cva } from "class-variance-authority";

import {
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenu as ShadcnNavigationMenu,
} from "@acme/ui/shadcn/navigation-menu";

import type { MenuProps as MenuProperties } from "../menu";

const navigationMenuTriggerVariants = cva("", {
  variants: {
    mode: {
      vertical: "block w-full",
      horizontal: "inline-flex w-max items-center justify-center",
    },
    selected: {
      true: ["bg-accent text-accent-foreground"],
      false: ["text-muted-foreground"],
    },
  },
});

type NavMenuProperties = React.ComponentProps<typeof ShadcnNavigationMenu> & {
  mode?: React.ComponentProps<typeof ShadcnNavigationMenu>["orientation"];
  items: MenuProperties["items"];
  selectedKeys?: React.Key[];
};
const NavigationMenu = ({
  mode = "vertical",
  items,
  selectedKeys,
  ...properties
}: NavMenuProperties) => {
  const isShadcnNavigationMenu = properties.orientation === "vertical";
  if (isShadcnNavigationMenu) {
    return <ShadcnNavigationMenu {...properties} />;
  }

  const transform = (items: MenuProperties["items"]) => {
    const components = items.map((item) => {
      if (item?.type === "item") {
        const key = item.key;
        return (
          <NavigationMenuItem key={key}>
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerVariants({
                mode,
                selected: !!selectedKeys?.includes(key),
              })}
            >
              {item.label}
            </NavigationMenuLink>
          </NavigationMenuItem>
        );
      }
      return;
    });
    return components;
  };
  return (
    <ShadcnNavigationMenu orientation={mode} {...properties}>
      <NavigationMenuList>{transform(items)}</NavigationMenuList>
    </ShadcnNavigationMenu>
  );
};

export { NavigationMenu };
