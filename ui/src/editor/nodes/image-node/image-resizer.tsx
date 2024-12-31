/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type { LexicalEditor } from "lexical";
import * as React from "react";

import { cn } from "../../..";
import { Icon } from "../../../icons";
import { Tooltip } from "../../../tooltip";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

const Direction = {
  east: Math.trunc(1),
  north: 1 << 3,
  south: 1 << 1,
  west: 1 << 2,
};

export default function ImageResizer({
  onResizeStart,
  onResizeEnd,
  buttonRef,
  imageRef,
  maxWidth,
  editor,
  showCaption,
  setShowCaption,
  captionsEnabled,
}: {
  editor: LexicalEditor;
  buttonRef: { current: null | HTMLButtonElement };
  imageRef: { current: null | HTMLElement };
  maxWidth?: number;
  onResizeEnd: (width: "inherit" | number, height: "inherit" | number) => void;
  onResizeStart: () => void;
  setShowCaption: (show: boolean) => void;
  showCaption: boolean;
  captionsEnabled: boolean;
}): React.JSX.Element {
  const controlWrapperRef = React.useRef<HTMLDivElement>(null);
  const userSelect = React.useRef({
    priority: "",
    value: "default",
  });
  const positioningRef = React.useRef<{
    currentHeight: "inherit" | number;
    currentWidth: "inherit" | number;
    direction: number;
    isResizing: boolean;
    ratio: number;
    startHeight: number;
    startWidth: number;
    startX: number;
    startY: number;
  }>({
    currentHeight: 0,
    currentWidth: 0,
    direction: 0,
    isResizing: false,
    ratio: 0,
    startHeight: 0,
    startWidth: 0,
    startX: 0,
    startY: 0,
  });
  const editorRootElement = editor.getRootElement();
  // Find max width, accounting for editor padding.
  const maxWidthContainer =
    maxWidth ??
    (editorRootElement === null
      ? 100
      : editorRootElement.getBoundingClientRect().width - 20);
  const maxHeightContainer =
    editorRootElement === null
      ? 100
      : editorRootElement.getBoundingClientRect().height - 20;

  const minWidth = 100;
  const minHeight = 100;

  const setStartCursor = (_direction: number) => {
    // const ew = direction === Direction.east || direction === Direction.west;
    // const ns = direction === Direction.north || direction === Direction.south;
    // const nwse =
    //   (direction & Direction.north && direction & Direction.west) ||
    //   (direction & Direction.south && direction & Direction.east);
    //
    // const cursorDir = ew ? "ew" : ns ? "ns" : nwse ? "nwse" : "nesw";

    if (editorRootElement !== null) {
      editorRootElement.style.setProperty(
        "cursor",
        // `${cursorDir}-resize`,
        `col-resize`,
        "important",
      );
      editorRootElement.style.setProperty("display", "block");
    }
    if (document.body !== null) {
      document.body.style.setProperty(
        "cursor",
        // `${cursorDir}-resize`,
        `col-resize`,
        "important",
      );
      userSelect.current.value = document.body.style.getPropertyValue(
        "-webkit-user-select",
      );
      userSelect.current.priority = document.body.style.getPropertyPriority(
        "-webkit-user-select",
      );
      document.body.style.setProperty(
        "-webkit-user-select",
        `none`,
        "important",
      );
    }
  };

  const setEndCursor = () => {
    if (editorRootElement !== null) {
      editorRootElement.style.setProperty("cursor", "text");
    }
    if (document.body !== null) {
      document.body.style.setProperty("cursor", "default");
      document.body.style.setProperty(
        "-webkit-user-select",
        userSelect.current.value,
        userSelect.current.priority,
      );
    }
  };

  const handlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
    direction: number,
  ) => {
    if (!editor.isEditable()) {
      return;
    }

    const image = imageRef.current;
    const controlWrapper = controlWrapperRef.current;

    if (image !== null && controlWrapper !== null) {
      event.preventDefault();
      const { width, height } = image.getBoundingClientRect();
      const positioning = positioningRef.current;
      positioning.startWidth = width;
      positioning.startHeight = height;
      positioning.ratio = width / height;
      positioning.currentWidth = width;
      positioning.currentHeight = height;
      positioning.startX = event.clientX;
      positioning.startY = event.clientY;
      positioning.isResizing = true;
      positioning.direction = direction;

      setStartCursor(direction);
      onResizeStart();

      controlWrapper.classList.add(...cn("block touch-none").split(" "));
      controlWrapper.classList.remove(...cn("hidden").split(" "));
      image.style.height = `${height}px`;
      image.style.width = `${width}px`;

      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
    }
  };
  const handlePointerMove = (event: PointerEvent) => {
    const image = imageRef.current;
    const positioning = positioningRef.current;

    const isHorizontal =
      positioning.direction & (Direction.east | Direction.west);
    const isVertical =
      positioning.direction & (Direction.south | Direction.north);

    if (image !== null && positioning.isResizing) {
      // Corner cursor
      if (isHorizontal && isVertical) {
        let diff = Math.floor(positioning.startX - event.clientX);
        diff = positioning.direction & Direction.east ? -diff : diff;

        const width = clamp(
          positioning.startWidth + diff,
          minWidth,
          maxWidthContainer,
        );

        const height = width / positioning.ratio;
        image.style.width = `${width}px`;
        image.style.height = `${height}px`;
        positioning.currentHeight = height;
        positioning.currentWidth = width;
      } else if (isVertical) {
        let diff = Math.floor(positioning.startY - event.clientY);
        diff = positioning.direction & Direction.south ? -diff : diff;

        const height = clamp(
          positioning.startHeight + diff,
          minHeight,
          maxHeightContainer,
        );

        image.style.height = `${height}px`;
        positioning.currentHeight = height;
      } else {
        let diff = Math.floor(positioning.startX - event.clientX);
        diff = positioning.direction & Direction.east ? -diff : diff;

        const width = clamp(
          positioning.startWidth + diff,
          minWidth,
          maxWidthContainer,
        );

        image.style.width = `${width}px`;
        positioning.currentWidth = width;
      }
    }
  };
  const handlePointerUp = () => {
    const image = imageRef.current;
    const positioning = positioningRef.current;
    const controlWrapper = controlWrapperRef.current;
    if (image !== null && controlWrapper !== null && positioning.isResizing) {
      const width = positioning.currentWidth;
      const height = positioning.currentHeight;
      positioning.startWidth = 0;
      positioning.startHeight = 0;
      positioning.ratio = 0;
      positioning.startX = 0;
      positioning.startY = 0;
      positioning.currentWidth = 0;
      positioning.currentHeight = 0;
      positioning.isResizing = false;

      controlWrapper.classList.remove(...cn("block touch-none").split(" "));
      controlWrapper.classList.add(...cn("hidden").split(" "));

      setEndCursor();
      onResizeEnd(width, height);

      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    }
  };
  return (
    <div ref={controlWrapperRef} className="hidden group-hover:block">
      {!showCaption && captionsEnabled && (
        <button
          className="absolute inset-x-0 bottom-2 text-center"
          ref={buttonRef}
          onClick={() => {
            setShowCaption(!showCaption);
          }}
        >
          Add Caption
        </button>
      )}
      <div
        className={cn(
          "absolute right-1 top-1 flex divide-x divide-white/50",
          "text-white",
        )}
      >
        <Tooltip title="Caption">
          <div className="flex size-6 cursor-pointer items-center justify-center bg-gray-900/50 first:rounded-l hover:bg-gray-700/50">
            <Icon icon="material-symbols:closed-caption-outline" />
          </div>
        </Tooltip>
        <Tooltip title="Download">
          <div className="flex size-6 cursor-pointer items-center justify-center bg-gray-900/50 last:rounded-r hover:bg-gray-700/50">
            <Icon icon="humbleicons:download" />
          </div>
        </Tooltip>
      </div>
      <div
        className={cn(
          "-right-2 bottom-[48%]",
          "absolute h-10 w-2 cursor-col-resize bg-gray-400",
          "hover:bg-gray-500",
        )}
        onPointerDown={(event) => {
          handlePointerDown(event, Direction.south | Direction.west);
        }}
      />
      <div
        className={cn(
          "-left-2 bottom-[48%]",
          "absolute h-10 w-2 cursor-col-resize bg-gray-400",
          "hover:bg-gray-500",
        )}
        onPointerDown={(event) => {
          handlePointerDown(event, Direction.south | Direction.west);
        }}
      />
    </div>
  );
}
