import type { VariantProps } from "tailwind-variants";

import type { inputSizeVariants } from "./input";

export type AnyObject = Record<PropertyKey, any>;

export type Direction = "ltr" | "rtl";

export type Placement =
  | "bottom"
  | "bottomLeft"
  | "bottomRight"
  | "top"
  | "topLeft"
  | "topRight";
export type AlignPointTopBottom = "t" | "b" | "c";
export type AlignPointLeftRight = "l" | "r" | "c";
/** Two char of 't' 'b' 'c' 'l' 'r'. Example: 'lt' */
export type AlignPoint = `${AlignPointTopBottom}${AlignPointLeftRight}`;
// export type OffsetType = number | `${number}%`;
export type OffsetType = number;

export interface AlignType {
  /**
   * move point of source node to align with point of target node.
   * Such as ['tr','cc'], align top right point of source node with center point of target node.
   * Point can be 't'(top), 'b'(bottom), 'c'(center), 'l'(left), 'r'(right) */
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  points?: (string | AlignPoint)[];
  /**
   * @private Do not use in your production code
   */
  _experimental?: Record<string, any>;
  /**
   * offset source node by offset[0] in x and offset[1] in y.
   * If offset contains percentage string value, it is relative to sourceNode region.
   */
  offset?: OffsetType[];
  /**
   * offset target node by offset[0] in x and offset[1] in y.
   * If targetOffset contains percentage string value, it is relative to targetNode region.
   */
  targetOffset?: OffsetType[];
  /**
   * If adjustX field is true, will adjust source node in x direction if source node is invisible.
   * If adjustY field is true, will adjust source node in y direction if source node is invisible.
   */
  overflow?: {
    adjustX?: boolean | number;
    adjustY?: boolean | number;
    shiftX?: boolean | number;
    shiftY?: boolean | number;
  };
  /** Auto adjust arrow position */
  autoArrow?: boolean;
  /**
   * Config visible region check of html node. Default `visible`:
   *  - `visible`:
   *    The visible region of user browser window.
   *    Use `clientHeight` for check.
   *    If `visible` region not satisfy, fallback to `scroll`.
   *  - `scroll`:
   *    The whole region of the html scroll area.
   *    Use `scrollHeight` for check.
   *  - `visibleFirst`:
   *    Similar to `visible`, but if `visible` region not satisfy, fallback to `scroll`.
   */
  htmlRegion?: "visible" | "scroll" | "visibleFirst";
  /**
   * Auto chose position with `top` or `bottom` by the align result
   */
  dynamicInset?: boolean;
  /**
   * Whether use css right instead of left to position
   */
  useCssRight?: boolean;
  /**
   * Whether use css bottom instead of top to position
   */
  useCssBottom?: boolean;
  /**
   * Whether use css transform instead of left/top/right/bottom to position if browser supports.
   * Defaults to false.
   */
  useCssTransform?: boolean;
  ignoreShake?: boolean;
}

// export type SizeType = "sm" | "md" | "lg" | undefined;
export type SizeType = VariantProps<typeof inputSizeVariants>["size"];

// export const Variants = ["outlined", "borderless", "filled"] as const;

// export type Variant = (typeof Variants)[number];
