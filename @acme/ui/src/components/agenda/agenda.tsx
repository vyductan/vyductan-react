"use client";

import * as React from "react";
import { format, isSameDay, isToday } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { cn } from "@acme/ui/lib/utils";

import type { AgendaEvent, AgendaView } from "./types";
import type { UseAgendaOptions } from "./use-agenda";
import { Button } from "../button";
import { Segmented } from "../segmented";
import { clipToDay, dayFraction, layoutOverlaps, occursOn } from "./layout";
import { useAgenda } from "./use-agenda";
import { useNow } from "./use-now";

export interface AgendaProps extends UseAgendaOptions {
  events: AgendaEvent[];
  /** First hour on the axis. Events before it are clamped to the top edge. */
  dayStartHour?: number;
  /** Exclusive last hour. 24 = midnight. */
  dayEndHour?: number;
  /** Pixel height of one hour row. Drives the whole vertical scale. */
  hourHeight?: number;
  /** Hide the built-in nav + view switcher when the page supplies its own. */
  hideToolbar?: boolean;
  /** Rendered in the toolbar's right slot, before the view switcher. */
  toolbarExtra?: React.ReactNode;
  onEventClick?: (event: AgendaEvent) => void;
  /** Shown in place of the grid when `events` is empty. */
  empty?: React.ReactNode;
  className?: string;
}

const VIEW_OPTIONS: { label: string; value: AgendaView }[] = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
];

/**
 * Time-grid calendar: an hour axis down the left, one column per visible day,
 * events positioned against the axis and split into columns when they overlap.
 *
 * The grid is one CSS grid with an `auto` gutter column, so the hour labels,
 * the day headers and the all-day strip all share the same column tracks and
 * stay aligned without a single hard-coded width.
 */
