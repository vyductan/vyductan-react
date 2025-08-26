import type { AliasToken } from "./alias";
import type { ComponentTokenMap } from "./components";

/** Exported by @ant-design/cssinjs */
type TokenType = object;
type TokenMap = Record<PropertyKey, any>;
type GlobalTokenTypeUtil<
  CompTokenMap extends TokenMap,
  AliasToken extends TokenType,
> = AliasToken & CompTokenMap;
type OverrideTokenTypeUtil<
  CompTokenMap extends TokenMap,
  AliasToken extends TokenType,
> = {
  [key in keyof CompTokenMap]: Partial<CompTokenMap[key]> & Partial<AliasToken>;
};

/** Final token which contains the components level override */
export type GlobalToken = GlobalTokenTypeUtil<ComponentTokenMap, AliasToken>;

export type OverrideToken = OverrideTokenTypeUtil<
  ComponentTokenMap,
  AliasToken
>;
