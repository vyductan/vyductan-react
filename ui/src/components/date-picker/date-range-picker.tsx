import React, { useEffect, useMemo } from "react";
import type { DateRange } from "react-day-picker";
import { Slot } from "@radix-ui/react-slot";
import { useMergedState } from "@rc-component/util";
import { composeRef } from "@rc-component/util/lib/ref";
import { useHover } from "ahooks";
import { formatDate, toDate } from "date-fns";

import { cn } from "@acme/ui/lib/utils";

import type { AnyObject } from "../_util/type";
import type { DatePickerBaseProps } from "./date-picker";
import { Icon } from "../../icons";
import { Calendar } from "../calendar";
import { RangeCalendar } from "../calendar/range-calendar";
import { useComponentConfig } from "../config-provider/context";
import { inputSizeVariants, inputVariants } from "../input";
import { Popover } from "../popover";

type RangeValueType<DateType> = [
  start: DateType | null | undefined,
  end: DateType | null | undefined,
];
type NoUndefinedRangeValueType<DateType> = [
  start: DateType | null,
  end: DateType | null,
];

type DateRangePickerProps<DateType extends AnyObject = Date> =
  DatePickerBaseProps & {
    ref?: React.RefObject<HTMLDivElement | null>;

    value?: RangeValueType<DateType> | null;
    defaultValue?: RangeValueType<DateType> | null;
    /** Callback function, can be executed when the selected time is changing */
    onChange?: (dates: NoUndefinedRangeValueType<DateType> | null) => void;

  placeholder?: [string, string];

  variant?: "outlined" | "filled" | "borderless";
  size?: "small" | "middle" | "large";
  status?: "error" | "warning";

  /** Show separate calendars for start and end dates instead of single calendar with 2 panels */
  separateCalendars?: boolean;

  styles?: {
    root?: React.CSSProperties;
  };

const DateRangePicker = <DateType extends AnyObject = Date>({
  ref: refProp,

  id: inputId,

  disabled,
  // borderless,
  format = "dd/MM/yyyy",
  // size,
  // status,
  placeholder,

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

  className,
  allowClear = false,
  suffix = (
    <Icon icon="icon-[mingcute--calendar-2-line]" className="opacity-50" />
  ),

  defaultValue,
  value: valueProp,
  onChange,
}: DateRangePickerProps<DateType>) => {
  const [open, setOpen] = React.useState(false);

  // ====================== Format Date =======================
  format = showTime ? `${format} HH:mm` : format;

  const valueType = React.useMemo(() => {
    let result = "format";
    if (typeof valueProp === "string") {
      result = "format";
    } else if (typeof valueProp === "number") {
      result = "number";
    } else if (typeof valueProp === "object") {
      result = "object";
    }
    return result;
  }, [valueProp]);

  const getDestinationValue = React.useCallback(
    (date: Date) => {
      let result;
      if (valueType === "string") {
        result = formatDate(date, "yyyy-MM-dd'T'HH:mm:ss");
      } else if (valueType === "format") {
        result = formatDate(date, format);
      } else if (typeof valueType === "number") {
        result = date.getTime();
      } else {
        result = date;
      }
      return result as unknown as DateType;
    },
    [format, valueType],
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
      const prevMonth = new Date(
        endDate.getFullYear(),
        endDate.getMonth() - 1,
        1,
      );
      setMonth(prevMonth);
    }
  }, [activeInput, value]);

  // =============== Hover Preview (AntD-like) ===============
  // hoverPreview is already declared above

  const startInputRef = React.useRef<InputRef>(null);
  const endInputRef = React.useRef<InputRef>(null);

  const composedStartRef = ref ? composeRef(ref, startInputRef) : startInputRef;

  const handleStartInputChange = (inputValue: string) => {
    setStartInputValue(inputValue);
    if (inputValue.trim()) {
      const parsed = dayjs(inputValue, format);
      if (parsed.isValid()) {
        const endDate = value?.[1] ?? null;
        // If end date exists and parsed start date is after end date, swap them
        if (endDate && parsed.isAfter(endDate)) {
          setValue([endDate, parsed]);
          setStartInputValue(endDate.format(format));
          setEndInputValue(parsed.format(format));
        } else {
          setValue([parsed, endDate]);
        }
        setMonth(parsed.toDate());
      }
      return pre;
    });
  }, [valueProp, setValue]);

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
            // Auto-focus end input after start date selection
            if (dates?.[0] && !dates[1]) {
              setActiveInput("end");
              setTimeout(() => endInputRef.current?.focus(), 0);
            } else if (dates?.[1]) {
              // Only close panel and reset activeInput if user is not actively focusing an input
              // This prevents interrupting user interaction
              setTimeout(() => {
                setActiveInput(null);
                setOpen(false);
              }, 100);
            }
          }}
          format={format}
          captionLayout={captionLayoutConfig}
          minDate={minDate}
          maxDate={maxDate}
          disabled={disabled}
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
                from: value[0]
                  ? toDate(value[0] as unknown as Date)
                  : undefined,
                to: value[1] ? toDate(value[1] as unknown as Date) : undefined,
              }
            : undefined
        }
        onSelect={(_selected, triggerDate) => {
          const selectedDate = dayjs(triggerDate);

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
              const prevMonth = new Date(
                endDate.getFullYear(),
                endDate.getMonth() - 1,
                1,
              );
              setMonth(prevMonth);
            }
            // Focus end input
            setTimeout(() => endInputRef.current?.focus(), 0);
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
            onChange?.([
              getDestinationValue(dateRange.from!),
              getDestinationValue(dateRange.to),
            ]);
            // if (
            //   value &&
            //   value[0] !== defaultValue?.[0] &&
            //   value[1] !== defaultValue?.[1]
            // ) {
            //   const start = value?.[0];
            //   const end = value?.[1];
            //   if (start !== undefined && end !== undefined) {
            //     onChange?.([start, end]);
            //   }
            // }
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
    setHoverPreview,
  ]);

  const valueCompRef = React.useRef<HTMLDivElement>(null);
  const ref = refProp ? composeRef(refProp, valueCompRef) : valueCompRef;
  const isHovering = useHover(ref as React.RefObject<HTMLDivElement | null>);
  const ClearButton = useMemo(
    () => (
      <button
        type="button"
        className={cn(
          "flex opacity-30 transition-opacity duration-300 hover:opacity-50",
        )}
        onClick={() => {
          setValue(undefined);
          onChange?.([null, null]);
        }}
      >
        <Icon
          icon="icon-[ant-design--close-circle-filled]"
          className="pointer-events-none size-3.5"
        />
      </button>
    ),
    [setValue, onChange],
  );
  const SuffixComp = useMemo(() => {
    if (allowClear && value?.[0] && (!suffix || (isHovering && suffix))) {
      return ClearButton;
    } else if (suffix) {
      return (
        <Slot className={cn("flex shrink-0 items-center")}>
          {typeof suffix === "string" ? <span>{suffix}</span> : suffix}
        </Slot>
      );
    } else {
      return null;
    }
  }, [allowClear, value, suffix, isHovering, ClearButton]);

  const valueCompRef = React.useRef<HTMLDivElement>(null);
  const ref = refProp ? composeRef(refProp, valueCompRef) : valueCompRef;
  const isHovering = useHover(ref as React.RefObject<HTMLDivElement | null>);
  const ClearButton = useMemo(
    () => (
      <button
        type="button"
        className={cn(
          "flex opacity-30 transition-opacity duration-300 hover:opacity-50",
        )}
        onClick={() => {
          setValue(undefined);
          onChange?.([null, null]);
        }}
      >
        <Icon
          icon="icon-[ant-design--close-circle-filled]"
          className="pointer-events-none size-3.5"
        />
      </button>
    ),
    [setValue, onChange],
  );
  const SuffixComp = useMemo(() => {
    if (allowClear && value?.[0] && (!suffix || (isHovering && suffix))) {
      return ClearButton;
    } else if (suffix) {
      return (
        <Slot className={cn("flex shrink-0 items-center")}>
          {typeof suffix === "string" ? <span>{suffix}</span> : suffix}
        </Slot>
      );
    } else {
      return null;
    }
  }, [allowClear, value, suffix, isHovering, ClearButton]);

  const ValueComponent = React.useMemo(() => {
    const input1 = value?.[0]
      ? formatDate(toDate(value[0] as unknown as Date), format)
      : undefined;
    const input2 = value?.[1]
      ? formatDate(toDate(value[1] as unknown as Date), format)
      : undefined;

    return (
      <div
        ref={ref}
        className={cn(
          inputVariants({ disabled }),
          inputSizeVariants(),
          "items-center justify-between gap-2",
          className,
        )}
        onClick={() => {
          if (!open) setOpen(true);
        }}
      >
        <div>
          <span className={cn(!input1 && "text-muted-foreground")}>
            {input1 ?? placeholder?.[0] ?? "Start Date"}
          </span>
          <span className={cn("text-muted-foreground px-2 text-center")}>
            -
          </span>
          <span className={cn(!input2 && "text-muted-foreground")}>
            {input2 ?? placeholder?.[1] ?? "End Date"}
          </span>
        </div>
        {SuffixComp}
      </div>
    );
  }, [
    ref,
    format,
    className,
    value,
    // setValue,
    // allowClear,
    // borderless,
    // inputId,
    open,
    // size,
    // status,
    // ref,
    disabled,
    placeholder,
    SuffixComp,
  ]);

  return (
    <>
      <Popover
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
        }}
        className="w-auto p-0"
        trigger="click"
        placement="bottomLeft"
        onInteractOutside={(event) => {
          if (
            event.target &&
            "id" in event.target &&
            event.target.id !== inputId
          ) {
            setOpen(false);
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
                    const prevMonth = new Date(
                      endDate.getFullYear(),
                      endDate.getMonth() - 1,
                      1,
                    );
                    setMonth(prevMonth);
                  }
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
                    const endDate = value?.[1] ?? null;
                    // If end date exists and parsed start date is after end date, swap them
                    if (endDate && parsed.isAfter(endDate)) {
                      setValue([endDate, parsed]);
                      setStartInputValue(endDate.format(format));
                      setEndInputValue(parsed.format(format));
                    } else {
                      setValue([parsed, endDate]);
                    }
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
                    const endDate = value?.[1] ?? null;
                    // If end date exists and parsed start date is after end date, swap them
                    if (endDate && parsed.isAfter(endDate)) {
                      setValue([endDate, parsed]);
                      setStartInputValue(endDate.format(format));
                      setEndInputValue(parsed.format(format));
                    } else {
                      setValue([parsed, endDate]);
                    }
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
                    const prevMonth = new Date(
                      endDate.getFullYear(),
                      endDate.getMonth() - 1,
                      1,
                    );
                    setMonth(prevMonth);
                  }
                } else {
                  setOpen(true);
                  setActiveInput("end");
                  if (value?.[1]) {
                    // For end date, show the month in the second panel (month - 1)
                    const endDate = value[1].toDate();
                    const prevMonth = new Date(
                      endDate.getFullYear(),
                      endDate.getMonth() - 1,
                      1,
                    );
                    setMonth(prevMonth);
                  }
                }
              }}
              onFocus={() => {
                setActiveInput("end");
                if (value?.[1]) {
                  // For end date, show the month in the second panel (month - 1)
                  const endDate = value[1].toDate();
                  const prevMonth = new Date(
                    endDate.getFullYear(),
                    endDate.getMonth() - 1,
                    1,
                  );
                  setMonth(prevMonth);
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
                if (newValue.trim()) {
                  const parsed = dayjs(newValue, format);
                  if (parsed.isValid()) {
                    const startDate = value?.[0] ?? null;
                    // If start date exists and parsed end date is before start date, swap them
                    if (startDate && parsed.isBefore(startDate)) {
                      setValue([parsed, startDate]);
                      setStartInputValue(parsed.format(format));
                      setEndInputValue(startDate.format(format));
                    } else {
                      setValue([startDate, parsed]);
                    }
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
                    const startDate = value?.[0] ?? null;
                    // If start date exists and parsed end date is before start date, swap them
                    if (startDate && parsed.isBefore(startDate)) {
                      setValue([parsed, startDate]);
                      setStartInputValue(parsed.format(format));
                      setEndInputValue(startDate.format(format));
                    } else {
                      setValue([startDate, parsed]);
                    }
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
