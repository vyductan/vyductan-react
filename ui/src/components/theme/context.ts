import React from "react";

import type { AliasToken } from "./interface/alias";
import defaultSeedToken from "./themes/seed";

// ================================ Context =================================
// To ensure snapshot stable. We disable hashed in test env.
export const defaultConfig = {
  token: defaultSeedToken,
  override: { override: defaultSeedToken },
  hashed: true,
};

export interface DesignTokenProviderProps {
  token: Partial<AliasToken>;
  // theme?: Theme<SeedToken, MapToken>;
  // components?: ComponentsToken;
  /** Just merge `token` & `override` at top to save perf */
  // override: { override: Partial<AliasToken> } & ComponentsToken;
  // hashed?: string | boolean;
  // cssVar?: {
  //   prefix?: string;
  //   key?: string;
  // };
}

export const DesignTokenContext =
  React.createContext<DesignTokenProviderProps>(defaultConfig);
