/* eslint-disable react-hooks/set-state-in-effect -- Range picker synchronizes calendar panel month from controlled range values. */
"use client";

import type { Dayjs } from "dayjs";
import * as React from "react";
import { useEffect, useState } from "react";
import { useMergedState } from "@rc-component/util";
import dayjs from "dayjs";

import { cn } from "@acme/ui/lib/utils";

import type { InputRef as InputReference } from "../input";
import type {
  DatePickerBaseProps as DatePickerBaseProperties,
  DisabledTimeConfig,
} from "./date-picker";
import type { DisabledDate } from "./types";
import { Icon } from "../../icons";
import { Calendar } from "../calendar";
import { RangeCalendar } from "../calendar/range-calendar";
import { useComponentConfig } from "../config-provider/context";
import { inputSizeVariants, inputVariants } from "../input";
import { Input } from "../input/input";
import { Popover } from "../popover";
import { parseInputDate } from "./parse-input-date";

type RangeValueType = [Dayjs | null, Dayjs | null];
type RangePickerType = "start" | "end";
type DisabledRangeTime = (
  date: Dayjs | null,
  type: RangePickerType,
) => DisabledTimeConfig;

type DateRangePickerProperties = DatePickerBaseProperties & {
  ref?: React.Ref<InputReference>;

  value?: RangeValueType | null;
  defaultValue?: RangeValueType | null;
  /** Callback function, can be executed when the selected time is changing */
  onChange?: (dates: RangeValueType | null) => void;

  placeholder?: [string, string];

  variant?: "outlined" | "filled" | "borderless";
  size?: "small" | "middle" | "large";
  status?: "error" | "warning";

  /** Show separate calendars for start and end dates instead of single calendar with 2 panels */
  separateCalendars?: boolean;
  disabledDate?: DisabledDate<Dayjs>;
  disabledTime?: DisabledRangeTime;

  style?: React.CSSProperties;
  styles?: {
    root?: React.CSSProperties;
  };
  classNames?: {
    root?: string;
  };
};

