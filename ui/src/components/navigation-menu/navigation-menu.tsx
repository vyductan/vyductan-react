import React from "react";
import { cva } from "class-variance-authority";

import type { MenuProps } from "../menu";
import {
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenu as ShadcnNavigationMenu,
} from "../../shadcn/navigation-menu";

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

type NavMenuProps = React.ComponentProps<typeof ShadcnNavigationMenu> & {
  mode?: React.ComponentProps<typeof ShadcnNavigationMenu>["orientation"];
  items: MenuProps["items"];
  selectedKeys?: React.Key[];
};
const NavigationMenu = ({
  mode = "vertical",
  items,
  selectedKeys,
  ...props
}: NavMenuProps) => {
  const isShadcnNavigationMenu = props.orientation === "vertical";
  if (isShadcnNavigationMenu) {
    return <ShadcnNavigationMenu {...props} />;
  }

  const transform = (items: MenuProps["items"]) => {
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
    <ShadcnNavigationMenu orientation={mode} {...props}>
      <NavigationMenuList>{transform(items)}</NavigationMenuList>
    </ShadcnNavigationMenu>
  );
};

export { NavigationMenu };
