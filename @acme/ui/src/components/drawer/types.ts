import type { DrawerRoot } from "./_components";

export type DrawerPlacement = NonNullable<
  React.ComponentProps<typeof DrawerRoot>["direction"]
>;

/** Preset name, px number, or any CSS length (`'50%'`, `'20vw'`). */
export type DrawerSize = "default" | "large" | number | (string & {});

/**
 * Drag-resize callbacks. Mirrors AntD 6's `ResizableConfig`: behaviour only —
 * the `maxSize` constraint stays a top-level prop, as it does there.
 */
export type DrawerResizableConfig = {
  onResizeStart?: () => void;
  onResize?: (size: number) => void;
  onResizeEnd?: () => void;
};
