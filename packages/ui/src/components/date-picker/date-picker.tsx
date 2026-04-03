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
import { composeRef } from "@rc-component/util/es/ref";
import dayjs from "dayjs";

import { cn } from "@acme/ui/lib/utils";

import type { InputRef } from "../input";
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

type DatePickerBaseProps = InputVariants &
  InputSizeVariants & {
    id?: string;
    format?: string;
    /** To provide an additional time selection **/
    showTime?: boolean;

    allowClear?: boolean;
    className?: string;
    suffix?: React.ReactNode;

    // to use default month and year dropdown
    captionLayout?: "label" | "dropdown" | "dropdown-months" | "dropdown-years";

    // Custom: when selecting a year in overlay, commit that year on close without needing to pick a day
    commitYearOnClose?: boolean;

    minDate?: Dayjs;
    maxDate?: Dayjs;
  };

type DatePickerProps = DatePickerBaseProps & {
  ref?: React.Ref<InputRef>;
  defaultValue?: Dayjs | null;
  value?: Dayjs | null;
  onChange?: (date: Dayjs | null | undefined, dateString: string) => void;
  disabledDate?: DisabledDate<Dayjs>;
  placeholder?: string;

  picker?: PickerMode;

  style?: React.CSSProperties;
  styles?: {
    root?: React.CSSProperties;
  };
  classNames?: {
    root?: string;
  };
};

