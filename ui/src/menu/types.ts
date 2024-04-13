export type MenuItemDef = {
  key?: string;
  label?: React.ReactNode;
  // Set display title for collapsed item
  title?: React.ReactNode;
  children?: MenuItemDef[];
};
