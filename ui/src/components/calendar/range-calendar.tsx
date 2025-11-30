/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import type { Dayjs } from "dayjs";
import * as React from "react";
import { useEffect, useState } from "react";
import { cn } from "@acme/ui/lib/utils";
import dayjs from "dayjs";

import type { ShadcnCalendarProps } from "./_components";
import { CustomCalendar } from "./_components";

type RangeValueType = [Dayjs | null, Dayjs | null];

type RangeCalendarProps = Pick<ShadcnCalendarProps, "captionLayout"> & {
  value?: RangeValueType | null;
  onChange?: (dates: RangeValueType | null) => void;
  format?: string;
  startMonth?: Date;
  endMonth?: Date;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  disabled?: boolean;
  className?: string;
  onStartMonthChange?: (month: Date) => void;
  onEndMonthChange?: (month: Date) => void;
  fixedWeeks?: boolean;
  activeInput?: "start" | "end" | null;
  hoverPreview?: Dayjs;
  onHoverPreviewChange?: (preview: Dayjs | undefined) => void;
};

const RangeCalendar = (props: RangeCalendarProps) => {
  const {
    value,
    onChange,
    captionLayout,
    startMonth: startMonthProp,
    endMonth: endMonthProp,
    minDate,
    maxDate,
    disabled,
    className,
    onStartMonthChange,
    onEndMonthChange,
    fixedWeeks = true,
    activeInput,
    hoverPreview: externalHoverPreview,
    onHoverPreviewChange,
  } = props;

  // Use external hover preview if provided, otherwise use internal state
  const [internalHoverPreview, setInternalHoverPreview] = useState<
    Dayjs | undefined
  >();
  const hoverPreview = externalHoverPreview ?? internalHoverPreview;
  const setHoverPreview = onHoverPreviewChange ?? setInternalHoverPreview;

  // State for managing months independently
  const [startMonth, setStartMonth] = useState<Date>(() => {
    if (startMonthProp) return startMonthProp;
    if (value?.[0]) return value[0].toDate();
    // Default to next month if no value
    return dayjs().toDate();
  });
  const [endMonth, setEndMonth] = useState<Date>(() => {
    if (endMonthProp) return endMonthProp;
    if (value?.[1]) {
      const endDate = value[1].toDate();
      const startDate = value[0]?.toDate();

      // If start and end are in the same month, show next month
      if (
        startDate &&
        startDate.getFullYear() === endDate.getFullYear() &&
        startDate.getMonth() === endDate.getMonth()
      ) {
        return dayjs(endDate).add(1, "month").toDate();
      }

      return endDate;
    }
    // If we have start value but no end value, show next month from start
    if (value?.[0]) {
      return dayjs(value[0]).add(1, "month").toDate();
    }
    // Default to next month if no value
    return dayjs().add(1, "month").toDate();
  });

  // Update months when value changes
  useEffect(() => {
    if (value?.[0]) {
      setStartMonth(value[0].toDate());
    }

    if (value?.[1]) {
      const startDate = value[0]?.toDate();
      const endDate = value[1].toDate();

      // If start and end are in the same month, show next month
      if (
        startDate &&
        startDate.getFullYear() === endDate.getFullYear() &&
        startDate.getMonth() === endDate.getMonth()
      ) {
        setEndMonth(dayjs(endDate).add(1, "month").toDate());
      } else {
        setEndMonth(endDate);
      }
    }
  }, [value]);

  // Update months when props change
  useEffect(() => {
    if (startMonthProp) {
      setStartMonth(startMonthProp);
    }
  }, [startMonthProp]);

  useEffect(() => {
    if (endMonthProp) {
      setEndMonth(endMonthProp);
    }
  }, [endMonthProp]);

  const handleStartMonthChange = React.useCallback(
    (month: Date) => {
      setStartMonth(month);
      onStartMonthChange?.(month);
    },
    [onStartMonthChange],
  );

  const handleEndMonthChange = React.useCallback(
    (month: Date) => {
      setEndMonth(month);
      onEndMonthChange?.(month);
    },
    [onEndMonthChange],
  );

  const handleStartSelect = React.useCallback(
    (dateRange: { from?: Date; to?: Date } | undefined, triggerDate: Date) => {
      const selectedDate = dayjs(triggerDate);
      const startDate = value?.[0] ?? null;
      const endDate = value?.[1] ?? null;

      // Clear hover preview when selecting
      setHoverPreview(undefined);

      // Handle selection based on active input
      if (activeInput === "end") {
        // Focus end input: set as end date
        if (startDate && selectedDate.isBefore(startDate)) {
          onChange?.([selectedDate, startDate]);
        } else {
          onChange?.([startDate, selectedDate]);
        }
      } else if (activeInput === "start") {
        // Focus start input: set as start date
        if (endDate && selectedDate.isAfter(endDate)) {
          onChange?.([endDate, selectedDate]);
        } else if (endDate && selectedDate.isSame(endDate)) {
          return; // Prevent duplicate values
        } else {
          onChange?.([selectedDate, endDate]);
        }
      } else {
        // No active input: intelligent selection
        if (startDate && endDate && selectedDate.isAfter(endDate)) {
          onChange?.([startDate, selectedDate]);
        } else if (startDate && endDate && selectedDate.isBefore(startDate)) {
          onChange?.([selectedDate, endDate]);
        } else if (startDate && endDate && selectedDate.isSame(endDate)) {
          return; // Prevent duplicate values
        } else {
          onChange?.([selectedDate, endDate]);
        }
      }
    },
    [activeInput, value, onChange, setHoverPreview],
  );

  const handleEndSelect = React.useCallback(
    (dateRange: { from?: Date; to?: Date } | undefined, triggerDate: Date) => {
      const selectedDate = dayjs(triggerDate);
      const startDate = value?.[0] ?? null;
      const endDate = value?.[1] ?? null;

      // Clear hover preview when selecting
      setHoverPreview(undefined);

      // Handle selection based on active input
      if (activeInput === "start") {
        // Focus start input: set as start date
        if (endDate && selectedDate.isAfter(endDate)) {
          onChange?.([endDate, selectedDate]);
        } else {
          onChange?.([selectedDate, endDate]);
        }
      } else if (activeInput === "end") {
        // Focus end input: set as end date
        if (startDate && selectedDate.isBefore(startDate)) {
          onChange?.([selectedDate, startDate]);
        } else if (
          startDate &&
          selectedDate.isSame(startDate) &&
          endDate &&
          !startDate.isSame(endDate)
        ) {
          return; // Prevent duplicate values only if we don't already have duplicate values
        } else {
          onChange?.([startDate, selectedDate]);
        }
      } else {
        // No active input: intelligent selection
        if (startDate && endDate && selectedDate.isBefore(startDate)) {
          onChange?.([selectedDate, endDate]);
        } else if (startDate && endDate && selectedDate.isAfter(endDate)) {
          onChange?.([startDate, selectedDate]);
        } else if (startDate && endDate && selectedDate.isSame(startDate)) {
          return; // Prevent duplicate values
        } else {
          onChange?.([startDate, selectedDate]);
        }
      }
    },
    [activeInput, value, onChange, setHoverPreview],
  );

  const handleStartMouseEnter = React.useCallback(
    (date: Date, modifiers: { disabled?: boolean }) => {
      if (!modifiers.disabled) {
        // Always allow hover on start calendar
        const newHoverDate = dayjs(date);
        // Only set if different from current hover
        if (!hoverPreview?.isSame(newHoverDate, "day")) {
          setHoverPreview(newHoverDate);
        }
      }
    },
    [setHoverPreview, hoverPreview],
  );

  const handleEndMouseEnter = React.useCallback(
    (date: Date, modifiers: { disabled?: boolean }) => {
      if (!modifiers.disabled) {
        // Always allow hover on end calendar
        const newHoverDate = dayjs(date);
        // Only set if different from current hover
        if (!hoverPreview?.isSame(newHoverDate, "day")) {
          setHoverPreview(newHoverDate);
        }
      }
    },
    [setHoverPreview, hoverPreview],
  );

  const handleCalendarMouseLeave = React.useCallback(() => {
    setHoverPreview(undefined);
  }, [setHoverPreview]);

  // Handle mouse leave for entire calendar container
  const handleContainerMouseLeave = React.useCallback(() => {
    setHoverPreview(undefined);
  }, [setHoverPreview]);

  // Memoize selected object to prevent re-renders - use single selected for both calendars
  const selected = React.useMemo(() => {
    // If hovering and we have a hover preview
    if (hoverPreview) {
      const startDate = value?.[0];
      const endDate = value?.[1];

      // Determine if we're hovering on start or end calendar based on which input is focused
      const isStartCalendar =
        activeInput === "start" ||
        (activeInput === "end" && !startDate) ||
        activeInput === null;

      if (isStartCalendar) {
        // Hovering on start calendar
        const actualEndDate =
          startDate && endDate && startDate.isSame(endDate) ? null : endDate;

        if (actualEndDate && hoverPreview.isAfter(actualEndDate)) {
          return { from: actualEndDate.toDate(), to: hoverPreview.toDate() };
        }
        if (actualEndDate && hoverPreview.isSame(actualEndDate)) {
          return { from: startDate?.toDate(), to: actualEndDate.toDate() };
        }
        return { from: hoverPreview.toDate(), to: actualEndDate?.toDate() };
      } else {
        // Hovering on end calendar
        // Special case: if we have duplicate values and focus is on end input,
        // treat the hover as updating the end date
        if (
          startDate &&
          endDate &&
          startDate.isSame(endDate) &&
          activeInput === "end"
        ) {
          // When duplicate values and focusing end input, show hover as end date
          return { from: startDate.toDate(), to: hoverPreview.toDate() };
        }

        const actualStartDate =
          startDate && endDate && startDate.isSame(endDate) ? null : startDate;

        if (actualStartDate && hoverPreview.isBefore(actualStartDate)) {
          return { from: hoverPreview.toDate(), to: actualStartDate.toDate() };
        }
        if (actualStartDate && hoverPreview.isSame(actualStartDate)) {
          return { from: actualStartDate.toDate(), to: endDate?.toDate() };
        }
        return { from: actualStartDate?.toDate(), to: hoverPreview.toDate() };
      }
    }

    // Normal case: show existing range
    if (value?.[0]) {
      const startDate = value[0];
      const endDate = value[1];

      // If we have duplicate values, only show start date
      if (endDate && startDate.isSame(endDate)) {
        return {
          from: startDate.toDate(),
          to: undefined,
        };
      }

      return {
        from: startDate.toDate(),
        to: endDate?.toDate(),
      };
    }

    return;
  }, [value, hoverPreview, activeInput]);

  return (
    <div
      className={cn("flex gap-4", className)}
      style={
        {
          // Reduce gaps between calendar days to prevent mouse leave issues
          "--rdp-cell-size": "32px",
          "--rdp-day_selected": "var(--primary)",
        } as React.CSSProperties
      }
      onMouseLeave={handleContainerMouseLeave}
    >
      {/* Start Date Calendar */}
      <CustomCalendar
        mode="range"
        required
        captionLayout={captionLayout}
        numberOfMonths={1}
        month={startMonth}
        onMonthChange={handleStartMonthChange}
        startMonth={
          minDate?.toDate() ??
          dayjs().subtract(50, "year").startOf("year").toDate()
        }
        endMonth={
          maxDate?.toDate() ?? dayjs().add(50, "year").endOf("year").toDate()
        }
        selected={selected}
        onSelect={handleStartSelect}
        onDayMouseEnter={handleStartMouseEnter}
        onWeeksMouseLeave={handleCalendarMouseLeave}
        disabled={disabled}
        fixedWeeks={fixedWeeks}
      />

      {/* End Date Calendar */}
      <CustomCalendar
        mode="range"
        required
        captionLayout={captionLayout}
        numberOfMonths={1}
        month={endMonth}
        onMonthChange={handleEndMonthChange}
        startMonth={
          minDate?.toDate() ??
          dayjs().subtract(50, "year").startOf("year").toDate()
        }
        endMonth={
          maxDate?.toDate() ?? dayjs().add(50, "year").endOf("year").toDate()
        }
        selected={selected}
        onSelect={handleEndSelect}
        onDayMouseEnter={handleEndMouseEnter}
        onWeeksMouseLeave={handleCalendarMouseLeave}
        disabled={disabled}
        fixedWeeks={fixedWeeks}
      />
    </div>
  );
};

export type { RangeCalendarProps };
export { RangeCalendar };
