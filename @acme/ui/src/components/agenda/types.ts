/**
 * One block of scheduled work.
 *
 * `start`/`end` are real Date instances, not strings — the grid does arithmetic
 * on them every render and re-parsing an ISO string per event per frame is the
 * cheapest thing to get wrong here.
 *
 * `end` must be after `start`. Callers that only have a single instant (a due
 * date, a deadline) should widen it themselves; see `taskToAgendaEvent` in the
 * consuming app for the policy this repo uses.
 */
export interface AgendaEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  /**
   * Any CSS color. Rendered as the block's accent — left border in the time
   * grid, bar fill in the gantt. Falls back to the theme's primary.
   */
  color?: string;
  /**
   * Rendered in the day's all-day strip instead of positioned against the
   * hour axis. Gantt ignores this — every gantt row is day-scale already.
   */
  allDay?: boolean;
  /** Opaque payload handed back to `onEventClick`. */
  meta?: unknown;
}

export type AgendaView = "day" | "week";

/** An event plus the column it was assigned to by the overlap policy. */
export interface PositionedEvent {
  event: AgendaEvent;
  /** 0-based column within the overlap cluster. */
  column: number;
  /** How many columns the cluster was split into. */
  columns: number;
}
