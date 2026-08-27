"use client";

import * as React from "react";
import {
  addDays,
  differenceInCalendarDays,
  endOfDay,
  format,
  isWeekend,
  startOfDay,
} from "date-fns";

import { cn } from "@acme/ui/lib/utils";

import type { AgendaEvent } from "./types";
import { clamp } from "./layout";
import { useNow } from "./use-now";

export interface GanttItem extends AgendaEvent {
  /** 0–100. Renders as a filled portion of the bar. */
  progress?: number;
  /** Indent level, for parent/child task trees. */
  depth?: number;
}

export interface GanttProps {
  items: GanttItem[];
  /** Days of slack added either side of the data's own range. */
  padDays?: number;
  /** Minimum pixel width per day before the track starts scrolling. */
  dayWidth?: number;
  /** Width of the frozen label column. */
  labelWidth?: number;
  onItemClick?: (item: GanttItem) => void;
  empty?: React.ReactNode;
  className?: string;
}

const ROW_HEIGHT = 32;

/**
 * Day-scale bar chart: one row per item, bars positioned against a shared date
 * axis.
 *
 * Deliberately not recharts. A gantt bar needs a start *and* an end, and a
 * cartesian bar chart only models a magnitude from a baseline — the usual
 * workaround (stack a transparent offset series under a visible duration
 * series) buys a chart library's axis code at the cost of every bar being two
 * fake data points. Positioning a div against a linear date scale is the whole
 * job, and it makes per-row labels, indentation and progress fills trivial.
 */
export function Gantt({
  items,
  padDays = 2,
  dayWidth = 40,
  labelWidth = 220,
  onItemClick,
  empty,
  className,
}: GanttProps) {
  const domain = React.useMemo(() => {
    if (items.length === 0) return null;
    let min = items[0]!.start.getTime();
    let max = items[0]!.end.getTime();
    for (const item of items) {
      min = Math.min(min, item.start.getTime());
      max = Math.max(max, item.end.getTime());
    }
    return {
      start: startOfDay(addDays(new Date(min), -padDays)),
      end: endOfDay(addDays(new Date(max), padDays)),
    };
  }, [items, padDays]);

  const days = React.useMemo(() => {
    if (!domain) return [];
    const count = differenceInCalendarDays(domain.end, domain.start) + 1;
    return Array.from({ length: count }, (_, index) =>
      addDays(domain.start, index),
    );
  }, [domain]);

  // Day scale — the marker only has to move once a day, but a five-minute tick
  // keeps it honest across a midnight rollover without a visible cost.
  const now = useNow(5 * 60_000);

  if (!domain || items.length === 0) {
    return <>{empty ?? null}</>;
  }

  const span = domain.end.getTime() - domain.start.getTime();
  const toPercent = (date: Date) =>
    clamp(((date.getTime() - domain.start.getTime()) / span) * 100, 0, 100);

  const trackWidth = Math.max(days.length * dayWidth, 0);

  return (
    <div className={cn("bg-background rounded-lg border", className)}>
      <div className="overflow-x-auto">
        <div style={{ minWidth: labelWidth + trackWidth }}>
          {/* Axis */}
          <div className="bg-muted/40 sticky top-0 z-10 flex border-b">
            <div
              className="text-muted-foreground shrink-0 border-r px-3 py-2 text-xs font-medium"
              style={{ width: labelWidth }}
            >
              Task
            </div>
            <div className="relative flex flex-1">
              {days.map((day) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "flex flex-1 flex-col items-center border-r py-1 last:border-r-0",
                    isWeekend(day) && "bg-muted/60",
                  )}
                  style={{ minWidth: dayWidth }}
                >
                  <span className="text-muted-foreground text-[10px] uppercase">
                    {format(day, "EEEEE")}
                  </span>
                  <span className="text-[11px]">{format(day, "d/M")}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rows */}
          <div className="relative">
            {now ? (
              <div
                className="bg-destructive/70 pointer-events-none absolute top-0 bottom-0 z-10 w-px"
                style={{
                  left: `calc(${labelWidth}px + (100% - ${labelWidth}px) * ${toPercent(now) / 100})`,
                }}
              />
            ) : null}

            {items.map((item) => (
              <div
                key={item.id}
                className="hover:bg-muted/40 flex border-b transition-colors last:border-b-0"
                style={{ height: ROW_HEIGHT }}
              >
                <div
                  className="flex shrink-0 items-center truncate border-r px-3 text-xs"
                  style={{
                    width: labelWidth,
                    paddingLeft: 12 + (item.depth ?? 0) * 14,
                  }}
                  title={item.title}
                >
                  <span className="truncate">{item.title}</span>
                </div>
                <div className="relative flex-1">
                  {days.map((day) => (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "absolute inset-y-0 border-r",
                        isWeekend(day) && "bg-muted/40",
                      )}
                      style={{
                        left: `${toPercent(startOfDay(day))}%`,
                        width: `${100 / days.length}%`,
                      }}
                    />
                  ))}

                  <button
                    type="button"
                    onClick={onItemClick ? () => onItemClick(item) : undefined}
                    title={`${item.title} · ${format(item.start, "d MMM")} → ${format(item.end, "d MMM")}${
                      item.progress === undefined
                        ? ""
                        : ` · ${Math.round(item.progress)}%`
                    }`}
                    className={cn(
                      "bg-primary/30 border-primary absolute top-1.5 bottom-1.5 overflow-hidden rounded-sm border",
                      "hover:brightness-110",
                      !onItemClick && "cursor-default",
                    )}
                    style={{
                      left: `${toPercent(item.start)}%`,
                      // A same-day task has zero span; floor it so the bar is
                      // still clickable instead of a 0px sliver.
                      width: `max(${toPercent(item.end) - toPercent(item.start)}%, 6px)`,
                      ...(item.color
                        ? {
                            borderColor: item.color,
                            backgroundColor: `color-mix(in oklab, ${item.color} 35%, transparent)`,
                          }
                        : {}),
                    }}
                  >
                    {item.progress === undefined ? null : (
                      <span
                        className="bg-primary/70 absolute inset-y-0 left-0"
                        style={{
                          width: `${clamp(item.progress, 0, 100)}%`,
                          ...(item.color
                            ? { backgroundColor: item.color }
                            : {}),
                        }}
                      />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
