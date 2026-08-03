import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useMergedState } from "@rc-component/util";

import type {
  ImgInfo,
  PreviewItem,
  PreviewMask,
  ToolbarRenderInfo,
} from "./_components/preview-overlay";
import type {
  ImageTransform,
  TransformAction,
} from "./_components/use-image-transform";
import { PreviewOverlay } from "./_components/preview-overlay";

export type { ImgInfo, PreviewItem, PreviewMask, ToolbarRenderInfo };

export type PreviewGroupType = {
  /** Controlled open state of the preview. */
  open?: boolean;
  /** Controlled index of the previewed item. */
  current?: number;
  onOpenChange?: (open: boolean, info: { current: number }) => void;
  onChange?: (current: number, previousCurrent: number) => void;
  minScale?: number;
  maxScale?: number;
  scaleStep?: number;
  /** Whether the image can be dragged once it is larger than the viewport. */
  movable?: boolean;
  countRender?: (current: number, total: number) => React.ReactNode;
  closeIcon?: React.ReactNode;
  imageRender?: (
    originalNode: React.ReactElement,
    info: { transform: ImageTransform; image: ImgInfo; current: number },
  ) => React.ReactNode;
  actionsRender?: (
    originalNode: React.ReactElement,
    info: ToolbarRenderInfo,
  ) => React.ReactNode;
  mask?: PreviewMask;
  onTransform?: (info: {
    transform: ImageTransform;
    action: TransformAction;
  }) => void;
};

export interface ImagePreviewGroupProps {
  children?: React.ReactNode;
  /**
   * Explicit preview list. When omitted the list is collected from the
   * `<Image>` descendants in mount order.
   */
  items?: (string | PreviewItem)[];
  /** Fallback source inherited by every `<Image>` in the group. */
  fallback?: string;
  /** Preview configuration; `false` disables previewing entirely. */
  preview?: boolean | PreviewGroupType;
}

type PreviewGroupContextValue = {
  enabled: boolean;
  fallback?: string;
  register: (id: string, item: PreviewItem) => void;
  unregister: (id: string) => void;
  openAt: (id: string) => void;
};

const PreviewGroupContext = createContext<PreviewGroupContextValue | null>(
  null,
);

/**
 * Returns the enclosing `Image.PreviewGroup`, or `null` when an `Image` renders
 * on its own. `Image` uses this to decide between the shared overlay and its
 * own single-image preview.
 */
export function useImagePreviewGroup() {
  return useContext(PreviewGroupContext);
}

export function ImagePreviewGroup({
  children,
  items,
  fallback,
  preview = true,
}: ImagePreviewGroupProps) {
  const config: PreviewGroupType = preview === true ? {} : preview || {};
  const enabled = preview !== false;

  // A Map keeps mount order, which is document order for a static list, so the
  // key order doubles as the preview order.
  const [registered, setRegistered] = useState<Map<string, PreviewItem>>(
    () => new Map(),
  );

  const register = useCallback((id: string, item: PreviewItem) => {
    setRegistered((previous) => {
      const existing = previous.get(id);
      if (existing?.src === item.src && existing.alt === item.alt) {
        return previous;
      }
      const next = new Map(previous);
      next.set(id, item);
      return next;
    });
  }, []);

  const unregister = useCallback((id: string) => {
    setRegistered((previous) => {
      if (!previous.has(id)) return previous;
      const next = new Map(previous);
      next.delete(id);
      return next;
    });
  }, []);

  const [open, setOpen] = useMergedState(false, { value: config.open });
  const [current, setCurrent] = useMergedState(0, { value: config.current });

  const previewItems = useMemo(() => {
    if (items) {
      return items.map((entry) =>
        typeof entry === "string" ? { src: entry } : entry,
      );
    }
    return [...registered.values()];
  }, [items, registered]);

  const changeOpen = (next: boolean, index: number) => {
    setOpen(next);
    config.onOpenChange?.(next, { current: index });
  };

  const changeCurrent = (next: number, previousCurrent: number) => {
    setCurrent(next);
    config.onChange?.(next, previousCurrent);
  };

  const openAt = (id: string) => {
    if (!enabled) return;
    const index = [...registered.keys()].indexOf(id);
    // With an explicit `items` list the child count and preview count can
    // differ, so keep the index inside the list that is actually rendered.
    const clamped = Math.min(
      Math.max(index, 0),
      Math.max(previewItems.length - 1, 0),
    );
    setCurrent(clamped);
    changeOpen(true, clamped);
  };

  const contextValue = useMemo<PreviewGroupContextValue>(
    () => ({ enabled, fallback, register, unregister, openAt }),
    // `openAt` closes over the current index and item list, so it is
    // intentionally recreated whenever either changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enabled, fallback, register, unregister, registered, previewItems],
  );

  return (
    <PreviewGroupContext.Provider value={contextValue}>
      {children}
      {enabled && previewItems.length > 0 && (
        <PreviewOverlay
          open={open}
          onOpenChange={(next) => changeOpen(next, current)}
          items={previewItems}
          current={Math.min(current, previewItems.length - 1)}
          onCurrentChange={changeCurrent}
          fallback={fallback}
          minScale={config.minScale}
          maxScale={config.maxScale}
          scaleStep={config.scaleStep}
          movable={config.movable}
          countRender={config.countRender}
          closeIcon={config.closeIcon}
          imageRender={config.imageRender}
          actionsRender={config.actionsRender}
          mask={config.mask}
          onTransform={config.onTransform}
        />
      )}
    </PreviewGroupContext.Provider>
  );
}
