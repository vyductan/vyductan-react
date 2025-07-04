import * as React from "react";

import type { MenuContextProps } from "../menu-context";
import type { SubMenuType } from "../types";
import MenuContext from "../menu-context";

export interface SubMenuProps
  extends Omit<SubMenuType, "ref" | "key" | "children" | "label"> {
  title?: React.ReactNode;
  children?: React.ReactNode;
  /**
   * @deprecated No longer needed, it can now be safely deleted.
   * @see: https://github.com/ant-design/ant-design/pull/30638
   */
  level?: number;
}

export const SubMenu = (props: SubMenuProps) => {
  const context = React.useContext(MenuContext);

  const contextValue = React.useMemo<MenuContextProps>(
    () => ({ ...context, firstLevel: false }),
    [context],
  );
  return (
    <MenuContext.Provider value={contextValue}>
      {props.children}
    </MenuContext.Provider>
  );
};
