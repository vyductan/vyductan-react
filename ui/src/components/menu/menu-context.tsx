import * as React from "react";

import type { DirectionType } from "../config-provider/context";

export interface MenuContextProps {
  inlineCollapsed: boolean;
  direction?: DirectionType;
  // theme?: MenuTheme;
  firstLevel: boolean;
  /** @internal Safe to remove */
  disableMenuItemTitleTooltip?: boolean;
}

const MenuContext = React.createContext<MenuContextProps>({
  firstLevel: true,
  inlineCollapsed: false,
});

export default MenuContext;
