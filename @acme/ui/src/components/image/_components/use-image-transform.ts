import type React from "react";
import { useRef, useState } from "react";

export type ImageTransform = {
  scale: number;
  rotate: number;
  flipX: number;
  flipY: number;
  offsetX: number;
  offsetY: number;
};

export type TransformAction =
  | "zoomIn"
  | "zoomOut"
  | "rotateLeft"
  | "rotateRight"
  | "flipX"
  | "flipY"
  | "reset"
  | "move";

export type UseImageTransformOptions = {
  /** Lower bound for zooming out. */
  minScale?: number;
  /** Upper bound for zooming in. */
  maxScale?: number;
  /** Each step multiplies or divides by `1 + scaleStep`'s additive amount. */
  scaleStep?: number;
  /** Whether the image can be dragged once it overflows its slot. */
  movable?: boolean;
  onTransform?: (info: {
    transform: ImageTransform;
    action: TransformAction;
  }) => void;
};

const INITIAL_TRANSFORM: ImageTransform = {
  scale: 1,
  rotate: 0,
  flipX: 1,
  flipY: 1,
  offsetX: 0,
  offsetY: 0,
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
};

/**
 * Zoom / rotate / flip / pan state for a single previewed image, shared by
 * every viewer in this folder so the gesture rules only exist once.
 */
export function useImageTransform({
  minScale = 0.2,
  maxScale = 8,
  scaleStep = 0.5,
  movable = true,
  onTransform,
}: UseImageTransformOptions = {}) {
  const [transform, setTransform] = useState<ImageTransform>(INITIAL_TRANSFORM);
  const [isDragging, setIsDragging] = useState(false);
  const dragReference = useRef<DragState | null>(null);

  // The handlers below close over a render's `transform`, so two clicks in the
  // same tick would both read the same stale value and only apply once. Deriving
  // from a ref keeps rapid input compounding, while `onTransform` still fires
  // outside the state updater.
  const latest = useRef<ImageTransform>(INITIAL_TRANSFORM);

  const apply = (
    compute: (previous: ImageTransform) => ImageTransform,
    action: TransformAction,
  ) => {
    const next = compute(latest.current);
    latest.current = next;
    setTransform(next);
    onTransform?.({ transform: next, action });
  };

  const reset = () => apply(() => INITIAL_TRANSFORM, "reset");

  const canZoomIn = transform.scale < maxScale;
  const canZoomOut = transform.scale > minScale;

  const zoomIn = () =>
    apply(
      (previous) => ({
        ...previous,
        scale: Math.min(maxScale, previous.scale + scaleStep),
      }),
      "zoomIn",
    );

  const zoomOut = () =>
    apply((previous) => {
      const scale = Math.max(minScale, previous.scale - scaleStep);
      // At or below 1:1 the image fits again, so a leftover pan would strand it
      // off-centre with no way to drag back.
      const fits = scale <= 1;
      return {
        ...previous,
        scale,
        offsetX: fits ? 0 : previous.offsetX,
        offsetY: fits ? 0 : previous.offsetY,
      };
    }, "zoomOut");

  const rotateLeft = () =>
    apply(
      (previous) => ({ ...previous, rotate: previous.rotate - 90 }),
      "rotateLeft",
    );
  const rotateRight = () =>
    apply(
      (previous) => ({ ...previous, rotate: previous.rotate + 90 }),
      "rotateRight",
    );
  const flipHorizontal = () =>
    apply((previous) => ({ ...previous, flipX: previous.flipX * -1 }), "flipX");
  const flipVertical = () =>
    apply((previous) => ({ ...previous, flipY: previous.flipY * -1 }), "flipY");

  // Panning only means something once the image overflows its slot.
  const isPannable = movable && transform.scale > 1;

  const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (!isPannable) return;
    // Carousels and drag libraries listen on an ancestor; letting this bubble
    // would swipe to the next slide instead of panning the current one.
    event.stopPropagation();
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragReference.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: latest.current.offsetX,
      originY: latest.current.offsetY,
    };
    setIsDragging(true);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const drag = dragReference.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.stopPropagation();
    apply(
      (previous) => ({
        ...previous,
        offsetX: drag.originX + (event.clientX - drag.startX),
        offsetY: drag.originY + (event.clientY - drag.startY),
      }),
      "move",
    );
  };

  const onPointerUp = (event: React.PointerEvent<HTMLElement>) => {
    const drag = dragReference.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragReference.current = null;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return {
    transform,
    /**
     * `translate` comes first so a drag moves the image by the same number of
     * screen pixels regardless of the current zoom or angle.
     */
    css: `translate(${transform.offsetX}px, ${transform.offsetY}px) scale(${transform.scale}) rotate(${transform.rotate}deg) scaleX(${transform.flipX}) scaleY(${transform.flipY})`,
    isPannable,
    isDragging,
    canZoomIn,
    canZoomOut,
    reset,
    zoomIn,
    zoomOut,
    rotateLeft,
    rotateRight,
    flipHorizontal,
    flipVertical,
    panHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
  };
}
