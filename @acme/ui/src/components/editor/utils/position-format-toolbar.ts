/** Space between the selection and the bar. */
const GAP = 8;
/**
 * Below a touch selection the bar clears the selection handles that hang
 * under its last line (~20px on iOS and Android).
 */
const TOUCH_GAP = 28;
/** The link editor opens under a link; the bar goes further down to clear it. */
const LINK_GAP = 80;
/** How far the bar may start left of the selection. */
const HORIZONTAL_OFFSET = 5;
/** Kept clear of the viewport's edges. */
const VIEWPORT_MARGIN = 8;

export type FormatToolbarPlacement = "top" | "bottom";

/**
 * The horizontal room the bar has, in viewport pixels: from just before where
 * the text starts (`minLeft`) — never over the handle gutter to its left — to
 * the scroller's right edge, both kept inside the viewport.
 */
export function getFormatToolbarBounds(
  scroller: HTMLElement,
  minLeft: number,
): { left: number; right: number } {
  const viewportWidth = document.documentElement.clientWidth;
  return {
    left: Math.max(minLeft - HORIZONTAL_OFFSET, VIEWPORT_MARGIN),
    right: Math.min(
      scroller.getBoundingClientRect().right,
      viewportWidth - VIEWPORT_MARGIN,
    ),
  };
}

/**
 * Places the floating format toolbar for a selection and returns which side
 * of it the bar took.
 *
 * Above the selection, as Notion does, flipping below when there is no room
 * above inside both the editor's scroller and the viewport. A selection made
 * by touch prefers below: phones draw their own copy/paste menu above it, and
 * a bar on top of that menu fights it for the same taps.
 *
 * Horizontally it starts at the selection and is clamped into
 * `getFormatToolbarBounds`.
 */
export function positionFormatToolbar({
  selectionRect,
  toolbar,
  anchor,
  scroller,
  minLeft,
  preferBelow = false,
  isLink = false,
}: {
  selectionRect: DOMRect;
  toolbar: HTMLElement;
  anchor: HTMLElement;
  scroller: HTMLElement;
  minLeft: number;
  preferBelow?: boolean;
  isLink?: boolean;
}): FormatToolbarPlacement {
  const bar = toolbar.getBoundingClientRect();
  const anchorRect = anchor.getBoundingClientRect();
  const scrollerRect = scroller.getBoundingClientRect();
  const viewportHeight = window.innerHeight;

  const topBound = Math.max(scrollerRect.top, 0);
  const bottomBound = Math.min(scrollerRect.bottom, viewportHeight);

  const aboveTop = selectionRect.top - bar.height - GAP;
  const belowTop =
    selectionRect.bottom + (isLink ? LINK_GAP : preferBelow ? TOUCH_GAP : GAP);
  const fitsAbove = aboveTop >= topBound;
  const fitsBelow = belowTop + bar.height <= bottomBound;

  let placement: FormatToolbarPlacement;
  if (preferBelow) {
    placement = fitsBelow || !fitsAbove ? "bottom" : "top";
  } else {
    placement = fitsAbove ? "top" : "bottom";
  }
  const top = placement === "top" ? aboveTop : belowTop;

  const { left: leftBound, right: rightBound } = getFormatToolbarBounds(
    scroller,
    minLeft,
  );
  let left = selectionRect.left - HORIZONTAL_OFFSET;
  if (left + bar.width > rightBound) left = rightBound - bar.width;
  // The left edge wins when the bar is wider than the room: it then runs off
  // the right, never over the gutter.
  if (left < leftBound) left = leftBound;

  toolbar.style.opacity = "1";
  toolbar.style.transform = `translate(${left - anchorRect.left}px, ${
    top - anchorRect.top
  }px)`;
  toolbar.dataset.placement = placement;
  return placement;
}
