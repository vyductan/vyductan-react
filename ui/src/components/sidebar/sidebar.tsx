"use client";

import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import type { XOR } from "ts-xor";
import { useMergedState } from "@rc-component/util";

import type { MenuItemDef, MenuItemType } from "../menu";
import { Icon } from "../../icons";
import { Divider } from "../divider";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRoot,
} from "./_component";

type ShadcnSidebarProps = React.ComponentProps<typeof SidebarRoot>;

type OwnSidebarProps = {
  className?: string;
  classNames?: {
    header?: string;
    menuButton?: string;
    icon?: string;
  };

  itemRender?: (
    item: MenuItemType,
    classNames: OwnSidebarProps["classNames"],
    originalNode: ReactNode,
  ) => ReactNode;
  contentRender?: (props: { itemNodes: React.ReactNode }) => React.ReactNode;

  header?: ReactNode;
  items?: MenuItemDef[];
  defaultSelectedKeys?: string[];
  selectedKeys?: string[];
  onSelect?: (args: {
    item: MenuItemDef;
    key: React.Key;
    event: MouseEvent<HTMLLIElement> | KeyboardEvent<HTMLLIElement>;
  }) => void;
};

type SidebarProps = XOR<ShadcnSidebarProps, OwnSidebarProps>;

const Sidebar = (props: SidebarProps) => {
  const [selectKeys] = useMergedState(props.defaultSelectedKeys ?? [], {
    value: props.selectedKeys,
  });

  const isShadcnSidebar = !props.items || !props.itemRender;
  if (isShadcnSidebar) {
    return <SidebarRoot {...(props as ShadcnSidebarProps)} />;
  }

  const {
    className,
    classNames,

    itemRender,
    contentRender,

    header,
    items = [],
    defaultSelectedKeys: _defaultSelectedKeys,
    selectedKeys: _selectedKeys,
    onSelect,
  } = props;

  const renderItems = (items: MenuItemDef[]) => {
    return items.map((item, index) => {
      if (item.type === "divider") {
        return (
          <Divider key={index} role="separator" className="border-t" asChild>
            <li />
          </Divider>
        );
      }

      if (item.type === "group") {
        return (
          <SidebarGroup key={index}>
            {item.label && <SidebarGroupLabel>{item.label}</SidebarGroupLabel>}
            <SidebarMenu>{renderItems(item.children)}</SidebarMenu>
          </SidebarGroup>
        );
      }

      /* Item type Render */
      if (item.hidden) {
        return;
      }
      const { key, children: _, label, title, icon, path } = item;
      const mergedLabel = label ?? title;
      const isActive = selectKeys.some((x) => key.toString().startsWith(x));
      let labelToRender: ReactNode = path ? (
        <a href={`${path}`}>
          {typeof icon === "string" ? (
            <Icon icon={icon} className={classNames?.icon} />
          ) : (
            icon
          )}
          <span>{mergedLabel}</span>
        </a>
      ) : (
        mergedLabel
      );
      labelToRender = itemRender
        ? itemRender(item, classNames, labelToRender)
        : labelToRender;

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
            asChild
            isActive={isActive}
            tooltip={
              typeof mergedLabel === "string" ? mergedLabel : key.toString()
            }
            className={classNames?.menuButton}
          >
            {labelToRender}
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });
  };

  return (
    <SidebarRoot collapsible="icon" className={className}>
      <SidebarHeader className={classNames?.header}>{header}</SidebarHeader>
      <SidebarContent>
        {contentRender
          ? contentRender({ itemNodes: renderItems(items) })
          : renderItems(items)}
      </SidebarContent>
    </SidebarRoot>
  );
};

export { Sidebar };
