"use client";

import * as React from "react";
import {
  addDays,
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  startOfDay,
  startOfWeek,
} from "date-fns";

import type { AgendaView } from "./types";

export interface UseAgendaOptions {
  /** Controlled view. Pair with `onViewChange`. */
  view?: AgendaView;
  defaultView?: AgendaView;
  onViewChange?: (view: AgendaView) => void;
  /** Controlled anchor date — the day in focus, or any day in the week. */
  date?: Date;
  defaultDate?: Date;
  onDateChange?: (date: Date) => void;
  /** 0 = Sunday … 1 = Monday (default, matches the rest of this app). */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

export interface UseAgendaResult {
  view: AgendaView;
  setView: (view: AgendaView) => void;
  date: Date;
  setDate: (date: Date) => void;
  /** The days currently on screen — 1 for `day`, 7 for `week`. */
  days: Date[];
  next: () => void;
  previous: () => void;
  today: () => void;
}

/**
 * Headless state for the agenda: which view, which day, and the resulting day
 * list. Rendering lives in `<Agenda />`; keeping them apart is what lets the
 * project page drive an agenda from its own toolbar.
 *
 * Every field supports controlled and uncontrolled use. Controlled wins when
 * the prop is not `undefined`, so a caller can control the view while leaving
 * the date to the hook.
 */
export function useAgenda(options: UseAgendaOptions = {}): UseAgendaResult {
  const {
    view: controlledView,
    defaultView = "week",
    onViewChange,
    date: controlledDate,
    defaultDate,
    onDateChange,
    weekStartsOn = 1,
  } = options;

  const [uncontrolledView, setUncontrolledView] =
    React.useState<AgendaView>(defaultView);
  // Lazy init: `new Date()` at module/render top-level would differ between the
  // server render and the hydration pass and blow up as a mismatch.
  const [uncontrolledDate, setUncontrolledDate] = React.useState<Date>(
    () => defaultDate ?? startOfDay(new Date()),
  );

  const view = controlledView ?? uncontrolledView;
  const date = controlledDate ?? uncontrolledDate;

  const setView = React.useCallback(
    (next: AgendaView) => {
      if (controlledView === undefined) setUncontrolledView(next);
      onViewChange?.(next);
    },
    [controlledView, onViewChange],
  );

  const setDate = React.useCallback(
    (next: Date) => {
      const normalized = startOfDay(next);
      if (controlledDate === undefined) setUncontrolledDate(normalized);
      onDateChange?.(normalized);
    },
    [controlledDate, onDateChange],
  );

  const days = React.useMemo(() => {
    if (view === "day") return [startOfDay(date)];
    return eachDayOfInterval({
      start: startOfWeek(date, { weekStartsOn }),
      end: endOfWeek(date, { weekStartsOn }),
    });
  }, [date, view, weekStartsOn]);

  const shift = React.useCallback(
    (direction: 1 | -1) => {
      setDate(
        view === "day"
          ? addDays(date, direction)
          : addWeeks(date, direction),
      );
    },
    [date, setDate, view],
  );

  const next = React.useCallback(() => shift(1), [shift]);
  const previous = React.useCallback(() => shift(-1), [shift]);
  const today = React.useCallback(() => setDate(new Date()), [setDate]);

  return { view, setView, date, setDate, days, next, previous, today };
}
