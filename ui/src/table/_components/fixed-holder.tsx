/* eslint-disable react-compiler/react-compiler */
/* eslint-disable unicorn/no-negated-condition */
/* eslint-disable unicorn/prefer-at */
/* eslint-disable react-hooks/exhaustive-deps */
import * as React from "react";
import { useMemo } from "react";
import { fillRef } from "@rc-component/util/lib/ref";

import type { AnyObject, Direction } from "../..";
import type { ColumnDef } from "../types";
import type { HeaderProps } from "./table-header";
import { cn } from "../..";
import { useTableStore } from "../hooks/use-table";
import { ColGroup } from "./col-group";

function useColumnWidth(colWidths: readonly number[], columCount: number) {
  return useMemo(() => {
    const cloneColumns: number[] = [];
    for (let i = 0; i < columCount; i += 1) {
      const val = colWidths[i];
      if (val !== undefined) {
        cloneColumns[i] = val;
      } else {
        return null;
      }
    }
    return cloneColumns;
  }, [colWidths.join("_"), columCount]);
}

export interface FixedHeaderProps<RecordType> extends HeaderProps<RecordType> {
  ref: React.Ref<HTMLDivElement>;
  className: string;
  noData: boolean;
  maxContentScroll: boolean;
  colWidths: readonly number[];
  columCount: number;
  direction: Direction;
  fixHeader: boolean;
  stickyTopOffset?: number;
  stickyBottomOffset?: number;
  stickyClassName?: string;
  onScroll: (info: {
    currentTarget: HTMLDivElement;
    scrollLeft?: number;
  }) => void;
  children: (info: HeaderProps<RecordType>) => React.ReactNode;
}

export const FixedHolder = <TRecord extends AnyObject>({
  ref,
  ...props
}: FixedHeaderProps<TRecord>) => {
  //   if (process.env.NODE_ENV !== 'production') {
  //     devRenderTimes(props);
  //   }

  const {
    className,
    noData,
    columns,
    flattenColumns,
    colWidths,
    columCount,
    stickyOffsets,
    direction,
    fixHeader,
    stickyTopOffset,
    stickyBottomOffset,
    stickyClassName,
    onScroll,
    maxContentScroll,
    children,
    ...restProps
  } = props;

  const { scrollbarSize, isSticky, getComponent } = useTableStore((s) => s);
  const TableComponent = getComponent(["header", "table"], "table");

  const combinationScrollBarSize = isSticky && !fixHeader ? 0 : scrollbarSize;

  // Pass wheel to scroll event
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const setScrollRef = React.useCallback((element: HTMLElement) => {
    fillRef(ref, element);
    fillRef(scrollRef, element);
  }, []);

  React.useEffect(() => {
    function onWheel(e: WheelEvent) {
      const { currentTarget, deltaX } =
        e as unknown as React.WheelEvent<HTMLDivElement>;
      if (deltaX) {
        const { scrollLeft, scrollWidth, clientWidth } = currentTarget;
        const maxScrollWidth = scrollWidth - clientWidth;
        let nextScroll = scrollLeft + deltaX;

        if (direction === "rtl") {
          nextScroll = Math.max(-maxScrollWidth, nextScroll);
          nextScroll = Math.min(0, nextScroll);
        } else {
          nextScroll = Math.min(maxScrollWidth, nextScroll);
          nextScroll = Math.max(0, nextScroll);
        }

        onScroll({
          currentTarget,
          scrollLeft: nextScroll,
        });
        e.preventDefault();
      }
    }
    scrollRef.current?.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      scrollRef.current?.removeEventListener("wheel", onWheel);
    };
  }, []);

  // Check if all flattenColumns has width
  const allFlattenColumnsWithWidth = React.useMemo(
    () => flattenColumns.every((column) => column.width),
    [flattenColumns],
  );

  // Add scrollbar column
  const lastColumn = flattenColumns[flattenColumns.length - 1];
  const ScrollBarColumn: ColumnDef<TRecord> & { scrollbar: true } = {
    fixed: lastColumn ? lastColumn.fixed : undefined,
    scrollbar: true,
    // onHeaderCell: () => ({
    //   className: `${prefixCls}-cell-scrollbar`,
    // }),
  };

  const columnsWithScrollbar = useMemo<ColumnDef<TRecord>[]>(
    () => (combinationScrollBarSize ? [...columns, ScrollBarColumn] : columns),
    [combinationScrollBarSize, columns],
  );

  const flattenColumnsWithScrollbar = useMemo(
    () =>
      combinationScrollBarSize
        ? [...flattenColumns, ScrollBarColumn]
        : flattenColumns,
    [combinationScrollBarSize, flattenColumns],
  );

  // Calculate the sticky offsets
  const headerStickyOffsets = useMemo(() => {
    const { start, end } = stickyOffsets;
    return {
      ...stickyOffsets,
      // left:
      //   direction === 'rtl' ? [...left.map(width => width + combinationScrollBarSize), 0] : left,
      // right:
      //   direction === 'rtl' ? right : [...right.map(width => width + combinationScrollBarSize), 0],
      start: start,
      end: [...end.map((width) => width + combinationScrollBarSize), 0],
      isSticky,
    };
  }, [combinationScrollBarSize, stickyOffsets, isSticky]);

  const mergedColumnWidth = useColumnWidth(colWidths, columCount);

  return (
    <div
      style={{
        overflow: "hidden",
        ...(isSticky
          ? { top: stickyTopOffset, bottom: stickyBottomOffset }
          : {}),
      }}
      ref={setScrollRef as React.Ref<HTMLDivElement> | undefined}
      className={cn(className, stickyClassName)}
    >
      <TableComponent
        style={{
          tableLayout: "fixed",
          visibility: noData || mergedColumnWidth ? null : "hidden",
        }}
      >
        {(!noData || !maxContentScroll || allFlattenColumnsWithWidth) && (
          <ColGroup
            colWidths={
              mergedColumnWidth
                ? [...mergedColumnWidth, combinationScrollBarSize]
                : []
            }
            columCount={columCount + 1}
            columns={flattenColumnsWithScrollbar}
          />
        )}
        {children({
          ...restProps,
          stickyOffsets: headerStickyOffsets,
          columns: columnsWithScrollbar,
          flattenColumns: flattenColumnsWithScrollbar,
        })}
      </TableComponent>
    </div>
  );
};
