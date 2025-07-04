import type { MapToken } from "./maps";
import type { SeedToken } from "./seeds";

export type TokenType = object;
export type DerivativeFunc<
  DesignToken extends TokenType,
  DerivativeToken extends TokenType,
> = (
  designToken: DesignToken,
  derivativeToken?: DerivativeToken,
) => DerivativeToken;

export type MappingAlgorithm = DerivativeFunc<SeedToken, MapToken>;

export type { GlobalToken } from "./cssinjs-utils";

export { type AliasToken } from "./alias";
export { type SeedToken } from "./seeds";
export { type OverrideToken } from "./cssinjs-utils";
export { type MapToken } from "./maps";
