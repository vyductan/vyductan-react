import React from "react";

import type { AliasToken, GlobalToken } from "./interface";
import { DesignTokenContext } from "./context";
import formatToken from "./util/alias";

export const unitless: {
  [key in keyof AliasToken]?: boolean;
} = {
  // zIndexPopupBase: true,
};

// ================================== Hook ==================================
export default function useToken(): [
  object, // theme: Theme<SeedToken, AliasToken>,
  token: GlobalToken,
  // hashId: string,
  // realToken: GlobalToken,
  // cssVar?: DesignTokenProviderProps['cssVar'],
] {
  const {
    token: rootDesignToken,
    // hashed,
    // theme,
    // override,
    // cssVar,
  } = React.useContext(DesignTokenContext);

  return [
    {},
    formatToken({
      override: rootDesignToken,
    }),
  ];
}
