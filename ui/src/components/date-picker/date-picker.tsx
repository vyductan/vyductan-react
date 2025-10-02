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
import { composeRef } from "@rc-component/util/lib/ref";
import dayjs from "dayjs";

import { cn } from "@acme/ui/lib/utils";

import type { InputRef } from "../input";
import type { InputSizeVariants, InputVariants } from "../input/variants";
import type { DisabledDate } from "./types";
import { Icon } from "../../icons";
import { Button } from "../button";
import { Calendar } from "../calendar";
// For typing DayButton props if needed in future (not strictly required below)
// import type { DayButton as RdpDayButton } from "react-day-picker";
import { useUiConfig } from "../config-provider/config-provider";
import { useComponentConfig } from "../config-provider/context";
import { Input } from "../input/input";
import { Popover } from "../popover";
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
  };

type DatePickerPropsDayjs = DatePickerBaseProps & {
  ref?: React.Ref<InputRef>;
  /** Default behavior - uses Dayjs */
  valueType?: "dayjs";
  defaultValue?: Dayjs | null;
  value?: Dayjs | null;
  onChange?: (date: Dayjs | null | undefined, dateString: string) => void;
  disabledDate?: DisabledDate<Dayjs>;
  placeholder?: string;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  picker?: PickerMode;

  styles?: {
    root?: React.CSSProperties;
  };
  classNames?: {
    root?: string;
  };
};

type DatePickerPropsDate = DatePickerBaseProps & {
  ref?: React.Ref<InputRef>;
  /** Explicit Date mode - accepts and emits Date */
  valueType: "date";
  defaultValue?: Date | null;
  value?: Date | null;
  onChange?: (date: Date | null | undefined, dateString: string) => void;
  disabledDate?: DisabledDate<Date>;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  picker?: PickerMode;

  styles?: {
    root?: React.CSSProperties;
  };
  classNames?: {
    root?: string;
  };
};

type DatePickerProps = DatePickerPropsDayjs | DatePickerPropsDate;

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

  const valueType = props.valueType ?? "dayjs";

  const [pickerMode, setPickerMode] = useState(picker ?? "date");

  const [open, setOpen] = useState(false);
  const {
    format: formatConfig,
    captionLayout: captionLayoutConfig,
    commitYearOnClose: commitYearOnCloseConfig,
  } = useComponentConfig("datePicker");

  const commitYearOnClose = commitYearOnCloseProp ?? commitYearOnCloseConfig;

  // ====================== Format Date =======================
  const datePickerConfig = useUiConfig((state) => state.components.datePicker);
  const format =
    formatProp ??
    (picker === "year"
      ? "YYYY"
      : showTime
        ? `${formatConfig ?? datePickerConfig?.format} HH:mm`
        : (formatConfig ?? datePickerConfig?.format ?? "YYYY-MM-DD"));

  // Helpers to convert between external value (Date or Dayjs) and internal Dayjs
  const toDayjs = (v: Dayjs | Date | null | undefined): Dayjs | undefined => {
    if (!v) return undefined;
    return dayjs(v as any);
  };
  const fromDayjs = (v: Dayjs | undefined): Dayjs | Date | undefined => {
    if (!v) return undefined;
    return valueType === "date" ? v.toDate() : v;
  };

  const controlledValue = useMemo(() => toDayjs(valueProp as any), [valueProp]);
  const defaultDayjsValue = useMemo(
    () => toDayjs(defaultValue as any),
    [defaultValue],
  );

  // ====================== Value =======================
  const [value, setValue] = useMergedState<Dayjs | undefined>(
    defaultDayjsValue,
    {
      value: controlledValue,
      onChange: (next) => {
        onChange?.(fromDayjs(next) as any, next ? next.format(format) : "");
      },
    },
  );
  const preInputValue = value ? value.format(format) : "";
  const [inputValue, setInputValue] = useMergedState(preInputValue);

  // Sync input value when value changes
  useEffect(() => {
    const newInputValue = value ? value.format(format) : "";
    setInputValue(newInputValue);
  }, [value, format, setInputValue]);

  // Convert Day (Date) from calendar to internal Dayjs
  const getDestinationValue = (date: Date): Dayjs => {
    return dayjs(date);
  };

  const inputRef = React.useRef<InputRef>(null);

  const composedRef = ref ? composeRef(ref, inputRef) : inputRef;
  const handleChangeInput = (value: string) => {
    if (value.trim()) {
      const parsed = dayjs(value, format);
      if (parsed.isValid()) {
        setValue(parsed);
        setInputValue(parsed.format(format));
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
      const parsed = dayjs(inputValue, format);
      if (parsed.isValid()) {
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
    return {
      start: currentDecadeRange[0]!.year(),
      end: currentDecadeRange.at(-1)!.year(),
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
              setValue(y);
              setInputValue(y.format(format));
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
    [value, picker, month, format, setValue, setInputValue, setMonth, setOpen],
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
          <Button variant="outline" tabIndex={-1} aria-hidden="true">
            {monthText}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setPickerMode("year");
            }}
            aria-label="Select year"
          >
            {yearText}
          </Button>
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

  return (
    <>
      <Popover
        className="w-auto p-0"
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
            setPendingYearCommit(false);
            setHoverPreview(undefined);
            setStickyPreview(undefined);
          }
        }}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
        content={
          <div className="flex">
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
                  setHoverPreview((prev) =>
                    prev?.isSame(date, "day") ? prev : dayjs(date),
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
                (minDate ? dayjs(minDate as any) : undefined)?.toDate() ??
                dayjs().subtract(50, "year").startOf("year").toDate()
              }
              endMonth={
                (maxDate ? dayjs(maxDate as any) : undefined)?.toDate() ??
                dayjs().add(50, "year").endOf("year").toDate()
              }
              onSelect={(date) => {
                const dayjsDate = getDestinationValue(date);
                setValue(dayjsDate);
                setInputValue(dayjsDate.format(format));
                setMonth(date);

                // setValue(date);
                // setInputValue(date.format(format));
                // setMonth(date.toDate());
                // Selecting a day commits selection; clear any pending year commit
                setPendingYearCommit(false);
                setOpen(false);
              }}
              disabled={(date) => {
                if (disabledDate) {
                  // Pass both the date and the required info object
                  const currentArg =
                    valueType === "date"
                      ? (getDestinationValue(date).toDate() as any)
                      : (getDestinationValue(date) as any);
                  return disabledDate(currentArg, {
                    type: "date",
                  });
                }
                return false;
              }}
              components={{
                CaptionLabel: BaseCaptionLabel,
                ...(pickerMode === "year"
                  ? {
                      MonthGrid: YearModeMonthGrid,
                      CaptionLabel: YearModeCaptionLabel,
                    }
                  : {}),
              }}
            />
          </div>
        }
      >
        <div data-slot="picker-input" className={cn("inline-flex", className)}>
          <Input
            ref={composedRef}
            id={id}
            value={
              open && hoverPreview ? hoverPreview.format(format) : inputValue
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
                  const parsed = dayjs(inputValue, format);
                  if (parsed.isValid()) {
                    setValue(parsed);
                    setInputValue(parsed.format(format));
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
                const parsed = dayjs(newValue, format);
                if (parsed.isValid()) {
                  setMonth(parsed.toDate());
                }
              }
            }}
            onBlur={(e) => {
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
                const parsed = dayjs(inputValue, format);
                if (parsed.isValid()) {
                  setValue(parsed);
                  setInputValue(parsed.format(format));
                  setTypedDate(parsed.toDate());
                } else {
                  // Invalid input - revert to previous value
                  setInputValue(value ? value.format(format) : "");
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
