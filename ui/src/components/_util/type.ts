/* eslint-disable @typescript-eslint/no-explicit-any */
/** https://github.com/Microsoft/TypeScript/issues/29729 */
export type LiteralUnion<T extends string> = T | (string & {});

export type AnyObject = Record<PropertyKey, any>;
