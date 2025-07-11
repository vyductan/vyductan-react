// interface ItemSharedProps {
//   key: React.Key;
//   ref?: React.Ref<HTMLLIElement | null>;
//   style?: React.CSSProperties;
//   className?: string;
//   hidden?: boolean;
// }

// export type MenuItemType = ItemSharedProps & {
//   type?: "item";

//   key: React.Key;

//   /* Page Title */
//   title?: React.ReactNode;

//   /* Menu Label */
//   label?: React.ReactNode;

//   path?: string;

//   icon?: React.ReactNode;

//   children?: MenuItemDef[];

//   // // >>>>> Active
//   // onMouseEnter?: MenuHoverEventHandler;
//   // onMouseLeave?: MenuHoverEventHandler;
//   //
//   // // >>>>> Events
//   // onClick?: MenuClickEventHandler;
// };
// export interface MenuItemGroupType extends ItemSharedProps {
//   type: "group";
//   label?: React.ReactNode;
//   children: MenuItemDef[];
// }
export interface MenuDividerType extends Omit<ItemSharedProps, "ref"> {
  type: "divider";

  children?: never;
}

// export type MenuItemDef = MenuItemType | MenuItemGroupType | MenuDividerType;

interface ItemSharedProps {
  ref?: React.Ref<HTMLLIElement | null>;
  style?: React.CSSProperties;
  className?: string;
}

export interface SubMenuType<T extends MenuItemType = MenuItemType>
  extends ItemSharedProps {
  icon?: React.ReactNode;
  theme?: "dark" | "light";
  children: ItemType<T>[];
  type: "submenu";
  label?: React.ReactNode;
  disabled?: boolean;
  key: string;
  rootClassName?: string;
  itemIcon?: RenderIconType;
  expandIcon?: RenderIconType;
  onMouseEnter?: MenuHoverEventHandler;
  onMouseLeave?: MenuHoverEventHandler;
  popupClassName?: string;
  popupOffset?: number[];
  popupStyle?: React.CSSProperties;
  onClick?: MenuClickEventHandler;
  onTitleClick?: (info: MenuTitleInfo) => void;
  onTitleMouseEnter?: MenuHoverEventHandler;
  onTitleMouseLeave?: MenuHoverEventHandler;
}

export interface MenuItemType extends ItemSharedProps {
  danger?: boolean;
  icon?: React.ReactNode;
  title?: string;
  type?: "item";
  label?: React.ReactNode;
  disabled?: boolean;
  itemIcon?: RenderIconType;
  extra?: React.ReactNode;
  key: React.Key;
  onMouseEnter?: MenuHoverEventHandler;
  onMouseLeave?: MenuHoverEventHandler;
  onClick?: MenuClickEventHandler;
}

export interface MenuItemGroupType<T extends MenuItemType = MenuItemType>
  extends ItemSharedProps {
  type: "group";
  label?: React.ReactNode;
  children?: ItemType<T>[];
  key?: React.Key;
}

export type ItemType<T extends MenuItemType = MenuItemType> =
  | T
  | SubMenuType<T>
  | MenuItemGroupType<T>
  | MenuDividerType
  | null;

export interface RenderIconInfo {
  isSelected?: boolean;
  isOpen?: boolean;
  isSubMenu?: boolean;
  disabled?: boolean;
}
export type RenderIconType =
  | React.ReactNode
  | ((props: RenderIconInfo) => React.ReactNode);
export interface MenuInfo {
  key: string;
  keyPath: string[];
  /** @deprecated This will not support in future. You should avoid to use this */
  item: React.ReactInstance;
  domEvent: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>;
}
export interface MenuTitleInfo {
  key: string;
  domEvent: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>;
}
export type MenuHoverEventHandler = (info: {
  key: string;
  domEvent: React.MouseEvent<HTMLElement>;
}) => void;
export interface SelectInfo extends MenuInfo {
  selectedKeys: string[];
}
export type SelectEventHandler = (info: SelectInfo) => void;
export type MenuClickEventHandler = (info: MenuInfo) => void;
