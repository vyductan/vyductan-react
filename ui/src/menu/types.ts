interface ItemSharedProps {
  ref?: React.Ref<HTMLLIElement | null>;
  style?: React.CSSProperties;
  className?: string;
}

export type MenuItemType = {
  type?: "item";

  key: React.Key;

  /* Page Title */
  title?: React.ReactNode;

  /* Menu Label */
  label?: React.ReactNode;

  path?: string;

  icon?: React.ReactNode;

  // children?: MenuItemType[];
  children?: never;

  hidden?: boolean;

  // // >>>>> Active
  // onMouseEnter?: MenuHoverEventHandler;
  // onMouseLeave?: MenuHoverEventHandler;
  //
  // // >>>>> Events
  // onClick?: MenuClickEventHandler;
};
export interface MenuItemGroupType extends ItemSharedProps {
  type: "group";
  label?: React.ReactNode;
  children?: MenuItemType[];
}
export interface MenuDividerType extends Omit<ItemSharedProps, "ref"> {
  type: "divider";

  children?: never;
}

export type MenuItemDef = MenuItemType | MenuItemGroupType | MenuDividerType;
