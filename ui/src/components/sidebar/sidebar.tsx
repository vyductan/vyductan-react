"use client";

import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import type { XOR } from "ts-xor";
import { useMergedState } from "@rc-component/util";

import type { MenuItemType, MenuProps } from "../menu";
import { Divider } from "../divider";
import {
  SidebarContent,
  SidebarFooter,
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
    footer?: string;
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
  footer?: ReactNode;
  items?: MenuProps["items"];
  defaultSelectedKeys?: string[];
  selectedKeys?: string[];
  onSelect?: (args: {
    item: MenuItemType;
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
    footer,
    items = [],
    defaultSelectedKeys: _defaultSelectedKeys,
    selectedKeys: _selectedKeys,
    onSelect,
  } = props;

  const renderItems = (items: MenuProps["items"]) => {
    return items.map((item, index) => {
      if (!item) return <></>;
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
            <SidebarMenu>{renderItems(item.children ?? [])}</SidebarMenu>
          </SidebarGroup>
        );
      }
      if (item.type === "submenu") {
        return <></>;
      }

      /* Item type Render */
      // if (item.hidden) {
      //   return;
      // }
      const { key, label, title } = item;
      const mergedLabel = label ?? title;
      const isActive = selectKeys.some((x) => key.toString().startsWith(x));
      let labelToRender: ReactNode = mergedLabel;
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
      <SidebarFooter className={classNames?.footer}>{footer}</SidebarFooter>
    </SidebarRoot>
  );
};

export { Sidebar };
