import type { MenuItemDef } from "../menu/types";
import type { NavigationMenuRootProps } from "./components";
import {
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuRoot,
  navigationMenuTriggerStyle,
} from "./components";

type NavMenuProps = Omit<NavigationMenuRootProps, "orientation"> & {
  mode?: NavigationMenuRootProps["orientation"];
  items: MenuItemDef[];
  selectedKeys?: React.Key[];
};
export const NavMenu = ({
  mode = "vertical",
  items,
  selectedKeys,
  ...props
}: NavMenuProps) => {
  const transform = (items: MenuItemDef[]) => {
    const components = items.map((item) => {
      if (item.type === "item") {
        const key = item.key;
        return (
          <NavigationMenuItem key={key}>
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerStyle({
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
    <NavigationMenuRoot orientation={mode} {...props}>
      <NavigationMenuList>{transform(items)}</NavigationMenuList>
    </NavigationMenuRoot>
  );
};
