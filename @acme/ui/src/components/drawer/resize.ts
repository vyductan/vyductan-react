import type { DrawerPlacement, DrawerSize } from "./types";

/**
 * Preset sizes for the `size` prop. `default` keeps the 448px this Drawer has
 * always used — AntD's own preset is 378px, but matching it would silently
 * reflow every existing call site, so the preset name is shared and the number
 * is ours.
 */
const SIZE_PRESETS: Record<string, number> = {
  default: 448,
  large: 736,
};

/**
 * Floor for a drag-resize. AntD exposes no `minSize`, but a drawer dragged to
 * 0 hides its own grip and can't be dragged back, so keep a small floor.
 */
export const MIN_DRAWER_SIZE = 64;

/** `left`/`right` drawers size along the x-axis, `top`/`bottom` along the y-axis. */
export function isHorizontalPlacement(placement: DrawerPlacement) {
  return placement === "left" || placement === "right";
}

/** Resolve `size` (or the deprecated `width`) to a CSS length. */
export function resolveDrawerSize(size: DrawerSize | undefined): string {
  const value = size ?? "default";
  if (typeof value === "string" && value in SIZE_PRESETS)
    return `${SIZE_PRESETS[value]}px`;
  return typeof value === "number" ? `${value}px` : value;
}

/**
 * Pointer delta → size delta. The grip sits on the drawer's inner edge, so the
 * direction that grows the drawer depends on which edge it is anchored to:
 * a `right` drawer grows as the pointer moves left (negative dx).
 */
export function resizeDelta(
  placement: DrawerPlacement,
  dx: number,
  dy: number,
) {
  switch (placement) {
    case "right": {
      return -dx;
    }
    case "left": {
      return dx;
    }
    case "bottom": {
      return -dy;
    }
    case "top": {
      return dy;
    }
  }
}

/** Clamp a dragged size into `[MIN_DRAWER_SIZE, maxSize]`. */
export function clampDrawerSize(next: number, maxSize?: number) {
  const upper = Math.max(maxSize ?? Number.POSITIVE_INFINITY, MIN_DRAWER_SIZE);
  return Math.min(Math.max(next, MIN_DRAWER_SIZE), upper);
}
