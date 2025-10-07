"use client";

import type { Dayjs } from "dayjs";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useMergedState } from "@rc-component/util";
import { composeRef } from "@rc-component/util/lib/ref";
import dayjs from "dayjs";

import { cn } from "@acme/ui/lib/utils";

import type { InputRef } from "../input";
import type { DatePickerBaseProps } from "./date-picker";
import { Icon } from "../../icons";
import { Calendar } from "../calendar";
import { inputSizeVariants, inputVariants } from "../input";
import { Input } from "../input/input";
import { Popover } from "../popover";

type RangeValueType = [Dayjs | null, Dayjs | null];

type DateRangePickerProps = DatePickerBaseProps & {
  ref?: React.Ref<InputRef>;

  value?: RangeValueType | null;
  defaultValue?: RangeValueType | null;
  /** Callback function, can be executed when the selected time is changing */
  onChange?: (dates: RangeValueType | null) => void;

  placeholder?: [string, string];

  variant?: "outlined" | "filled" | "borderless";
  size?: "small" | "middle" | "large";
  status?: "error" | "warning";

  styles?: {
    root?: React.CSSProperties;
  };
  classNames?: {
    root?: string;
  };
};

const DateRangePicker = (props: DateRangePickerProps) => {
  const {
    ref,
    id,

    value: valueProp,
    defaultValue,
    onChange,

    placeholder,
    format: formatProp = "YYYY-MM-DD",
    showTime,

    classNames: _,
    styles: __,
    disabled,
    allowClear = false,
    variant,
    size,
    status,

    className,
    ...rest
  } = props;
  const [open, setOpen] = useState(false);
  const [activeInput, setActiveInput] = useState<"start" | "end" | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  // ====================== Format Date =======================
  const format = showTime ? `${formatProp} HH:mm` : formatProp;

  // Convert Date to Dayjs
  const toDayjs = (v: Dayjs | Date | null | undefined): Dayjs | undefined => {
    if (!v) return undefined;
    return dayjs(v as any);
  };

  const controlledValue = useMemo<RangeValueType | undefined>(() => {
    if (!valueProp) return;
    return [toDayjs(valueProp[0]) ?? null, toDayjs(valueProp[1]) ?? null];
  }, [valueProp]);

  const defaultDayjsValue = useMemo<RangeValueType | undefined>(() => {
    if (!defaultValue) return;
    return [toDayjs(defaultValue[0]) ?? null, toDayjs(defaultValue[1]) ?? null];
  }, [defaultValue]);

  // ====================== Value =======================
  const [value, setValue] = useMergedState<RangeValueType | undefined>(
    defaultDayjsValue,
    {
      value: controlledValue,
      onChange: (next) => {
        onChange?.(next ?? null);
      },
    },
  );

  const [startInputValue, setStartInputValue] = useMergedState(
    value?.[0] ? value[0].format(format) : "",
  );
  const [endInputValue, setEndInputValue] = useMergedState(
    value?.[1] ? value[1].format(format) : "",
  );

  // Sync input values when value changes
  useEffect(() => {
    setStartInputValue(value?.[0] ? value[0].format(format) : "");
    setEndInputValue(value?.[1] ? value[1].format(format) : "");
  }, [value, format, setStartInputValue, setEndInputValue]);

  const [month, setMonth] = useState<Date | undefined>(
    value?.[0] ? value[0].toDate() : undefined,
  );

  // =============== Hover Preview (AntD-like) ===============
  const [hoverPreview, setHoverPreview] = useState<
    RangeValueType | undefined
  >();

  const startInputRef = React.useRef<InputRef>(null);
  const endInputRef = React.useRef<InputRef>(null);

  const composedStartRef = ref ? composeRef(ref, startInputRef) : startInputRef;

  const handleStartInputChange = (inputValue: string) => {
    setStartInputValue(inputValue);
    if (inputValue.trim()) {
      const parsed = dayjs(inputValue, format);
      if (parsed.isValid()) {
        setValue([parsed, value?.[1] ?? null]);
        setMonth(parsed.toDate());
      }
    } else {
      setValue([null, value?.[1] ?? null]);
    }
  };

  const handleEndInputChange = (inputValue: string) => {
    setEndInputValue(inputValue);
    if (inputValue.trim()) {
      const parsed = dayjs(inputValue, format);
      if (parsed.isValid()) {
        setValue([value?.[0] ?? null, parsed]);
      }
    } else {
      setValue([value?.[0] ?? null, null]);
    }
  };

  const CalendarComponent = React.useMemo(() => {
    return (
      <Calendar
        mode="range"
        required
        numberOfMonths={2}
        month={month}
        onMonthChange={setMonth}
        selected={
          value
            ? {
                from: value[0] ? value[0].toDate() : undefined,
                to: value[1] ? value[1].toDate() : undefined,
              }
            : undefined
        }
        onSelect={(dateRange, triggerDate, modifiers) => {
          if (!triggerDate) return;

          const selectedDate = dayjs(triggerDate);

          // Use activeInput to determine which date to set
          if (activeInput === "start") {
            // Selecting start date
            setValue([selectedDate, value?.[1] ?? null]);
            setStartInputValue(selectedDate.format(format));
            setActiveInput("end");
            // Focus end input
            setTimeout(() => endInputRef.current?.focus(), 0);
          } else if (activeInput === "end") {
            // Selecting end date
            setValue([value?.[0] ?? null, selectedDate]);
            setEndInputValue(selectedDate.format(format));
            setActiveInput(null);
            setOpen(false);
          } else {
            // No active input - default to start
            setValue([selectedDate, null]);
            setStartInputValue(selectedDate.format(format));
            setEndInputValue("");
            setActiveInput("end");
            setTimeout(() => endInputRef.current?.focus(), 0);
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
  ]);

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

  return (
    <>
      <Popover
        className="w-auto p-0"
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
        >
          <div className="relative flex-1">
            <Input
              ref={composedStartRef}
              id={id}
              value={
                open && hoverPreview?.[0]
                  ? hoverPreview[0].format(format)
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
                    hoverPreview?.[0] &&
                    !value?.[0]?.isSame(hoverPreview[0], "day") &&
                    "text-muted-foreground",
                ),
              }}
              onClick={(e) => {
                if (open) {
                  e.preventDefault();
                  setActiveInput("start");
                } else {
                  setOpen(true);
                  setActiveInput("start");
                }
              }}
              onFocus={() => {
                setActiveInput("start");
              }}
              onKeyUp={(event) => {
                event.stopPropagation();
                if (event.key === "Enter") {
                  handleStartInputChange(event.currentTarget.value);
                  endInputRef.current?.focus();
                } else if (event.key === "Escape") {
                  setOpen(false);
                }
              }}
              onChange={(event) => {
                const newValue = event.currentTarget.value;
                setStartInputValue(newValue);
                if (newValue.trim()) {
                  const parsed = dayjs(newValue, format);
                  if (parsed.isValid()) {
                    setMonth(parsed.toDate());
                  }
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
                    relatedTarget === endInputRef.current?.input)
                ) {
                  return;
                }

                if (startInputValue.trim()) {
                  const parsed = dayjs(startInputValue, format);
                  if (parsed.isValid()) {
                    setValue([parsed, value?.[1] ?? null]);
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
              ref={endInputRef}
              value={
                open && hoverPreview?.[1]
                  ? hoverPreview[1].format(format)
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
                    hoverPreview?.[1] &&
                    !value?.[1]?.isSame(hoverPreview[1], "day") &&
                    "text-muted-foreground",
                ),
              }}
              onClick={(e) => {
                if (open) {
                  e.preventDefault();
                  setActiveInput("end");
                } else {
                  setOpen(true);
                  setActiveInput("end");
                }
              }}
              onFocus={() => {
                setActiveInput("end");
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
                if (newValue.trim()) {
                  const parsed = dayjs(newValue, format);
                  if (parsed.isValid()) {
                    setMonth(parsed.toDate());
                  }
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
                    relatedTarget === startInputRef.current?.input)
                ) {
                  return;
                }

                if (endInputValue.trim()) {
                  const parsed = dayjs(endInputValue, format);
                  if (parsed.isValid()) {
                    setValue([value?.[0] ?? null, parsed]);
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
              icon="icon-[mingcute--calendar-2-line]"
              className="ml-auto size-4 shrink-0 opacity-50"
            />
          )}
        </div>
      </Popover>
    </>
  );
};

export type { DateRangePickerProps };
export { DateRangePicker };
