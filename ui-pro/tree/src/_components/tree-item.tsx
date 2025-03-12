// TreeItem.tsx
import type { UniqueIdentifier } from "@dnd-kit/core";
import type { AnimateLayoutChanges } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { Icon } from "@acme/ui/icons";

import type { TreeDataNode } from "../types";
import { iOS } from "../utils";
import { HandleButton } from "./handle";

const animateLayoutChanges: AnimateLayoutChanges = ({
  isSorting,
  wasDragging,
}) => (isSorting || wasDragging ? false : true);

type TreeItemProps = Omit<React.ComponentProps<"li">, "id"> &
  Omit<TreeDataNode, "children"> & {
    id: UniqueIdentifier;
    depth: number;
    indentationWidth: number;
    // value: string;

    collapsed?: boolean;
    onCollapse?: () => void;

    onRemove?: () => void;

    /** Dnd clone */
    clone?: boolean;
    indicator?: boolean;
    childCount?: number;

    handler?: boolean;
  };

export function TreeItem({
  id,
  title,

  depth,
  indentationWidth,
  // value,

  collapsed,
  onCollapse,

  onRemove,

  clone,
  indicator,
  childCount,

  handler,

  ...props
}: TreeItemProps) {
  const {
    attributes,
    isDragging,
    isSorting,
    listeners,
    setDraggableNodeRef,
    setDroppableNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    animateLayoutChanges,
  });
  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };
  const handleProps = {
    ...attributes,
    ...listeners,
  };
  const ghost = isDragging;
  const disableInteraction = isSorting;
  const disableSelection = iOS;

  return (
    <li
      data-slot="tree-item"
      role="treeitem"
      className={cn(
        "-mb-px list-none pl-(--spacing-depth)",
        // clone && "pointer-events-none inline-block p-0 pt-[5px] pl-2.5",
        clone && "pointer-events-none p-0 pt-[5px] pl-2.5",
        ghost && [
          indicator && [
            "relative z-10 -mb-px opacity-100",
            // "*:data-[slot=tree-item-content]:relative *:data-[slot=tree-item-content]:bg-red-500",
          ],
          !indicator && "opacity-50",
        ],
        disableInteraction && "pointer-events-none",
        disableSelection && "select-none",
      )}
      ref={setDroppableNodeRef}
      style={
        {
          "--spacing-depth": `${indentationWidth * depth}px`,
        } as React.CSSProperties
      }
      {...props}
    >
      <div
        data-slot="tree-item-content"
        className={cn(
          "relative flex items-center border bg-white px-2.5 py-[10px]",
          // clone && "rounded-sm py-[5px] pr-6 shadow",
          ghost && [
            indicator && [
              "relative h-2 border-blue-500 bg-blue-300 p-0",
              "before:absolute before:-top-1 before:-left-2 before:block before:h-3 before:w-3 before:rounded-full before:border before:border-blue-500 before:bg-white",
              "*:height-0 *:opacity-0",
            ],
            // "*:bg-transparent *:shadow-none",
          ],
        )}
        ref={setDraggableNodeRef}
        style={style}
        onClick={() => {
          onCollapse?.();
        }}
        {...handleProps}
      >
        {handler && <HandleButton {...handleProps} />}
        <Icon
          icon="icon-[lucide--chevron-right]"
          className={cn(
            "aease-[ease] transition-[200]",
            collapsed && "rotate-90",
            !onCollapse && "invisible",
          )}
        />
        {/* {onCollapse && ( */}
        {/*   <Icon */}
        {/*     icon="icon-[lucide--chevron-right]" */}
        {/*     className={cn( */}
        {/*       "aease-[ease] transition-[200]", */}
        {/*       collapsed && "rotate-90", */}
        {/*     )} */}
        {/*   /> */}
        {/* )} */}
        {/* {onCollapse && ( */}
        {/*   <Button */}
        {/*     variant="ghost" */}
        {/*     onClick={(event) => { */}
        {/*       console.log("eee", event); */}
        {/*       event.stopPropagation(); */}
        {/*       onCollapse(); */}
        {/*     }} */}
        {/*     icon={ */}
        {/*       <Icon */}
        {/*         icon="icon-[lucide--chevron-right]" */}
        {/*         className={cn( */}
        {/*           "aease-[ease] transition-[200]", */}
        {/*           collapsed && "rotate-90", */}
        {/*         )} */}
        {/*       /> */}
        {/*     } */}
        {/*   /> */}
        {/* )} */}
        <span className="grow-1 overflow-hidden pl-2 text-ellipsis whitespace-nowrap">
          {title}
        </span>
        {!clone && onRemove && (
          <Button
            variant="ghost"
            onClick={onRemove}
            icon={<Icon icon="icon-[lucide--x]" />}
          />
        )}
        {clone && childCount && childCount > 1 ? (
          <span
            className={cn(
              "text-primay absolute -top-2.5 -right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-300 text-sm font-semibold",
              clone && "select-none",
            )}
          >
            {childCount}
          </span>
        ) : (
          <></>
        )}
      </div>
    </li>
  );
}
