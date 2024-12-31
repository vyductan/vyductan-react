// https://github.com/clauderic/dnd-kit/blob/master/stories/components/Item/Item.tsx
// May 20, 2022
//
import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
  UniqueIdentifier,
} from "@dnd-kit/core";
import type { Transform } from "@dnd-kit/utilities";
import React, { useEffect } from "react";

import { cn } from "../..";
import { Button } from "../../button";
import { Icon } from "../../icons";
import { Remove } from "./remove";

export interface ItemProps {
  id: UniqueIdentifier;
  children: React.ReactNode;

  attributes?: DraggableAttributes;
  listeners?: DraggableSyntheticListeners;

  className?: string;

  dragOverlay?: boolean;
  color?: string;
  disabled?: boolean;
  dragging?: boolean;
  handle?: boolean;
  handleProps?: any;
  // height?: number;
  index: number;
  fadeIn?: boolean;
  transform?: Transform | null;
  sorting?: boolean;
  style?: React.CSSProperties;
  transition?: string | null;
  wrapperStyle?: React.CSSProperties;
  // value: React.ReactNode;
  onRemove?: () => void;
  renderItem?(args: {
    props: {
      ref: React.Ref<HTMLLIElement>;
      style: React.CSSProperties | undefined;
    };
    id: UniqueIdentifier;
    dragOverlay: boolean;
    dragging: boolean;
    sorting: boolean;
    index: number;
    fadeIn: boolean;
    listeners: DraggableSyntheticListeners;
    transform: ItemProps["transform"];
    transition: ItemProps["transition"];
    children: ItemProps["children"];
    nodes?: {
      Handle?: React.ReactNode;
    };
  }): React.ReactElement<any>;

  adjustScale?: boolean;
}

export const Item = React.memo(
  React.forwardRef<HTMLLIElement, ItemProps>(
    (
      {
        id,
        children,

        attributes,

        className,
        // color,
        dragOverlay,
        dragging,
        disabled,
        fadeIn,
        handle,
        handleProps,
        // height,
        index,
        listeners,

        onRemove,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        renderItem,
        sorting,
        style,
        transition,
        transform,
        // value,
        wrapperStyle,
        // ...props

        adjustScale,
      },
      ref,
    ) => {
      useEffect(() => {
        if (!dragOverlay) {
          return;
        }

        document.body.style.cursor = "grabbing";

        return () => {
          document.body.style.cursor = "";
        };
      }, [dragOverlay]);

      const HandleComp = handle ? (
        <Button
          variant="ghost"
          icon={<Icon icon="icon-[octicon--grabber-16]" />}
          {...handleProps}
          {...listeners}
        />
      ) : undefined;

      const liStyle = {
        // ...wrapperStyle,
        transition: [transition, wrapperStyle?.transition]
          .filter(Boolean)
          .join(", "),
        "--translate-x": transform ? `${Math.round(transform.x)}px` : undefined,
        "--translate-y": transform ? `${Math.round(transform.y)}px` : undefined,
        "--scale-x": transform?.scaleX ? `${transform.scaleX}` : undefined,
        "--scale-y": transform?.scaleY ? `${transform.scaleY}` : undefined,
        "--index": index,
        // "--color": color,
        transform:
          "translate3d(var(--translate-x, 0), var(--translate-y, 0), 0) scaleX(var(--scale-x, 1)) scaleY(var(--scale-y, 1)) scale(var(--scale, 1))",
        transformOrigin: "0 0",
        touchAction: "manipulation",

        ...(dragOverlay
          ? {
              "--scale": adjustScale ? 1.05 : 1,
              zIndex: 999,
            }
          : {}),

        // boxShadow:
        //   "0 0 0 calc(1px / var(--scale-x, 1)) rgba(63, 63, 68, 0.05), 0 1px calc(3px / var(--scale-x, 1)) 0 rgba(34, 33, 81, 0.15)",
      } as React.CSSProperties;

      return renderItem ? (
        renderItem({
          props: {
            ref,
            style: liStyle,
          },
          id,
          index,
          children,
          nodes: {
            Handle: HandleComp,
          },
          dragOverlay: Boolean(dragOverlay),
          dragging: Boolean(dragging),
          sorting: Boolean(sorting),
          fadeIn: Boolean(fadeIn),
          listeners,
          transform,
          transition,
        })
      ) : (
        <li
          // className={cn(
          //   "flex",
          //   // styles.Wrapper
          //   // fadeIn && styles.fadeIn,
          //   // sorting && styles.sorting,
          //   // dragOverlay && styles.dragOverlay
          // )}
          className={cn(
            "relative flex grow items-center justify-between p-4",
            "rounded-md border",
            disabled &&
              "cursor-not-allowed bg-background-muted text-foreground-muted",
            handle ? "!cursor-default" : "",

            // styles.Item,
            // dragging && styles.dragging,
            // handle && styles.withHandle,
            // dragOverlay && styles.dragOverlay,
            // disabled && styles.disabled,
            // color && styles.color
            className,
          )}
          style={style}
          data-cypress="draggable-item"
          {...attributes}
          {...(handle ? undefined : listeners)}
          //{...props}
          tabIndex={handle ? undefined : 0}
          // style={
          //   {
          //     ...wrapperStyle,
          //     transition: [transition, wrapperStyle?.transition]
          //       .filter(Boolean)
          //       .join(", "),
          //     "--translate-x": transform
          //       ? `${Math.round(transform.x)}px`
          //       : undefined,
          //     "--translate-y": transform
          //       ? `${Math.round(transform.y)}px`
          //       : undefined,
          //     "--scale-x": transform?.scaleX
          //       ? `${transform.scaleX}`
          //       : undefined,
          //     "--scale-y": transform?.scaleY
          //       ? `${transform.scaleY}`
          //       : undefined,
          //     "--index": index,
          //     "--color": color,
          //   } as React.CSSProperties
          // }
          ref={ref}
        >
          {/* <div */}
          {/*   className={cn( */}
          {/*     "relative flex grow items-center justify-between p-4", */}
          {/*     "rounded-md border", */}
          {/*     disabled && */}
          {/*       "cursor-not-allowed bg-background-muted text-foreground-muted", */}
          {/**/}
          {/*     // styles.Item, */}
          {/*     // dragging && styles.dragging, */}
          {/*     // handle && styles.withHandle, */}
          {/*     // dragOverlay && styles.dragOverlay, */}
          {/*     // disabled && styles.disabled, */}
          {/*     // color && styles.color */}
          {/*   )} */}
          {/*   style={style} */}
          {/*   data-cypress="draggable-item" */}
          {/*   {...(handle ? undefined : listeners)} */}
          {/*   {...props} */}
          {/*   tabIndex={handle ? undefined : 0} */}
          {/* > */}
          {children}
          <span className={cn("flex items-center gap-2")}>
            {onRemove ? (
              <Remove
                // className={styles.Remove}
                onClick={onRemove}
              />
            ) : undefined}
            {HandleComp}
          </span>
          {/* </div> */}
        </li>
      );
    },
  ),
);