const DateRangePicker = (properties: DateRangePickerProperties) => {
  const {
    ref,
    id,

    value: valueProperty,
    defaultValue,
    onChange,

    placeholder,
    format: formatProperty,
    showTime,

    style,
    classNames: _,
    styles: __,
    disabled,
    allowClear = false,
    variant,
    size,
    status,
    separateCalendars = true,
    minDate,
    maxDate,
    disabledDate,
    disabledTime,

    className,
    ...rest
  } = properties;
  const {
    format: formatConfig,
    captionLayout: captionLayoutConfig,
    // commitYearOnClose: commitYearOnCloseConfig,
  } = useComponentConfig("datePicker");

  const [open, setOpen] = useState(false);
  const [activeInput, setActiveInput] = useState<"start" | "end" | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  // ====================== Format Date =======================
  const fallbackFormat = showTime
    ? `${formatConfig ?? "YYYY-MM-DD"} HH:mm`
    : (formatConfig ?? "YYYY-MM-DD");
  const format = formatProperty ?? fallbackFormat;

  const isDateAllowed = React.useCallback(
    (date: Dayjs) => {
      if (minDate && date.isBefore(minDate, "day")) return false;
      if (maxDate && date.isAfter(maxDate, "day")) return false;
      if (disabledDate?.(date, { type: "date" })) return false;
      return true;
    },
    [disabledDate, maxDate, minDate],
  );

  const isTimeAllowed = React.useCallback(
    (date: Dayjs, type: RangePickerType) => {
      if (!showTime || !disabledTime) return true;

      const config = disabledTime(date, type);
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
    (date: Dayjs, type: RangePickerType) =>
      isDateAllowed(date) && isTimeAllowed(date, type),
    [isDateAllowed, isTimeAllowed],
  );

  // ====================== Value =======================
  const [value, setValue] = useMergedState(defaultValue, {
    value: valueProperty,
    onChange: (next) => {
      onChange?.(next ?? null);
    },
  });

  const commitInputRange = React.useCallback(
    (startDate: Dayjs | null, endDate: Dayjs | null) => {
      if (startDate && !isSelectableValue(startDate, "start")) return false;
      if (endDate && !isSelectableValue(endDate, "end")) return false;
      setValue([startDate, endDate]);
      return true;
    },
    [isSelectableValue, setValue],
  );

  const [startInputValue, setStartInputValue] = useMergedState(
    value?.[0] ? value[0].format(format) : "",
  );
  const [endInputValue, setEndInputValue] = useMergedState(
    value?.[1] ? value[1].format(format) : "",
  );

  // State for hover preview
  const [hoverPreview, setHoverPreview] = useState<Dayjs | undefined>();

  // Sync input values when value changes
  useEffect(() => {
    setStartInputValue(value?.[0] ? value[0].format(format) : "");
    setEndInputValue(value?.[1] ? value[1].format(format) : "");
  }, [value, format, setStartInputValue, setEndInputValue]);

  const [month, setMonth] = useState<Date | undefined>(
    value?.[0] ? value[0].toDate() : new Date(),
  );

  // Update month when value changes
  useEffect(() => {
    if (value?.[0]) {
      setMonth(value[0].toDate());
    }
  }, [value]);

  // Update month when activeInput changes
  useEffect(() => {
    if (activeInput === "start" && value?.[0]) {
      setMonth(value[0].toDate());
    } else if (activeInput === "end" && value?.[1]) {
      // For end date, show the month in the second panel (month - 1)
      const endDate = value[1].toDate();
      const previousMonth = new Date(
        endDate.getFullYear(),
        endDate.getMonth() - 1,
        1,
      );
      setMonth(previousMonth);
    }
  }, [activeInput, value]);

  // =============== Hover Preview (AntD-like) ===============
  // hoverPreview is already declared above

  const startInputReference = React.useRef<InputReference>(null);
  const endInputReference = React.useRef<InputReference>(null);

  const composedStartReference = React.useCallback<
    React.RefCallback<InputReference>
  >(
    (node) => {
      startInputReference.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );

  const handleStartInputChange = (inputValue: string) => {
    setStartInputValue(inputValue);
    if (inputValue.trim()) {
      const parsed = parseInputDate(inputValue, format);
      if (parsed && isSelectableValue(parsed, "start")) {
        const endDate = value?.[1] ?? null;
        if (endDate && parsed.isAfter(endDate)) {
          if (commitInputRange(endDate, parsed)) {
            setStartInputValue(endDate.format(format));
            setEndInputValue(parsed.format(format));
          }
        } else if (commitInputRange(parsed, endDate)) {
          setStartInputValue(parsed.format(format));
        }
        setMonth(parsed.toDate());
      }
    } else {
      setValue([null, value?.[1] ?? null]);
    }
  };

  const handleEndInputChange = (inputValue: string) => {
    setEndInputValue(inputValue);
    if (inputValue.trim()) {
      const parsed = parseInputDate(inputValue, format);
      if (parsed && isSelectableValue(parsed, "end")) {
        const startDate = value?.[0] ?? null;
        if (startDate && parsed.isBefore(startDate)) {
          if (commitInputRange(parsed, startDate)) {
            setStartInputValue(parsed.format(format));
            setEndInputValue(startDate.format(format));
          }
        } else if (commitInputRange(startDate, parsed)) {
          setEndInputValue(parsed.format(format));
        }
      }
    } else {
      setValue([value?.[0] ?? null, null]);
    }
  };

  const CalendarComponent = React.useMemo(() => {
    // If separateCalendars is true, render 2 separate calendars using RangeCalendar
    if (separateCalendars) {
      return (
        <RangeCalendar
          value={value}
          onChange={(dates) => {
            setValue(dates ?? undefined);
            if (dates?.[0]) {
              setStartInputValue(dates[0].format(format));
            }
            if (dates?.[1]) {
              setEndInputValue(dates[1].format(format));
            }
            // When user is focused on input 1 (start) and selects a date,
            // always switch to input 2 and keep panel open (even if both inputs have values)
            if (activeInput === "start") {
              setActiveInput("end");
              setTimeout(() => endInputReference.current?.focus(), 0);
            } else if (activeInput === "end" && dates?.[1]) {
              // Only close panel when selecting end date while focused on input 2
              setTimeout(() => {
                setActiveInput(null);
                setOpen(false);
              }, 100);
            } else if (!activeInput) {
              // No active input - if start date selected, switch to input 2
              if (dates?.[0] && !dates[1]) {
                setActiveInput("end");
                setTimeout(() => endInputReference.current?.focus(), 0);
              } else if (dates?.[1]) {
                // Both dates selected without active input - close panel
                setTimeout(() => {
                  setActiveInput(null);
                  setOpen(false);
                }, 100);
              }
            }
          }}
          format={format}
          captionLayout={captionLayoutConfig}
          minDate={minDate}
          maxDate={maxDate}
          disabled={(date: Date) => disabled || !isDateAllowed(dayjs(date))}
          activeInput={activeInput}
          hoverPreview={hoverPreview}
          onHoverPreviewChange={setHoverPreview}
          onStartMonthChange={(month) => {
            setMonth(month);
          }}
          onEndMonthChange={(month) => {
            setMonth(month);
          }}
        />
      );
    }

    // Default behavior: single calendar with 2 panels
    return (
      <Calendar
        mode="range"
        required
        captionLayout={captionLayoutConfig}
        numberOfMonths={2}
        month={month}
        onMonthChange={setMonth}
        startMonth={
          minDate?.toDate() ??
          dayjs().subtract(50, "year").startOf("year").toDate()
        }
        endMonth={
          maxDate?.toDate() ?? dayjs().add(50, "year").endOf("year").toDate()
        }
        selected={
          value
            ? {
                from: value[0] ? value[0].toDate() : undefined,
                to: value[1] ? value[1].toDate() : undefined,
              }
            : undefined
        }
        disabled={(date: Date) => disabled || !isDateAllowed(dayjs(date))}
        onSelect={(_selected, triggerDate) => {
          const selectedDate = dayjs(triggerDate);
          if (!isDateAllowed(selectedDate)) return;

          // Use activeInput to determine which date to set
          if (activeInput === "start") {
            // Selecting start date
            const endDate = value?.[1] ?? null;
            // If end date exists and selected start date is after end date, swap them
            if (endDate && selectedDate.isAfter(endDate)) {
              setValue([endDate, selectedDate]);
              setStartInputValue(endDate.format(format));
              setEndInputValue(selectedDate.format(format));
            } else {
              setValue([selectedDate, endDate]);
              setStartInputValue(selectedDate.format(format));
            }
            setActiveInput("end");
            // Update month to show end date month in the second panel if it exists
            if (value?.[1]) {
              const endDate = value[1].toDate();
              const previousMonth = new Date(
                endDate.getFullYear(),
                endDate.getMonth() - 1,
                1,
              );
              setMonth(previousMonth);
            }
            // Focus end input
            setTimeout(() => endInputReference.current?.focus(), 0);
          } else if (activeInput === "end") {
            // Selecting end date
            const startDate = value?.[0] ?? null;
            // If start date exists and selected end date is before start date, swap them
            if (startDate && selectedDate.isBefore(startDate)) {
              setValue([selectedDate, startDate]);
              setStartInputValue(selectedDate.format(format));
              setEndInputValue(startDate.format(format));
            } else {
              setValue([startDate, selectedDate]);
              setEndInputValue(selectedDate.format(format));
            }
            setActiveInput(null);
            setOpen(false);
          } else {
            // No active input - default to start
            setValue([selectedDate, null]);
            setStartInputValue(selectedDate.format(format));
            setEndInputValue("");
            setActiveInput("end");
            setTimeout(() => endInputReference.current?.focus(), 0);
          }
        }}
      />
    );
  }, [
    value,
    setValue,
    format,
    month,
    activeInput,
    setStartInputValue,
    setEndInputValue,
    captionLayoutConfig,
    separateCalendars,
    minDate,
    maxDate,
    disabled,
    hoverPreview,
    isDateAllowed,
    setHoverPreview,
  ]);

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

  return (
    <>
      <Popover
        trigger="click"
        placement="bottomLeft"
        align={{
          offset: [-12, 10],
        }}
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
          if (!open) {
            setActiveInput(null);
            setHoverPreview(undefined);
          }
        }}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
        content={<div className="flex">{CalendarComponent}</div>}
      >
        <div
          role="combobox"
          data-slot="picker-input"
          className={cn(
            inputVariants({ variant, disabled, status }),
            inputSizeVariants({ size }),
            "inline-flex items-center gap-2",
            activeInput && "border-primary ring-primary/20 ring-2",
            className,
          )}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          style={style}
        >
          <div className="relative flex-1">
            <Input
              ref={composedStartReference}
              id={id}
              value={
                open && hoverPreview && activeInput === "start"
                  ? hoverPreview.format(format)
                  : startInputValue
              }
              placeholder={placeholder?.[0] ?? "Start Date"}
              variant="borderless"
              size={size}
              htmlSize={12}
              disabled={disabled}
              classNames={{
                // root: "border-0 shadow-none p-0 h-auto",
                input: cn(
                  "border-0 shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                  open &&
                    hoverPreview &&
                    activeInput === "start" &&
                    !value?.[0]?.isSame(hoverPreview, "day") &&
                    "text-muted-foreground",
                ),
              }}
              onClick={(e) => {
                if (open) {
                  e.preventDefault();
                  setActiveInput("start");
                  if (value?.[0]) {
                    setMonth(value[0].toDate());
                  }
                } else {
                  setOpen(true);
                  setActiveInput("start");
                  if (value?.[0]) {
                    setMonth(value[0].toDate());
                  }
                }
              }}
              onFocus={() => {
                setActiveInput("start");
                if (value?.[0]) {
                  setMonth(value[0].toDate());
                }
              }}
              onKeyUp={(event) => {
                event.stopPropagation();
                if (event.key === "Enter") {
                  handleStartInputChange(event.currentTarget.value);
                  setActiveInput("end");
                  if (value?.[1]) {
                    // For end date, show the month in the second panel (month - 1)
                    const endDate = value[1].toDate();
                    const previousMonth = new Date(
                      endDate.getFullYear(),
                      endDate.getMonth() - 1,
                      1,
                    );
                    setMonth(previousMonth);
                  }
                  endInputReference.current?.focus();
                } else if (event.key === "Escape") {
                  setOpen(false);
                }
              }}
              onChange={(event) => {
                const newValue = event.currentTarget.value;
                setStartInputValue(newValue);
                if (parseInputDate(newValue, format)) {
                  handleStartInputChange(newValue);
                }
              }}
              onBlur={(e) => {
                const relatedTarget = e.relatedTarget as
                  | HTMLElement
                  | undefined;
                const calendarContainer = document.querySelector(
                  '[data-slot="calendar"]',
                );
                const popoverContainer = document.querySelector(
                  '[data-slot="popover-content"]',
                );

                if (
                  relatedTarget &&
                  (calendarContainer?.contains(relatedTarget) ||
                    popoverContainer?.contains(relatedTarget) ||
                    relatedTarget.closest('[data-slot="calendar"]') ||
                    relatedTarget.closest('[data-slot="popover-content"]') ||
                    relatedTarget === endInputReference.current?.input)
                ) {
                  return;
                }

                if (startInputValue.trim()) {
                  const parsed = parseInputDate(startInputValue, format);
                  if (parsed && isSelectableValue(parsed, "start")) {
                    handleStartInputChange(startInputValue);
                  } else {
                    setStartInputValue(
                      value?.[0] ? value[0].format(format) : "",
                    );
                  }
                } else {
                  setValue([null, value?.[1] ?? null]);
                }
              }}
              {...rest}
            />
            {activeInput === "start" && (
              <div className="bg-primary absolute right-0 bottom-0 left-0 h-0.5" />
            )}
          </div>
          <Icon
            icon="icon-[mingcute--arrow-right-line]"
            className="text-muted-foreground size-4 shrink-0"
          />
          <div className="relative flex-1">
            <Input
              ref={endInputReference}
              value={
                open && hoverPreview && activeInput === "end"
                  ? hoverPreview.format(format)
                  : endInputValue
              }
              placeholder={placeholder?.[1] ?? "End Date"}
              variant="borderless"
              size={size}
              htmlSize={12}
              disabled={disabled}
              classNames={{
                // root: "border-0 shadow-none p-0 h-auto",
                input: cn(
                  "border-0 shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                  open &&
                    hoverPreview &&
                    activeInput === "end" &&
                    !value?.[1]?.isSame(hoverPreview, "day") &&
                    "text-muted-foreground",
                ),
              }}
              onClick={(e) => {
                if (open) {
                  e.preventDefault();
                  setActiveInput("end");
                  if (value?.[1]) {
                    // For end date, show the month in the second panel (month - 1)
                    const endDate = value[1].toDate();
                    const previousMonth = new Date(
                      endDate.getFullYear(),
                      endDate.getMonth() - 1,
                      1,
                    );
                    setMonth(previousMonth);
                  }
                } else {
                  setOpen(true);
                  setActiveInput("end");
                  if (value?.[1]) {
                    // For end date, show the month in the second panel (month - 1)
                    const endDate = value[1].toDate();
                    const previousMonth = new Date(
                      endDate.getFullYear(),
                      endDate.getMonth() - 1,
                      1,
                    );
                    setMonth(previousMonth);
                  }
                }
              }}
              onFocus={() => {
                setActiveInput("end");
                if (value?.[1]) {
                  // For end date, show the month in the second panel (month - 1)
                  const endDate = value[1].toDate();
                  const previousMonth = new Date(
                    endDate.getFullYear(),
                    endDate.getMonth() - 1,
                    1,
                  );
                  setMonth(previousMonth);
                }
              }}
              onKeyUp={(event) => {
                event.stopPropagation();
                if (event.key === "Enter") {
                  handleEndInputChange(event.currentTarget.value);
                  setOpen(false);
                } else if (event.key === "Escape") {
                  setOpen(false);
                }
              }}
              onChange={(event) => {
                const newValue = event.currentTarget.value;
                setEndInputValue(newValue);
                if (parseInputDate(newValue, format)) {
                  handleEndInputChange(newValue);
                }
              }}
              onBlur={(e) => {
                const relatedTarget = e.relatedTarget as
                  | HTMLElement
                  | undefined;
                const calendarContainer = document.querySelector(
                  '[data-slot="calendar"]',
                );
                const popoverContainer = document.querySelector(
                  '[data-slot="popover-content"]',
                );

                if (
                  relatedTarget &&
                  (calendarContainer?.contains(relatedTarget) ||
                    popoverContainer?.contains(relatedTarget) ||
                    relatedTarget.closest('[data-slot="calendar"]') ||
                    relatedTarget.closest('[data-slot="popover-content"]') ||
                    relatedTarget === startInputReference.current?.input)
                ) {
                  return;
                }

                if (endInputValue.trim()) {
                  const parsed = parseInputDate(endInputValue, format);
                  if (parsed && isSelectableValue(parsed, "end")) {
                    handleEndInputChange(endInputValue);
                  } else {
                    setEndInputValue(value?.[1] ? value[1].format(format) : "");
                  }
                } else {
                  setValue([value?.[0] ?? null, null]);
                }
                setOpen(false);
              }}
              {...rest}
            />
            {activeInput === "end" && (
              <div className="bg-primary absolute right-0 bottom-0 left-0 h-0.5" />
            )}
          </div>
          {allowClear && isHovering && (value?.[0] || value?.[1]) ? (
            <button
              type="button"
              className="ml-auto flex size-4 shrink-0 items-center justify-center opacity-50 transition-opacity hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                setValue(undefined);
                setStartInputValue("");
                setEndInputValue("");
              }}
            >
              <Icon
                icon="icon-[ant-design--close-circle-filled]"
                className="size-4"
              />
            </button>
          ) : (
            <Icon
              aria-hidden="true"
              icon="icon-[mingcute--calendar-2-line]"
              className="ml-auto size-4 shrink-0 opacity-50"
            />
          )}
        </div>
      </Popover>
    </>
  );
};

export type { DateRangePickerProperties as DateRangePickerProps };
export { DateRangePicker };