export function Agenda({
  events,
  dayStartHour = 7,
  dayEndHour = 22,
  hourHeight = 48,
  hideToolbar = false,
  toolbarExtra,
  onEventClick,
  empty,
  className,
  ...agendaOptions
}: AgendaProps) {
  const { view, setView, days, next, previous, today, date } =
    useAgenda(agendaOptions);

  const hours = React.useMemo(() => {
    const result: number[] = [];
    for (let hour = dayStartHour; hour < dayEndHour; hour++) result.push(hour);
    return result;
  }, [dayStartHour, dayEndHour]);

  const bodyHeight = hours.length * hourHeight;

  const timed = React.useMemo(
    () => events.filter((event) => !event.allDay),
    [events],
  );
  const allDay = React.useMemo(
    () => events.filter((event) => event.allDay),
    [events],
  );
  const hasAllDayRow = allDay.length > 0;

  // Per-day column layout. Multi-day events are clipped to each day first, so
  // the overlap sweep only ever sees blocks that fit inside one column.
  const columns = React.useMemo(
    () =>
      days.map((day) =>
        layoutOverlaps(
          timed
            .filter((event) => occursOn(event, day))
            .map((event) => clipToDay(event, day)),
        ),
      ),
    [days, timed],
  );

  // Blocks render from the CLIPPED event, but their label has to come from the
  // unclipped one: a block for the tail of an overnight job would otherwise
  // claim it starts at 00:00, on a grid whose first row is 07:00.
  const sourceById = React.useMemo(
    () => new Map(timed.map((event) => [event.id, event])),
    [timed],
  );

  const nowOffset = useNowOffset(dayStartHour, dayEndHour, bodyHeight);

  const gridTemplate = `4rem repeat(${days.length}, minmax(0, 1fr))`;

  const rangeLabel =
    view === "day"
      ? format(days[0] ?? date, "EEEE, d MMMM yyyy")
      : `${format(days[0] ?? date, "d MMM")} – ${format(
          days.at(-1) ?? date,
          "d MMM yyyy",
        )}`;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {hideToolbar ? null : (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous period"
              onClick={previous}
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Next period"
              onClick={next}
            >
              <ChevronRightIcon className="size-4" />
            </Button>
            <Button variant="outline" onClick={today}>
              Today
            </Button>
            <span className="ml-2 text-sm font-medium">{rangeLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            {toolbarExtra}
            <Segmented
              options={VIEW_OPTIONS}
              value={view}
              onChange={(value) => setView(value as AgendaView)}
              size="sm"
            />
          </div>
        </div>
      )}

      {events.length === 0 && empty ? (
        empty
      ) : (
        <div className="bg-background overflow-hidden rounded-lg border">
          {/* Day headers — sticky so they survive the body's scroll. */}
          <div
            className="bg-muted/40 sticky top-0 z-20 grid border-b"
            style={{ gridTemplateColumns: gridTemplate }}
          >
            <div className="border-r" />
            {days.map((day) => (
              <div
                key={day.toISOString()}
                className={cn(
                  "flex flex-col items-center gap-0.5 border-r py-2 last:border-r-0",
                  isToday(day) && "bg-primary/5",
                )}
              >
                <span className="text-muted-foreground text-xs uppercase">
                  {format(day, "EEE")}
                </span>
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-sm font-medium",
                    isToday(day) && "bg-primary text-primary-foreground",
                  )}
                >
                  {format(day, "d")}
                </span>
              </div>
            ))}
          </div>

          {hasAllDayRow ? (
            <div
              className="grid border-b"
              style={{ gridTemplateColumns: gridTemplate }}
            >
              <div className="text-muted-foreground border-r px-2 py-1 text-right text-[10px] uppercase">
                All day
              </div>
              {days.map((day) => (
                <div
                  key={day.toISOString()}
                  className="flex flex-col gap-1 border-r p-1 last:border-r-0"
                >
                  {allDay
                    .filter((event) => occursOn(event, day))
                    .map((event) => (
                      <EventChip
                        key={event.id}
                        event={event}
                        onClick={onEventClick}
                      />
                    ))}
                </div>
              ))}
            </div>
          ) : null}

          <div className="max-h-[36rem] overflow-y-auto">
            <div
              className="relative grid"
              style={{ gridTemplateColumns: gridTemplate, height: bodyHeight }}
            >
              {/* Hour gutter */}
              <div className="border-r">
                {hours.map((hour, hourIndex) => (
                  <div
                    key={hour}
                    className="text-muted-foreground relative text-right text-[10px]"
                    style={{ height: hourHeight }}
                  >
                    {/*
                      Labels straddle their hour line, except the first — there
                      is no grid above it to straddle, so half the text would be
                      clipped by the scroll container's top edge.
                    */}
                    <span
                      className={cn(
                        "absolute right-1.5",
                        hourIndex === 0 ? "top-0.5" : "-top-1.5",
                      )}
                    >
                      {format(new Date(2000, 0, 1, hour), "HH:mm")}
                    </span>
                  </div>
                ))}
              </div>

              {days.map((day, dayIndex) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "relative border-r last:border-r-0",
                    isToday(day) && "bg-primary/5",
                  )}
                >
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="border-b last:border-b-0"
                      style={{ height: hourHeight }}
                    />
                  ))}

                  {nowOffset !== null && isSameDay(day, nowOffset.at) ? (
                    <div
                      className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
                      style={{ top: nowOffset.top }}
                    >
                      <span className="bg-destructive -ml-1 size-2 rounded-full" />
                      <span className="bg-destructive h-px flex-1" />
                    </div>
                  ) : null}

                  {columns[dayIndex]?.map(({ event, column, columns: total }) => {
                    const top =
                      dayFraction(event.start, dayStartHour, dayEndHour) *
                      bodyHeight;
                    const bottom =
                      dayFraction(event.end, dayStartHour, dayEndHour) *
                      bodyHeight;
                    // Events ending exactly at midnight clamp to fraction 0 on
                    // the *next* day boundary, which would read as height 0.
                    const end = bottom <= top ? bodyHeight : bottom;

                    return (
                      <EventBlock
                        key={event.id}
                        event={event}
                        source={sourceById.get(event.id) ?? event}
                        onClick={onEventClick}
                        style={{
                          top,
                          height: Math.max(end - top, 18),
                          left: `calc(${(column / total) * 100}% + 2px)`,
                          width: `calc(${100 / total}% - 4px)`,
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function accentStyle(color: string | undefined): React.CSSProperties {
  if (!color) return {};
  return {
    borderLeftColor: color,
    backgroundColor: `color-mix(in oklab, ${color} 18%, transparent)`,
  };
}

function EventBlock({
  event,
  source,
  onClick,
  style,
}: {
  /** Clipped to this day — drives geometry. */
  event: AgendaEvent;
  /** The unclipped event — drives the label. */
  source: AgendaEvent;
  onClick?: (event: AgendaEvent) => void;
  style: React.CSSProperties;
}) {
  const continuesBefore = source.start < event.start;
  const continuesAfter = source.end > event.end;
  const sameDay = !continuesBefore && !continuesAfter;

  return (
    <button
      type="button"
      title={`${source.title} · ${format(source.start, sameDay ? "HH:mm" : "d MMM HH:mm")}–${format(
        source.end,
        sameDay ? "HH:mm" : "d MMM HH:mm",
      )}`}
      onClick={onClick ? () => onClick(source) : undefined}
      className={cn(
        "border-primary bg-primary/15 absolute overflow-hidden rounded-sm border-l-2 px-1.5 py-0.5 text-left text-xs",
        "hover:bg-primary/25 focus-visible:ring-ring transition-colors focus-visible:ring-2 focus-visible:outline-none",
        !onClick && "cursor-default",
      )}
      style={{ ...style, ...accentStyle(event.color) }}
    >
      <span className="block truncate font-medium">{event.title}</span>
      <span className="text-muted-foreground block truncate text-[10px]">
        {continuesBefore ? "↑ " : ""}
        {format(source.start, "HH:mm")}
        {continuesAfter ? " ↓" : ""}
      </span>
    </button>
  );
}

function EventChip({
  event,
  onClick,
}: {
  event: AgendaEvent;
  onClick?: (event: AgendaEvent) => void;
}) {
  return (
    <button
      type="button"
      title={event.title}
      onClick={onClick ? () => onClick(event) : undefined}
      className={cn(
        "border-primary bg-primary/15 truncate rounded-sm border-l-2 px-1.5 py-0.5 text-left text-[11px]",
        "hover:bg-primary/25 transition-colors",
        !onClick && "cursor-default",
      )}
      style={accentStyle(event.color)}
    >
      {event.title}
    </button>
  );
}

/**
 * Pixel offset of "now" within the body, or null when there is no clock yet
 * (server render, hydration) or when the current hour is outside the window.
 */
function useNowOffset(
  dayStartHour: number,
  dayEndHour: number,
  bodyHeight: number,
) {
  const now = useNow();

  return React.useMemo(() => {
    if (!now) return null;
    const hour = now.getHours();
    if (hour < dayStartHour || hour >= dayEndHour) return null;
    return {
      at: now,
      top: dayFraction(now, dayStartHour, dayEndHour) * bodyHeight,
    };
  }, [now, dayStartHour, dayEndHour, bodyHeight]);
}
