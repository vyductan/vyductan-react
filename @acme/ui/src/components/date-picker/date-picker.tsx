// https://github.com/shadcn-ui/ui/blob/805ed4120a6a8ae6f6e9714cbd776e18eeba92c7/apps/www/registry/new-york/example/date-picker-form.tsx
// Nov 6, 2024
// react-day-picker v9
// https://github.com/shadcn-ui/ui/pull/4371
// https://github.com/shadcn-ui/ui/pull/4421
"use client";

import type { Dayjs } from "dayjs";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useMergedState } from "@rc-component/util";
import dayjs from "dayjs";

import { cn } from "@acme/ui/lib/utils";

import type { ShadcnCalendarProps } from "../calendar/_components";
import type { InputRef as InputReference } from "../input";
import type { InputSizeVariants, InputVariants } from "../input/variants";
import type { DisabledDate } from "./types";
import { Icon } from "../../icons";
import { Button } from "../button";
import { Calendar } from "../calendar";
import { CustomCalendarDayButton } from "../calendar/_components";
// For typing DayButton props if needed in future (not strictly required below)
// import type { DayButton as RdpDayButton } from "react-day-picker";
import { useComponentConfig } from "../config-provider/context";
import { Input } from "../input/input";
import { Popover } from "../popover";
import type { TimeSelectOptions } from "../time-picker/_components/time-select";
import { TimeSelect } from "../time-picker/_components/time-select";
import { MonthSelect } from "./month-select";
import { parseInputDate } from "./parse-input-date";
import { YearSelect } from "./year-select";

// type DatePickerValueType = "date" | "string" | "number" | "format";

// type DateType<T extends DatePickerValueType> = T extends "date"
//   ? Date
//   : T extends "number"
//     ? number
//     : string;

export type PanelMode =
  | "time"
  | "date"
  | "week"
  | "month"
  | "quarter"
  | "year"
  | "decade";
export type PickerMode = Exclude<PanelMode, "datetime" | "decade">;

type DisabledTimeConfig = {
  disabledHours?: () => number[];
  disabledMinutes?: (selectedHour: number) => number[];
  disabledSeconds?: (selectedHour: number, selectedMinute: number) => number[];
  disabledMilliseconds?: (
    selectedHour: number,
    selectedMinute: number,
    selectedSecond: number,
  ) => number[];
};

type DisabledTime = (date: Dayjs) => DisabledTimeConfig;

// `TDefault` differs by picker: a single picker takes one `Dayjs`, a range
// picker takes a `[start, end]` tuple. Sharing one non-generic type let a
// tuple be passed to the single picker and silently ignored.
// Besides `defaultOpenValue`, the object form forwards presentation options
// (format, showNow, step, hideDisabledOptions) to the internal time panel,
// mirroring how AntD forwards `showTime` props to its TimePicker.
type ShowTimeConfig<TDefault = Dayjs> =
  | boolean
  | (TimeSelectOptions & {
      defaultOpenValue?: TDefault;
    });

type DatePickerBaseProperties = InputVariants &
  InputSizeVariants & {
    id?: string;
    format?: string;
    /** To provide an additional time selection **/
    showTime?: ShowTimeConfig;

    allowClear?: boolean;
    className?: string;
    suffix?: React.ReactNode;
    /** Show a loading spinner in the suffix and block opening the calendar. */
    loading?: boolean;
    /** react-day-picker day modifiers, forwarded to the underlying Calendar (e.g. mark days that have slots). */
    modifiers?: ShadcnCalendarProps["modifiers"];
    /** Class names applied per matching modifier, forwarded to the underlying Calendar. */
    modifiersClassNames?: ShadcnCalendarProps["modifiersClassNames"];

    // to use default month and year dropdown
    captionLayout?: "label" | "dropdown" | "dropdown-months" | "dropdown-years";

    // Custom: when selecting a year in overlay, commit that year on close without needing to pick a day
    commitYearOnClose?: boolean;

    minDate?: Dayjs;
    maxDate?: Dayjs;
  };

/** Slots a caller can target with `classNames` / `styles`. */
type DatePickerSemanticName = "root" | "input" | "suffix";

