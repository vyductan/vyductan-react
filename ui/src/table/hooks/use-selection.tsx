import type { SelectionItem } from "../types";

export const SELECTION_COLUMN = {} as const;
export const SELECTION_ALL = "SELECT_ALL";
export const SELECTION_INVERT = "SELECT_INVERT";
export const SELECTION_NONE = "SELECT_NONE";

export type INTERNAL_SELECTION_ITEM =
  | SelectionItem
  | typeof SELECTION_ALL
  | typeof SELECTION_INVERT
  | typeof SELECTION_NONE;
