"use client";

import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { Fragment, isValidElement, useState } from "react";
import { useMergedState } from "@rc-component/util";

import type {
  ItemType,
  MenuItemType,
  MenuProps as MenuProperties,
  SubMenuType,
} from "../menu";
import { Icon } from "../../icons";
import { cn } from "../../lib/utils";
import {
  ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./_component";

type SidebarItem = ItemType<MenuItemType>;

type SidebarProperties = {
  className?: string;
  classNames?: {
    header?: string;
    footer?: string;
    menuButton?: string;
    backButton?: string;
    icon?: string;
  };

  itemRender?: (
    item: MenuItemType | SubMenuType,
    classNames: SidebarProperties["classNames"],
    originalNode: ReactNode,
  ) => ReactNode;
  contentRender?: (properties: {
    itemNodes: React.ReactNode;
    /** Drill path of the level being rendered; empty at the root. */
    openKeys: string[];
  }) => React.ReactNode;

  header?: ReactNode;
  footer?: ReactNode;
  items?: MenuProperties["items"];
  defaultSelectedKeys?: string[];
  selectedKeys?: string[];
  onSelect?: (arguments_: {
    item: MenuItemType;
    key: React.Key;
    event: MouseEvent<HTMLLIElement> | KeyboardEvent<HTMLLIElement>;
  }) => void;

  /**
   * `"flat"` (default) renders a single level and skips submenus entirely.
   * `"drilldown"` shows one level at a time: activating a submenu replaces the
   * list with its children and prepends a back row.
   */
  mode?: "flat" | "drilldown";
  /** Controlled drill path — submenu keys from root down to the visible level. */
  openKeys?: string[];
  defaultOpenKeys?: string[];
  onOpenChange?: (openKeys: string[]) => void;
};

const isSubmenuItem = (
  item: NonNullable<SidebarItem>,
): item is SubMenuType<MenuItemType> =>
  item.type === "submenu" || (item.type === undefined && "children" in item);

/**
 * Drill path (submenu keys, root first) leading to the selected leaf.
 * Groups are containers rather than levels, so they never contribute a key.
 * `null` means nothing in this subtree is selected.
 */
const findDrillPath = (
  items: SidebarItem[],
  isSelected: (key: React.Key) => boolean,
): string[] | null => {
  for (const item of items) {
    if (!item || item.type === "divider") continue;

    if (isSubmenuItem(item)) {
      const inner = findDrillPath(item.children, isSelected);
      if (inner) return [item.key, ...inner];
      continue;
    }

    if (item.type === "group") {
      const inner = findDrillPath(item.children ?? [], isSelected);
      if (inner) return inner;
      continue;
    }

    if (isSelected(item.key)) return [];
  }

  return null;
};

const findSubmenu = (
  items: SidebarItem[],
  key: string,
): SubMenuType<MenuItemType> | undefined => {
  for (const item of items) {
    if (!item || item.type === "divider") continue;

    if (isSubmenuItem(item)) {
      if (item.key === key) return item;
      continue;
    }

    if (item.type === "group") {
      const found = findSubmenu(item.children ?? [], key);
      if (found) return found;
    }
  }

  return undefined;
};

/** Walk `openKeys` down the tree; stops early on a key that no longer exists. */
const resolveLevel = (items: SidebarItem[], openKeys: string[]) => {
  let levelItems = items;
  const trail: SubMenuType<MenuItemType>[] = [];

  for (const key of openKeys) {
    const submenu = findSubmenu(levelItems, key);
    if (!submenu) break;
    trail.push(submenu);
    levelItems = submenu.children;
  }

  return { levelItems, trail };
};

const Sidebar = (properties: SidebarProperties) => {
  const [selectKeys] = useMergedState(properties.defaultSelectedKeys ?? [], {
    value: properties.selectedKeys,
  });

  const {
    className,
    classNames,

    itemRender,
    contentRender,

    header,
    footer,
    items = [],
    defaultSelectedKeys: _defaultSelectedKeys,
    selectedKeys: _selectedKeys,
    onSelect,

    mode = "flat",
    openKeys: openKeysProperty,
    defaultOpenKeys,
    onOpenChange,
  } = properties;

  const isDrilldown = mode === "drilldown";
  const isControlled = openKeysProperty !== undefined;

  // Exact match, like Menu/Tree/NavigationMenu. A prefix match would light up
  // every item nested under the selected route (all of /projects/*, say).
  const isSelectedKey = (key: React.Key) => selectKeys.includes(String(key));
  // A section counts as active when the selection lives somewhere inside it.
  const containsSelectedKey = (item: SubMenuType<MenuItemType>) =>
    findDrillPath(item.children, isSelectedKey) !== null;

  const routePath = findDrillPath(items, isSelectedKey) ?? [];

  const [innerOpenKeys, setInnerOpenKeys] = useState<string[]>(
    defaultOpenKeys ?? routePath,
  );
  // The route wins over a manual drill, but only when the route actually
  // changed — otherwise every render would snap the user back out of the level
  // they just opened.
  const routeSignature = routePath.join(" ");
  const [syncedRoute, setSyncedRoute] = useState(routeSignature);
  if (isDrilldown && !isControlled && routeSignature !== syncedRoute) {
    setSyncedRoute(routeSignature);
    setInnerOpenKeys(routePath);
  }

  const openKeys = openKeysProperty ?? innerOpenKeys;
  const setOpenKeys = (next: string[]) => {
    if (!isControlled) setInnerOpenKeys(next);
    onOpenChange?.(next);
  };

  const { levelItems, trail } = isDrilldown
    ? resolveLevel(items, openKeys)
    : { levelItems: items, trail: [] as SubMenuType<MenuItemType>[] };
  const parent = trail.at(-1);

  const renderItems = (items: MenuProperties["items"]) => {
    return items.map((item, index) => {
      if (!item) return <></>;
      if (item.type === "divider") {
        // A plain <li>: SidebarMenu is a <ul>, and Divider treats children as
        // its centre label, so `asChild` there renders a notched rule.
        return (
          <li
            key={index}
            role="separator"
            className={cn("bg-sidebar-border my-1 h-px", item.className)}
          />
        );
      }

      if (item.type === "group") {
        return (
          <SidebarGroup key={index}>
            {item.label && <SidebarGroupLabel>{item.label}</SidebarGroupLabel>}
            <SidebarMenu>{renderItems(item.children ?? [])}</SidebarMenu>
          </SidebarGroup>
        );
      }

      if (isSubmenuItem(item)) {
        if (!isDrilldown) return <></>;

        const { key, label, icon } = item;
        const defaultNode = (
          <>
            {icon}
            <span>{label}</span>
            <Icon
              icon="icon-[lucide--chevron-right]"
              className="ml-auto opacity-60"
            />
          </>
        );
        const content = itemRender
          ? itemRender(item, classNames, defaultNode)
          : defaultNode;
        const asChild = isValidElement(content) && content.type !== Fragment;

        return (
          <SidebarMenuItem key={key}>
            <SidebarMenuButton
              asChild={asChild}
              isActive={containsSelectedKey(item)}
              tooltip={typeof label === "string" ? label : key}
              className={classNames?.menuButton}
              // Slot merges this onto the rendered child, so a submenu whose
              // itemRender returns a <Link> both navigates and drills in.
              onClick={() => setOpenKeys([...openKeys, key])}
            >
              {content}
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      }

      if (item.type === "item" || !("children" in item)) {
        const { key, label, title, icon } = item;
        const mergedLabel = label ?? title;
        const isActive = isSelectedKey(key);

        const defaultNode = (
          <>
            {icon}
            <span>{mergedLabel}</span>
          </>
        );
        const content = itemRender
          ? itemRender(item, classNames, defaultNode)
          : defaultNode;

        // Radix Slot needs exactly one host element — Fragment/string crashes/warns.
        // isValidElement(<></>) === true, so Fragment must be excluded.
        const asChild = isValidElement(content) && content.type !== Fragment;

        return (
          <SidebarMenuItem
            key={key}
            onClick={(event) => {
              onSelect?.({ item: { key, label: mergedLabel }, key, event });
            }}
            onKeyUp={(event) => {
              onSelect?.({ item: { key, label: mergedLabel }, key, event });
            }}
          >
            <SidebarMenuButton
              asChild={asChild}
              isActive={isActive}
              tooltip={
                typeof mergedLabel === "string" ? mergedLabel : key.toString()
              }
              className={classNames?.menuButton}
            >
              {content}
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      }
    });
  };

  const itemNodes = renderItems(levelItems);

  return (
    <ShadcnSidebar collapsible="icon" className={className}>
      <SidebarHeader className={classNames?.header}>{header}</SidebarHeader>
      <SidebarContent>
        {parent && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                aria-label={`Back to ${
                  typeof parent.label === "string" ? parent.label : parent.key
                }`}
                className={classNames?.backButton}
                onClick={() => setOpenKeys(openKeys.slice(0, -1))}
              >
                <Icon icon="icon-[lucide--chevron-left]" />
                <span className="font-medium">
                  {parent.label ?? parent.key}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        {contentRender ? (
          // Flat mode always renders the root, whatever the drill state holds.
          contentRender({ itemNodes, openKeys: isDrilldown ? openKeys : [] })
        ) : levelItems.some((item) => item && item.type === "group") ? (
          itemNodes
        ) : (
          <SidebarMenu>{itemNodes}</SidebarMenu>
        )}
      </SidebarContent>
      <SidebarFooter className={classNames?.footer}>{footer}</SidebarFooter>
    </ShadcnSidebar>
  );
};

export type { SidebarProperties as SidebarProps };
export { Sidebar };
