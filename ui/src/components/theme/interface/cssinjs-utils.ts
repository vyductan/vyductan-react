/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AliasToken } from "./alias";
import type { ComponentTokenMap } from "./components";

/** Exported by @ant-design/cssinjs */
type TokenType = object;
type TokenMap = Record<PropertyKey, any>;
type GlobalTokenTypeUtil<
  TCompTokenMap extends TokenMap,
  TAliasToken extends TokenType,
> = TAliasToken & TCompTokenMap;
type OverrideTokenTypeUtil<
  TCompTokenMap extends TokenMap,
  TAliasToken extends TokenType,
> = {
  [key in keyof TCompTokenMap]: Partial<TCompTokenMap[key]> &
    Partial<TAliasToken>;
};

/** Final token which contains the components level override */
export type GlobalToken = GlobalTokenTypeUtil<ComponentTokenMap, AliasToken>;

export type OverrideToken = OverrideTokenTypeUtil<
  ComponentTokenMap,
  AliasToken
>;