const DatePicker = (props: DatePickerProps) => {
  const {
    ref,
    id,

    value: valueProp,
    defaultValue,
    onChange,

    placeholder,
    format: formatProp,
    showTime,
    picker,
    disabledDate,
    minDate,
    maxDate,

    style,
    classNames: _,
    styles: __,
    disabled,
    allowClear = false,
    variant,
    size,
    status,

    className,
    commitYearOnClose: commitYearOnCloseProp,
    ...rest
  } = props;

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

  const getPeriodDates = React.useCallback(
    (date: Dayjs, mode: "month" | "year" | "week" | "quarter") => {
      const start = getPeriodStart(date, mode);
      const end =
        mode === "quarter"
          ? start.add(2, "month").endOf("month")
          : start.endOf(mode);
      const dates: Dayjs[] = [];

      for (
        let current = start;
        !current.isAfter(end, "day");
        current = current.add(1, "day")
      ) {
        dates.push(current);
      }

      return dates;
    },
    [getPeriodStart],
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

  const isWholePeriodAllowed = React.useCallback(
    (date: Dayjs, mode: "month" | "year" | "week" | "quarter") => {
      return getPeriodDates(date, mode).every((periodDate) =>
        isDateAllowed(periodDate, mode),
      );
    },
    [getPeriodDates, isDateAllowed],
  );

  const [open, setOpen] = useState(false);
  const {
    format: formatConfig,
    captionLayout: captionLayoutConfig,
    commitYearOnClose: commitYearOnCloseConfig,
  } = useComponentConfig("datePicker");

  const commitYearOnClose = commitYearOnCloseProp ?? commitYearOnCloseConfig;

  // ====================== Format Date =======================
  const { format: datePickerFormat } = useComponentConfig("datePicker");
  const format =
    formatProp ??
    (picker === "year"
      ? "YYYY"
      : picker === "quarter"
        ? "YYYY-[Q]Q"
        : showTime
          ? `${formatConfig ?? datePickerFormat} HH:mm`
          : (formatConfig ?? datePickerFormat ?? "YYYY-MM-DD"));

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
    value: valueProp,
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

  const inputRef = React.useRef<InputRef>(null);
  const skipBlurCommitRef = React.useRef(false);
  const interactingInsidePanelRef = React.useRef(false);

  // eslint-disable-next-line react-hooks/refs
  const composedRef = ref ? composeRef(ref, inputRef) : inputRef;
  const handleChangeInput = (value: string) => {
    if (value.trim()) {
      const parsed = parseInputDate(value, format);
      if (parsed) {
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
    const eventFn = (event: Event) => {
      event.preventDefault();
    };
    labelElm?.addEventListener("click", eventFn);
    return () => {
      labelElm?.removeEventListener("click", eventFn);
    };
  }, [id]);

  const [month, setMonth] = React.useState<Date | undefined>(
    value ? value.toDate() : undefined,
  );
  const [typedDate, setTypedDate] = React.useState<Date | undefined>(
    value ? value.toDate() : undefined,
  );

  // Sync calendar month and selected date when input value changes
  React.useEffect(() => {
    if (inputValue.trim()) {
      const parsed = parseInputDate(inputValue, format);
      if (parsed) {
        setMonth(parsed.toDate());
        setTypedDate(parsed.toDate());
      }
    } else if (value) {
      // If there's a selected value, use it for month
      setMonth(value.toDate());
      setTypedDate(value.toDate());
    } else {
      setTypedDate(undefined);
    }
  }, [inputValue, value, format]);

  const currentYear = useMemo(() => value ?? dayjs(), [value]);

  const [currentDecadeRange] = useState<Dayjs[]>(() =>
    Array.from({ length: 10 }, (_, i) => {
      const yearValue = currentYear.year();
      const startYear = Math.floor(yearValue / 10) * 10;
      return dayjs((startYear + i).toString());
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
    (_props: React.HTMLAttributes<HTMLDivElement>): React.ReactElement => {
      return (
        <YearSelect
          value={value}
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
    (_props: React.HTMLAttributes<HTMLDivElement>): React.ReactElement => {
      return (
        <MonthSelect
          value={value}
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

  const commitCalendarSelection = React.useCallback(
    (date: Date | Dayjs) => {
      const dayjsDate = dayjs(date);
      const nextValue =
        picker === "week" ? getPeriodStart(dayjsDate, "week") : dayjsDate;

      if (picker === "week" && !isWholePeriodAllowed(nextValue, "week")) {
        setHoverPreview(undefined);
        return;
      }

      setValue(nextValue);
      setInputValue(formatValue(nextValue));
      setTypedDate(nextValue.toDate());
      setMonth(nextValue.toDate());
      skipBlurCommitRef.current = true;
      setPendingYearCommit(false);
      setHoverPreview(undefined);
      setStickyPreview(undefined);
      setOpen(false);
    },
    [
      formatValue,
      getPeriodStart,
      isWholePeriodAllowed,
      picker,
      setInputValue,
      setMonth,
      setOpen,
      setValue,
    ],
  );

  const CalendarDayButton = React.useCallback(
    (props: React.ComponentProps<typeof CustomCalendarDayButton>) => (
      <CustomCalendarDayButton
        {...props}
        onMouseDown={(event) => {
          interactingInsidePanelRef.current = true;
          event.preventDefault();
          props.onMouseDown?.(event);
        }}
      />
    ),
    [],
  );

  const BaseCaptionLabel = React.useCallback(
    ({
      className,
      ...props
    }: React.HTMLAttributes<HTMLSpanElement>): React.ReactElement => {
      const d = month ?? new Date();
      const m = dayjs(d);
      const monthText = m.format("MMM");
      const yearText = m.format("YYYY");
      return (
        <span className={cn("space-x-2", className)} {...props}>
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
    (props: React.HTMLAttributes<HTMLSpanElement>): React.ReactElement => (
      <span {...props}>
        {computedDecadeRange.start}-{computedDecadeRange.end}
      </span>
    ),
    [computedDecadeRange.start, computedDecadeRange.end],
  );

  const MonthModeCaptionLabel = React.useCallback(
    ({
      className,
      ...props
    }: React.HTMLAttributes<HTMLSpanElement>): React.ReactElement => {
      const d = month ?? new Date();
      const m = dayjs(d);
      const yearText = m.format("YYYY");
      return (
        <span className={cn("space-x-2", className)} {...props}>
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
        align={{
          // fix panel offset -  based on input size
          offset: [-12, 10],
        }}
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
          if (!open) {
            // If requested, commit the selected year when panel closes
            if (commitYearOnClose && pendingYearCommit && stickyPreview) {
              const commit = stickyPreview.isValid()
                ? stickyPreview
                : dayjs(stickyPreview).isValid()
                  ? dayjs(stickyPreview)
                  : dayjs();
              setValue(commit);
              setInputValue(commit.format(format));
              setTypedDate(commit.toDate());
              setMonth(commit.toDate());
            }
            interactingInsidePanelRef.current = false;
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
            className="flex"
            onMouseDown={() => {
              interactingInsidePanelRef.current = true;
            }}
          >
            <Calendar
              mode="single"
              required={true}
              captionLayout={captionLayoutConfig}
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
                  const preview =
                    picker === "week"
                      ? getPeriodStart(hoveredDate, "week")
                      : hoveredDate;
                  setHoverPreview((prev) =>
                    prev?.isSame(preview, "day") ? prev : preview,
                  );
                }
              }}
              onDayMouseLeave={(_, modifiers) => {
                if (!modifiers.disabled) {
                  setHoverPreview(stickyPreview ?? undefined);
                }
              }}
              // value={typedDate ? dayjs(typedDate) : (value ?? undefined)}
              selected={typedDate ?? (value ? value.toDate() : undefined)}
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
              disabled={(date) => {
                if (disabledDate) {
                  // Pass both the date and the required info object
                  const currentArg = getDestinationValue(date);
                  return disabledDate(currentArg, {
                    type: "date",
                  });
                }
                return false;
              }}
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
          </div>
        }
      >
        <div
          role="combobox"
          data-slot="picker-input"
          className={cn("inline-flex", className)}
          style={style}
        >
          <Input
            ref={composedRef}
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
              <Icon
                aria-hidden="true"
                icon="icon-[mingcute--calendar-2-line]"
                className="ml-auto size-4 opacity-50"
              />
            }
            classNames={{
              input: cn(
                open &&
                  hoverPreview &&
                  !value?.isSame(hoverPreview, "day") &&
                  "text-muted-foreground",
              ),
            }}
            onClick={(e) => {
              if (open) {
                // prevent close when click into input if popover openning
                e.preventDefault();
              }
            }}
            onKeyUp={(event) => {
              event.stopPropagation();
              if (event.key === "Enter") {
                handleChangeInput(event.currentTarget.value);
                setOpen(false);
              } else if (event.key === "Escape") {
                // Only trigger onChange if input is valid, otherwise just close
                if (inputValue.trim()) {
                  const parsed = parseInputDate(inputValue, format);
                  if (parsed) {
                    setValue(parsed);
                    setInputValue(formatValue(parsed));
                    setTypedDate(parsed.toDate());
                  }
                }
                setOpen(false);
              }
            }}
            onChange={(event) => {
              const newValue = event.currentTarget.value;
              setInputValue(newValue);

              // Update calendar month and selected date when typing
              if (newValue.trim()) {
                const parsed = parseInputDate(newValue, format);
                if (parsed) {
                  // Commit immediately so form state is updated even before blur
                  setValue(parsed);
                  setTypedDate(parsed.toDate());
                  setMonth(parsed.toDate());
                }
              } else {
                // Keep form state in sync when clearing input
                setValue(undefined);
                setTypedDate(undefined);
              }
            }}
            onBlur={(e) => {
              if (skipBlurCommitRef.current) {
                skipBlurCommitRef.current = false;
                return;
              }

              if (interactingInsidePanelRef.current) {
                interactingInsidePanelRef.current = false;
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
                if (parsed) {
                  setValue(parsed);
                  setInputValue(formatValue(parsed));
                  setTypedDate(parsed.toDate());
                } else {
                  // Invalid input - revert to previous value
                  setInputValue(value ? formatValue(value) : "");
                  setTypedDate(value ? value.toDate() : undefined);
                }
              } else {
                // Empty input - trigger onChange with undefined
                setValue(undefined);
                setInputValue("");
                setTypedDate(undefined);
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

export type { DatePickerProps, DatePickerBaseProps };
export { DatePicker };
