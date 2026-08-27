import type { AgendaEvent, PositionedEvent } from "./types";

/**
 * Split overlapping events into side-by-side columns.
 *
 * Two passes, because column *count* is a property of the whole cluster and is
 * not known until the cluster is closed:
 *
 *   1. Sweep events in start order, greedily dropping each into the leftmost
 *      column whose last event has already ended. A cluster stays open while
 *      any of its columns is still occupied; the moment every column is free,
 *      the events seen so far can never overlap anything that follows, so the
 *      cluster is closed and the next event starts a fresh one.
 *   2. Stamp every member of a closed cluster with that cluster's width.
 *
 * Doing it in one pass is the classic bug: an event placed early would be
 * stamped with the column count at the time it was placed, and a later event
 * widening the cluster would leave it rendered too wide, overlapping its
 * neighbour.
 *
 * Zero-length and negative-length events are treated as a point in time — they
 * take a column but release it immediately.
 */
export function layoutOverlaps(events: AgendaEvent[]): PositionedEvent[] {
  const sorted = [...events].sort(
    (a, b) =>
      a.start.getTime() - b.start.getTime() || a.end.getTime() - b.end.getTime(),
  );

  const positioned: PositionedEvent[] = [];
  // Cluster state: end-time per column, and where this cluster began in
  // `positioned` so pass 2 can walk back over exactly its members.
  let columnEnds: number[] = [];
  let clusterStart = 0;

  const closeCluster = (width: number) => {
    for (let index = clusterStart; index < positioned.length; index++) {
      positioned[index]!.columns = width;
    }
  };

  for (const event of sorted) {
    const start = event.start.getTime();
    const end = Math.max(event.end.getTime(), start);

    // Cluster is over only when NO column is still running.
    if (columnEnds.length > 0 && columnEnds.every((columnEnd) => columnEnd <= start)) {
      closeCluster(columnEnds.length);
      columnEnds = [];
      clusterStart = positioned.length;
    }

    let column = columnEnds.findIndex((columnEnd) => columnEnd <= start);
    if (column === -1) {
      column = columnEnds.length;
    }
    columnEnds[column] = end;

    positioned.push({ event, column, columns: 1 });
  }

  closeCluster(columnEnds.length);

  return positioned;
}

/**
 * Fraction of the day (0–1) that `date` sits at, clamped to the visible window.
 *
 * Uses local-time getters deliberately: the grid's hour labels are local, so
 * the offset has to be local too or events drift by the UTC offset.
 */
export function dayFraction(
  date: Date,
  dayStartHour: number,
  dayEndHour: number,
): number {
  const minutes = date.getHours() * 60 + date.getMinutes();
  const windowStart = dayStartHour * 60;
  const windowMinutes = (dayEndHour - dayStartHour) * 60;
  if (windowMinutes <= 0) return 0;
  return clamp((minutes - windowStart) / windowMinutes, 0, 1);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Does `event` intersect the local calendar day containing `day`? */
export function occursOn(event: AgendaEvent, day: Date): boolean {
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  return event.start < dayEnd && event.end > dayStart;
}

/**
 * Clip an event to one calendar day, so a multi-day block renders as a full
 * column on each day it spans rather than one impossible 60-hour block.
 */
export function clipToDay(event: AgendaEvent, day: Date): AgendaEvent {
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const start = event.start < dayStart ? dayStart : event.start;
  const end = event.end > dayEnd ? dayEnd : event.end;
  if (start === event.start && end === event.end) return event;
  return { ...event, start, end };
}