type DatePickerProperties = DatePickerBaseProperties & {
  ref?: React.Ref<InputReference>;
  defaultValue?: Dayjs | null;
  value?: Dayjs | null;
  onChange?: (date: Dayjs | null | undefined, dateString: string) => void;
  disabledDate?: DisabledDate<Dayjs>;
  disabledTime?: DisabledTime;
  placeholder?: string;

  picker?: PickerMode;

  style?: React.CSSProperties;
  styles?: Partial<Record<DatePickerSemanticName, React.CSSProperties>>;
  classNames?: Partial<Record<DatePickerSemanticName, string>>;
};

const DatePicker = (properties: DatePickerProperties) => {
  const {
    ref,
    id,

    value: valueProperty,
    defaultValue,
    onChange,

    placeholder,
    format: formatProperty,
    showTime,
    picker,
    disabledDate,
    disabledTime,
    minDate,
    maxDate,

    style,
    classNames,
    styles,
    disabled,
    loading = false,
    suffix: suffixProperty,
    modifiers,
    modifiersClassNames,
    allowClear = false,
    variant,
    size,
    status,

    className,
    commitYearOnClose: commitYearOnCloseProperty,
    ...rest
  } = properties;

  const [pickerMode, setPickerMode] = useState(picker ?? "date");

  const getPeriodStart = React.useCallback(
    (date: Dayjs, mode: "month" | "year" | "week" | "quarter") => {
      if (mode === "quarter") {
        return date.month(Math.floor(date.month() / 3) * 3).startOf("month");
      }

      return date.startOf(mode);
    },
    [],
  );

  const isDateAllowed = React.useCallback(
    (date: Dayjs, mode: PanelMode = picker ?? "date") => {
      if (minDate && date.isBefore(minDate, "day")) return false;
      if (maxDate && date.isAfter(maxDate, "day")) return false;
      if (disabledDate?.(date, { type: mode })) return false;
      return true;
    },
    [disabledDate, maxDate, minDate, picker],
  );

  const isTimeAllowed = React.useCallback(
    (date: Dayjs) => {
      if (!showTime || !disabledTime) return true;

      const config = disabledTime(date);
      const hour = date.hour();
      const minute = date.minute();
      const second = date.second();
      const millisecond = date.millisecond();

      if (config.disabledHours?.().includes(hour)) return false;
      if (config.disabledMinutes?.(hour).includes(minute)) return false;
      if (config.disabledSeconds?.(hour, minute).includes(second)) return false;
      if (
        config
          .disabledMilliseconds?.(hour, minute, second)
          .includes(millisecond)
      ) {
        return false;
      }

      return true;
    },
    [disabledTime, showTime],
  );

  const isSelectableValue = React.useCallback(
    (date: Dayjs, mode: PanelMode = picker ?? "date") =>
      isDateAllowed(date, mode) && (mode !== "date" || isTimeAllowed(date)),
    [isDateAllowed, isTimeAllowed, picker],
  );

  const isWholePeriodAllowed = React.useCallback(
    (date: Dayjs, mode: "month" | "year" | "week" | "quarter") => {
      const start = getPeriodStart(date, mode);
      const end =
        mode === "quarter"
          ? start.add(2, "month").endOf("month")
          : start.endOf(mode);

      for (
        let current = start;
        !current.isAfter(end, "day");
        current = current.add(1, "day")
      ) {
        if (!isDateAllowed(current, mode)) return false;
      }

      return true;
    },
    [getPeriodStart, isDateAllowed],
  );

  const [open, setOpen] = useState(false);
  const {
    format: formatConfig,
    captionLayout: captionLayoutConfig,
    commitYearOnClose: commitYearOnCloseConfig,
  } = useComponentConfig("datePicker");

  const commitYearOnClose =
    commitYearOnCloseProperty ?? commitYearOnCloseConfig;

  // ====================== Format Date =======================
  const { format: datePickerFormat } = useComponentConfig("datePicker");
  let fallbackFormat = formatConfig ?? datePickerFormat ?? "YYYY-MM-DD";

  if (picker === "year") {
    fallbackFormat = "YYYY";
  } else if (picker === "quarter") {
    fallbackFormat = "YYYY-[Q]Q";
  } else if (showTime) {
    // AntD default shows seconds; a custom `format` prop overrides this.
    // use12Hours switches the display to 12h tokens with a meridiem.
    const datePart = formatConfig ?? datePickerFormat ?? "YYYY-MM-DD";
    const twelve = typeof showTime === "object" && showTime.use12Hours;
    fallbackFormat = twelve
      ? `${datePart} hh:mm:ss A`
      : `${datePart} HH:mm:ss`;
  }

  const format = formatProperty ?? fallbackFormat;

  const formatValue = React.useCallback(
    (date: Dayjs) => {
      if (picker === "quarter") {
        return `${date.format("YYYY")}-Q${Math.floor(date.month() / 3) + 1}`;
      }

      return date.format(format);
    },
    [format, picker],
  );

  // // Helpers to convert between external value (Date or Dayjs) and internal Dayjs
  // const toDayjs = (v: Dayjs | Date | null | undefined): Dayjs | undefined => {
  //   if (!v) return undefined;
  //   return dayjs(v);
  // };
  // const fromDayjs = (v: Dayjs | undefined): Dayjs | undefined => {
  //   if (!v) return undefined;
  //   return v;
  // };

  // const controlledValue = useMemo(() => toDayjs(valueProp as any), [valueProp]);
  // const defaultDayjsValue = useMemo(
  //   () => toDayjs(defaultValue as any),
  //   [defaultValue],
  // );

  // ====================== Value =======================
  const [value, setValue] = useMergedState(defaultValue, {
    value: valueProperty,
    onChange: (next) => {
      onChange?.(next, next ? formatValue(next) : "");
    },
  });
  const preInputValue = value ? formatValue(value) : "";
  const [inputValue, setInputValue] = useMergedState(preInputValue);

  // Sync input value when value changes
  useEffect(() => {
    const newInputValue = value ? formatValue(value) : "";
    setInputValue(newInputValue);
  }, [value, formatValue, setInputValue]);

  // Convert Day (Date) from calendar to internal Dayjs
  const getDestinationValue = (date: Date): Dayjs => {
    return dayjs(date);
  };

  const inputReference = React.useRef<InputReference>(null);
  const skipBlurCommitReference = React.useRef(false);
  const interactingInsidePanelReference = React.useRef(false);

  const composedReference = React.useCallback<
    React.RefCallback<InputReference>
  >(
    (node) => {
      inputReference.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );
  const handleChangeInput = (value: string) => {
    if (value.trim()) {
      const parsed = parseInputDate(value, format);
      if (parsed && isSelectableValue(parsed)) {
        setValue(parsed);
        setInputValue(formatValue(parsed));
        setMonth(parsed.toDate());
      } else {
        setInputValue(value);
      }
    } else {
      setValue(undefined);
      setInputValue("");
    }
  };

  // prevent click label to focus input (open popover)
  useEffect(() => {
    const labelElm = document.querySelector(`label[for="${id}"]`);
    const eventFunction = (event: Event) => {
      event.preventDefault();
    };
    labelElm?.addEventListener("click", eventFunction);
    return () => {
      labelElm?.removeEventListener("click", eventFunction);
    };
  }, [id]);

  const [month, setMonth] = React.useState<Date | undefined>(
    value ? value.toDate() : undefined,
  );
  const selectedDate = useMemo(() => {
    if (inputValue.trim()) {
      const parsed = parseInputDate(inputValue, format);
      if (parsed && isSelectableValue(parsed)) {
        return parsed.toDate();
      }
    }

    return value ? value.toDate() : undefined;
  }, [format, inputValue, isSelectableValue, value]);

  const currentYear = useMemo(() => value ?? dayjs(), [value]);

  const [currentDecadeRange] = useState<Dayjs[]>(() =>
    Array.from({ length: 10 }, (_, index) => {
      const yearValue = currentYear.year();
      const startYear = Math.floor(yearValue / 10) * 10;
      return dayjs((startYear + index).toString());
    }),
  );

  const computedDecadeRange = useMemo(() => {
    const firstYear = currentDecadeRange[0];
    const lastYear = currentDecadeRange.at(-1);
    return {
      start: firstYear?.year() ?? 0,
      end: lastYear?.year() ?? 0,
      years: currentDecadeRange,
    };
  }, [currentDecadeRange]);

  // =============== Hover Preview (AntD-like) ===============
  const [hoverPreview, setHoverPreview] = useState<Dayjs | undefined>();
  // Persist preview after picking a year (overlay) until final commit/close
  const [stickyPreview, setStickyPreview] = useState<Dayjs | undefined>();
  // Remember if a year was selected in overlay and is pending commit on close
  const [pendingYearCommit, setPendingYearCommit] = useState(false);

  // Memoized components to prevent remounts during hover (which broke clicks)
  const YearModeMonthGrid = React.useCallback(
    (_properties: React.HTMLAttributes<HTMLDivElement>): React.ReactElement => {
      return (
        <YearSelect
          value={value}
          isOptionDisabled={(year) => {
            if (picker === "year") {
              return !isWholePeriodAllowed(year.startOf("year"), "year");
            }

            return false;
          }}
          onHoverChange={(hoveredYear) => {
            if (!hoveredYear) {
              setHoverPreview(undefined);
              return;
            }
            if (picker === "year") {
              setHoverPreview(hoveredYear.startOf("year"));
              return;
            }
            // Overlay year picker: preview keeping month/day
            const base = value ?? dayjs(month ?? new Date());
            let next = base.year(hoveredYear.year());
            if (!next.isValid()) {
              next = dayjs().year(hoveredYear.year()).startOf("year");
            }
            setHoverPreview(next);
          }}
          onChange={(year) => {
            if (!year) {
              setPickerMode("date");
              return;
            }

            // If DatePicker acts as a pure year picker, commit the selection
            if (picker === "year") {
              const y = year.startOf("year");
              if (!isWholePeriodAllowed(y, "year")) {
                setHoverPreview(undefined);
                return;
              }
              setValue(y);
              setInputValue(formatValue(y));
              setMonth(y.toDate());
              setOpen(false);
              setHoverPreview(undefined);
              return;
            }

            // Otherwise, only navigate calendar to selected year (do not change value)
            const base = value ?? dayjs(month ?? new Date());
            const next = base.year(year.year());
            const newMonth = next.startOf("month").toDate();
            setMonth(newMonth);
            setPickerMode("date");
            // Keep a preview so input stays dimmed with the selected year until final commit
            setStickyPreview(next);
            setHoverPreview(next);
            setPendingYearCommit(true);
          }}
        />
      );
    },
    [
      formatValue,
      isWholePeriodAllowed,
      month,
      picker,
      setInputValue,
      setMonth,
      setOpen,
      setValue,
      value,
    ],
  );

  const MonthModeMonthGrid = React.useCallback(
    (_properties: React.HTMLAttributes<HTMLDivElement>): React.ReactElement => {
      return (
        <MonthSelect
          value={value}
          isOptionDisabled={(month) => {
            if (picker === "month") {
              return !isWholePeriodAllowed(month.startOf("month"), "month");
            }

            if (picker === "quarter") {
              return !isWholePeriodAllowed(
                getPeriodStart(month, "quarter"),
                "quarter",
              );
            }

            return false;
          }}
          onHoverChange={(hoveredMonth) => {
            if (!hoveredMonth) {
              setHoverPreview(undefined);
              return;
            }
            if (picker === "month") {
              setHoverPreview(hoveredMonth.startOf("month"));
              return;
            }
            if (picker === "quarter") {
              setHoverPreview(getPeriodStart(hoveredMonth, "quarter"));
              return;
            }
            // Overlay month picker: preview keeping year/day?
            const base = dayjs(month ?? new Date());
            let next = base.month(hoveredMonth.month());
            if (!next.isValid()) {
              next = base.month(hoveredMonth.month()).startOf("month");
            }
            setHoverPreview(next);
          }}
          onChange={(selectedMonth) => {
            if (!selectedMonth) {
              setPickerMode("date");
              return;
            }

            // If DatePicker acts as a pure month picker, commit the selection
            if (picker === "month") {
              const m = selectedMonth.startOf("month");
              if (!isWholePeriodAllowed(m, "month")) {
                setHoverPreview(undefined);
                return;
              }
              setValue(m);
              setInputValue(formatValue(m));
              setMonth(m.toDate());
              setOpen(false);
              setHoverPreview(undefined);
              return;
            }

            if (picker === "quarter") {
              const q = getPeriodStart(selectedMonth, "quarter");
              if (!isWholePeriodAllowed(q, "quarter")) {
                setHoverPreview(undefined);
                return;
              }
              setValue(q);
              setInputValue(formatValue(q));
              setMonth(q.toDate());
              setOpen(false);
              setHoverPreview(undefined);
              return;
            }

            // Otherwise, only navigate calendar to selected month in CURRENT VIEW YEAR
            const base = dayjs(month ?? new Date());
            const next = base.month(selectedMonth.month());

            const newMonthDate = next.startOf("month").toDate();
            setMonth(newMonthDate);
            setPickerMode("date");
          }}
        />
      );
    },
    [
      formatValue,
      getPeriodStart,
      isWholePeriodAllowed,
      month,
      picker,
      setInputValue,
      setMonth,
      setOpen,
      setValue,
      value,
    ],
  );

  // ====================== Time selection ======================
  const showTimeEnabled = !!showTime;
  const showTimeConfig = typeof showTime === "object" ? showTime : undefined;
  const defaultOpenTime = showTimeConfig?.defaultOpenValue;
  const use12Hours = showTimeConfig?.use12Hours ?? false;
  // `showTime.format` overrides the time columns; otherwise derive from
  // `format`, switching to 12h tokens when use12Hours is set.
  const derivedTimeFormat = use12Hours
    ? format.includes("ss")
      ? "hh:mm:ss A"
      : "hh:mm A"
    : format.includes("ss")
      ? "HH:mm:ss"
      : "HH:mm";
  const timeFormat = showTimeConfig?.format ?? derivedTimeFormat;
  const timeShowNow = showTimeConfig?.showNow ?? true;
  // Fallback time when nothing is selected yet. AntD defaults to the current
  // time; `defaultOpenValue` overrides it. Memoized per popover-open so the
  // wheel does not re-highlight (and "now" does not drift) on every render.
  const now = React.useMemo(() => dayjs(), [open]);
  const fallbackTime = defaultOpenTime ?? now;
  // Evaluate disabledTime for the current value so the time wheel can grey out
  // the rejected hours/minutes/seconds (AntD parity).
  const timeConfig =
    showTimeEnabled && disabledTime
      ? disabledTime(value ?? dayjs())
      : undefined;

  const applyTime = React.useCallback(
    (target: Dayjs, source: Dayjs | null | undefined) =>
      target
        .hour(source?.hour() ?? 0)
        .minute(source?.minute() ?? 0)
        .second(source?.second() ?? 0)
        .millisecond(source?.millisecond() ?? 0),
    [],
  );

  const commitCalendarSelection = React.useCallback(
    (date: Date | Dayjs) => {
      const dayjsDate = dayjs(date);
      const periodValue =
        picker === "week" ? getPeriodStart(dayjsDate, "week") : dayjsDate;
      // Keep the currently selected time-of-day when picking a day with showTime.
      const nextValue = showTimeEnabled
        ? applyTime(periodValue, value ?? fallbackTime)
        : periodValue;

      if (
        (picker === "week" && !isWholePeriodAllowed(nextValue, "week")) ||
        !isDateAllowed(nextValue)
      ) {
        setHoverPreview(undefined);
        return;
      }

      setValue(nextValue);
      setInputValue(formatValue(nextValue));
      setMonth(nextValue.toDate());
      skipBlurCommitReference.current = true;
      setPendingYearCommit(false);
      setHoverPreview(undefined);
      setStickyPreview(undefined);
      // With showTime, keep the panel open so the user can pick a time and
      // confirm via the "Ok" button; otherwise close immediately.
      if (!showTimeEnabled) setOpen(false);
    },
    [
      applyTime,
      fallbackTime,
      formatValue,
      getPeriodStart,
      isDateAllowed,
      isWholePeriodAllowed,
      picker,
      setInputValue,
      setMonth,
      setOpen,
      setValue,
      showTimeEnabled,
      value,
    ],
  );

  const handleTimeChange = React.useCallback(
    (next: Dayjs | null | undefined) => {
      if (!next) return;
      // TimeSelect preserves the date part of the value it was given, so `next`
      // already carries the correct day (or today when no day is selected yet).
      setValue(next);
      setInputValue(formatValue(next));
      setMonth(next.toDate());
    },
    [formatValue, setInputValue, setMonth, setValue],
  );

  const handleTimeNow = React.useCallback(() => {
    const now = dayjs();
    setValue(now);
    setInputValue(formatValue(now));
    setMonth(now.toDate());
    setOpen(false);
  }, [formatValue, setInputValue, setMonth, setOpen, setValue]);

  const CalendarDayButton = React.useCallback(
    (properties: React.ComponentProps<typeof CustomCalendarDayButton>) => (
      <CustomCalendarDayButton
        {...properties}
        onMouseDown={(event) => {
          interactingInsidePanelReference.current = true;
          event.preventDefault();
          properties.onMouseDown?.(event);
        }}
      />
    ),
    [],
  );

  const BaseCaptionLabel = React.useCallback(
    ({
      className,
      ...properties
    }: React.HTMLAttributes<HTMLSpanElement>): React.ReactElement => {
      const d = month ?? new Date();
      const m = dayjs(d);
      const monthText = m.format("MMM");
      const yearText = m.format("YYYY");
      return (
        <span className={cn("space-x-2", className)} {...properties}>
          <Button
            variant="outline"
            onClick={() => {
              setPickerMode("month");
            }}
            aria-describedby="month-select-description"
          >
            {monthText}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setPickerMode("year");
            }}
            aria-describedby="year-select-description"
          >
            {yearText}
          </Button>
          {/* Hidden descriptions for screen readers */}
          <span id="month-select-description" className="sr-only">
            Select month
          </span>
          <span id="year-select-description" className="sr-only">
            Select year
          </span>
        </span>
      );
    },
    [month],
  );

  const YearModeCaptionLabel = React.useCallback(
    (properties: React.HTMLAttributes<HTMLSpanElement>): React.ReactElement => (
      <span {...properties}>
        {computedDecadeRange.start}-{computedDecadeRange.end}
      </span>
    ),
    [computedDecadeRange.start, computedDecadeRange.end],
  );

  const MonthModeCaptionLabel = React.useCallback(
    ({
      className,
      ...properties
    }: React.HTMLAttributes<HTMLSpanElement>): React.ReactElement => {
      const d = month ?? new Date();
      const m = dayjs(d);
      const yearText = m.format("YYYY");
      return (
        <span className={cn("space-x-2", className)} {...properties}>
          <Button
            variant="outline"
            onClick={() => {
              setPickerMode("year");
            }}
            aria-describedby="year-select-description-month-mode"
          >
            {yearText}
          </Button>
          {/* Hidden description for screen readers */}
          <span id="year-select-description-month-mode" className="sr-only">
            Select year
          </span>
        </span>
      );
    },
    [month],
  );

  return (
    <>
      <Popover
        trigger="click"
        placement="bottomLeft"
        className="w-auto p-0 max-sm:p-0"
        arrow={false}
        open={loading ? false : open}
        onOpenChange={(open) => {
          if (loading) return;
          setOpen(open);
          if (!open) {
            // If requested, commit the selected year when panel closes
            if (commitYearOnClose && pendingYearCommit && stickyPreview) {
              const commit = stickyPreview.isValid()
                ? stickyPreview
                : dayjs(stickyPreview).isValid()
                  ? dayjs(stickyPreview)
                  : dayjs();
              if (!isSelectableValue(commit)) return;
              setValue(commit);
              setInputValue(commit.format(format));
              setMonth(commit.toDate());
            }
            interactingInsidePanelReference.current = false;
            setPendingYearCommit(false);
            setHoverPreview(undefined);
            setStickyPreview(undefined);
          }
        }}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
        content={
          <div
            className="flex flex-col"
            onMouseDown={() => {
              interactingInsidePanelReference.current = true;
            }}
          >
            <div className="flex">
              <Calendar
                mode="single"
                required={true}
                captionLayout={captionLayoutConfig}
                modifiers={modifiers}
                modifiersClassNames={modifiersClassNames}
                // initialFocus // disable default focus (in shadcn default is true)
                // defaultMonth={value && toDate(value)}
                month={month}
                onMonthChange={(m) => {
                  setMonth(m);
                  const next = dayjs(m).startOf("month");
                  setStickyPreview(next);
                  setHoverPreview(next);

                  if (captionLayoutConfig === "dropdown") {
                    setPendingYearCommit(true);
                  }
                }}
                onDayMouseEnter={(date, modifiers) => {
                  if (!modifiers.disabled) {
                    const hoveredDate = dayjs(date);
                    const basePreview =
                      picker === "week"
                        ? getPeriodStart(hoveredDate, "week")
                        : hoveredDate;
                    // Preview the hovered day with the currently selected time.
                    const preview = showTimeEnabled
                      ? applyTime(basePreview, value ?? defaultOpenTime)
                      : basePreview;
                    setHoverPreview((previous) =>
                      previous?.isSame(preview, "minute") ? previous : preview,
                    );
                  }
                }}
                onDayMouseLeave={(_, modifiers) => {
                  if (!modifiers.disabled) {
                    setHoverPreview(stickyPreview ?? undefined);
                  }
                }}
                selected={selectedDate}
                startMonth={
                  minDate?.toDate() ??
                  dayjs().subtract(50, "year").startOf("year").toDate()
                }
                endMonth={
                  maxDate?.toDate() ??
                  dayjs().add(50, "year").endOf("year").toDate()
                }
                onSelect={(date) => {
                  if (!date) return;
                  commitCalendarSelection(date);
                }}
                disabled={(date) => !isDateAllowed(getDestinationValue(date))}
                components={{
                  CaptionLabel: BaseCaptionLabel,
                  DayButton: CalendarDayButton,
                  ...(pickerMode === "year"
                    ? {
                        MonthGrid: YearModeMonthGrid,
                        CaptionLabel: YearModeCaptionLabel,
                      }
                    : {}),
                  ...(pickerMode === "month"
                    ? {
                        MonthGrid: MonthModeMonthGrid,
                        CaptionLabel: MonthModeCaptionLabel,
                      }
                    : {}),
                }}
              />
              {showTimeEnabled && (
                <div data-slot="picker-time" className="flex flex-col border-l">
                  <TimeSelect
                    value={value ?? fallbackTime}
                    format={timeFormat}
                    showFooter={false}
                    header={
                      value ? (
                        value.format(timeFormat)
                      ) : (
                        <span className="text-muted-foreground">
                          {timeFormat.replace(/[Hms]/g, "-")}
                        </span>
                      )
                    }
                    disabledHours={timeConfig?.disabledHours}
                    disabledMinutes={timeConfig?.disabledMinutes}
                    disabledSeconds={timeConfig?.disabledSeconds}
                    hideDisabledOptions={showTimeConfig?.hideDisabledOptions}
                    hourStep={showTimeConfig?.hourStep}
                    minuteStep={showTimeConfig?.minuteStep}
                    secondStep={showTimeConfig?.secondStep}
                    use12Hours={use12Hours}
                    onChange={handleTimeChange}
                  />
                </div>
              )}
            </div>
            {showTimeEnabled && (
              <div
                data-slot="picker-footer"
                className="flex items-center justify-between border-t px-3 py-2"
              >
                {timeShowNow ? (
                  <Button
                    size="small"
                    type="link"
                    className="px-0"
                    onClick={handleTimeNow}
                  >
                    Now
                  </Button>
                ) : (
                  <span />
                )}
                <Button
                  size="small"
                  type="primary"
                  onClick={() => setOpen(false)}
                >
                  Ok
                </Button>
              </div>
            )}
          </div>
        }
      >
        <div
          role="combobox"
          data-slot="picker-input"
          className={cn("inline-flex", className, classNames?.root)}
          style={{ ...style, ...styles?.root }}
        >
          <Input
            ref={composedReference}
            id={id}
            value={
              open && hoverPreview ? formatValue(hoverPreview) : inputValue
            }
            placeholder={placeholder}
            status={status}
            allowClear={allowClear}
            variant={variant}
            size={size}
            htmlSize={12}
            disabled={disabled}
            suffix={
              loading ? (
                <Icon
                  aria-hidden="true"
                  icon="icon-[lucide--loader]"
                  className="ml-auto size-4 animate-spin opacity-50"
                />
              ) : (
                (suffixProperty ?? (
                  <Icon
                    aria-hidden="true"
                    icon="icon-[mingcute--calendar-2-line]"
                    className="ml-auto size-4 opacity-50"
                  />
                ))
              )
            }
            classNames={{
              input: cn(
                open &&
                  hoverPreview &&
                  !value?.isSame(hoverPreview, "day") &&
                  "text-muted-foreground",
                classNames?.input,
              ),
              suffix: classNames?.suffix,
            }}
            styles={{
              input: styles?.input,
              suffix: styles?.suffix,
            }}
            onClick={(e) => {
              if (open) {
                // prevent close when click into input if popover openning
                e.preventDefault();
              }
            }}
            onKeyUp={(event) => {
              event.stopPropagation();
              if (loading) return;
              if (event.key === "Enter") {
                handleChangeInput(event.currentTarget.value);
                setOpen(false);
              } else if (event.key === "Escape") {
                // Only trigger onChange if input is valid, otherwise just close
                if (inputValue.trim()) {
                  const parsed = parseInputDate(inputValue, format);
                  if (parsed && isSelectableValue(parsed)) {
                    setValue(parsed);
                    setInputValue(formatValue(parsed));
                  }
                }
                setOpen(false);
              }
            }}
            onChange={(event) => {
              if (loading) return;
              const newValue = event.currentTarget.value;
              setInputValue(newValue);

              // Update calendar month and selected date when typing
              if (newValue.trim()) {
                const parsed = parseInputDate(newValue, format);
                if (parsed && isSelectableValue(parsed)) {
                  // Commit immediately so form state is updated even before blur
                  setValue(parsed);
                  setMonth(parsed.toDate());
                }
              } else {
                // Keep form state in sync when clearing input
                setValue(undefined);
              }
            }}
            onBlur={(e) => {
              if (skipBlurCommitReference.current) {
                skipBlurCommitReference.current = false;
                return;
              }

              if (interactingInsidePanelReference.current) {
                interactingInsidePanelReference.current = false;
                return;
              }

              // Check if the focus is moving to an element within the calendar/popover
              const relatedTarget = e.relatedTarget as HTMLElement | undefined;
              const calendarContainer = document.querySelector(
                '[data-slot="calendar"]',
              );
              const popoverContainer = document.querySelector(
                '[data-slot="popover-content"]',
              );

              // If focus is moving to calendar or popover, don't close
              if (
                relatedTarget &&
                (calendarContainer?.contains(relatedTarget) ||
                  popoverContainer?.contains(relatedTarget) ||
                  relatedTarget.closest('[data-slot="calendar"]') ||
                  relatedTarget.closest('[data-slot="popover-content"]'))
              ) {
                return;
              }

              // Validate input on blur - if valid trigger onChange, otherwise revert to previous value
              if (inputValue.trim()) {
                const parsed = parseInputDate(inputValue, format);
                if (parsed && isSelectableValue(parsed)) {
                  setValue(parsed);
                  setInputValue(formatValue(parsed));
                } else {
                  // Invalid input - revert to previous value
                  setInputValue(value ? formatValue(value) : "");
                }
              } else {
                // Empty input - trigger onChange with undefined
                setValue(undefined);
                setInputValue("");
              }
              setOpen(false);
            }}
            {...rest}
          />
        </div>
      </Popover>
    </>
  );
};

export type {
  DatePickerProperties as DatePickerProps,
  DatePickerBaseProperties as DatePickerBaseProps,
  DisabledTime,
  DisabledTimeConfig,
  ShowTimeConfig,
};
export { DatePicker };
