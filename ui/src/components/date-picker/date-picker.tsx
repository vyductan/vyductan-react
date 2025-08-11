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
  };

type DatePickerProps<DateValueType extends Dayjs = Dayjs> =
  DatePickerBaseProps & {
    ref?: React.Ref<InputRef>;
    defaultValue?: DateValueType | null;
    value?: DateValueType | null;
    /** Callback function, can be executed when the selected time is changing */
    onChange?: (
      date: DateValueType | null | undefined,
      dateString: string,
    ) => void;
    /**
     * Function that determines whether a date should be disabled
     * @param current The current date to check
     * @returns boolean indicating if the date should be disabled
     */
    disabledDate?: DisabledDate<DateValueType>;
    placeholder?: string;
    minDate?: DateValueType;
    maxDate?: DateValueType;
    picker?: PickerMode;

    styles?: {
      root?: React.CSSProperties;
    };
    classNames?: {
      root?: string;
    };
  };
const DatePicker = <DateValueType extends Dayjs = Dayjs>(
  props: DatePickerProps<DateValueType>,
) => {
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
    ...rest
  } = props;

  const [pickerMode, setPickerMode] = useState(picker || "date");

  const [open, setOpen] = useState(false);
  const { format: formatConfig } = useComponentConfig("datePicker");

  // ====================== Format Date =======================
  const datePickerConfig = useUiConfig((state) => state.components.datePicker);
  const format =
    formatProp ??
    (picker === "year"
      ? "YYYY"
      : showTime
        ? `${formatConfig ?? datePickerConfig?.format} HH:mm`
        : (formatConfig ?? datePickerConfig?.format ?? "YYYY-MM-DD"));

  // ====================== Value =======================
  const [value, setValue] = useMergedState(defaultValue, {
    value: valueProp,
    onChange: (value) => {
      onChange?.(value, value ? value.format(format) : "");
    },
  });
  const preInputValue = value ? (value as Dayjs).format(format) : "";
  const [inputValue, setInputValue] = useMergedState(preInputValue);

  // Sync input value when value changes
  useEffect(() => {
    const newInputValue = value ? (value as Dayjs).format(format) : "";
    setInputValue(newInputValue);
  }, [value, format, setInputValue]);

  const getDestinationValue = (date: Date): DateValueType => {
    const dayjsDate = dayjs(date);
    return dayjsDate as DateValueType;
  };

  const inputRef = React.useRef<InputRef>(null);

  const composedRef = ref ? composeRef(ref, inputRef) : inputRef;
  const handleChangeInput = (value: string) => {
    if (value.trim()) {
      const parsed = dayjs(value, format);
      if (parsed.isValid()) {
        setValue(parsed as DateValueType);
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
    value ? (value as Dayjs).toDate() : undefined,
  );
  const [typedDate, setTypedDate] = React.useState<Date | undefined>(
    value ? (value as Dayjs).toDate() : undefined,
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
      setMonth((value as Dayjs).toDate());
      setTypedDate((value as Dayjs).toDate());
    } else {
      setTypedDate(undefined);
    }
  }, [inputValue, value, format]);

  const currentYear = useMemo(() => value ?? dayjs(), [value]);

  const [currentDecadeRange, setCurrentDecadeRange] = useState<Dayjs[]>(() =>
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
        }}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
        content={
          <div className="flex">
            <Calendar
              mode="single"
              captionLayout="dropdown"
              // initialFocus // disable default focus (in shadcn default is true)
              // defaultMonth={value && toDate(value)}
              month={month}
              onMonthChange={setMonth}
              selected={
                typedDate ?? (value ? (value as Dayjs).toDate() : undefined)
              }
              startMonth={
                minDate
                  ? (minDate as Dayjs).toDate()
                  : dayjs().subtract(50, "year").startOf("year").toDate()
              }
              endMonth={
                maxDate
                  ? (maxDate as Dayjs).toDate()
                  : dayjs().add(50, "year").endOf("year").toDate()
              }
              onSelect={(date) => {
                if (date) {
                  const dayjsDate = getDestinationValue(date);
                  setValue(dayjsDate);
                  setInputValue((dayjsDate as Dayjs).format(format));
                  setMonth(date);
                }
                setOpen(false);
              }}
              disabled={(date) => {
                if (disabledDate) {
                  // Pass both the date and the required info object
                  return disabledDate(getDestinationValue(date), {
                    type: "date",
                  });
                }
                return false;
              }}
              components={{
                CaptionLabel: ({ className, ...props }) => {
                  const d = month ?? new Date();
                  const m = dayjs(d);
                  const monthText = m.format("MMM");
                  const yearText = m.format("YYYY");
                  return (
                    <span className={cn("space-x-2", className)} {...props}>
                      <Button
                        variant="outline"
                        tabIndex={-1}
                        aria-hidden="true"
                      >
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
                ...(pickerMode === "year"
                  ? {
                      MonthGrid: () => {
                        return (
                          <YearSelect
                            value={value}
                            onChange={(year) => {
                              if (!year) {
                                setPickerMode("date");
                                return;
                              }

                              // If DatePicker acts as a pure year picker, commit the selection
                              if (picker === "year") {
                                const y = year.startOf("year");
                                setValue(y as DateValueType);
                                setInputValue(y.format(format));
                                setMonth(y.toDate());
                                setOpen(false);
                                return;
                              }

                              // Otherwise, only navigate calendar to selected year (do not change value)
                              const base = dayjs(month ?? new Date());
                              const newMonth = base
                                .year(year.year())
                                .startOf("month")
                                .toDate();
                              setMonth(newMonth);
                              setPickerMode("date");
                            }}
                          />
                        );
                      },
                      CaptionLabel: (props) => {
                        return (
                          <span {...props}>
                            {computedDecadeRange.start}-
                            {computedDecadeRange.end}
                          </span>
                        );
                      },
                    }
                  : {}),

                YearsDropdown: ({
                  value,
                  className,
                  classNames,
                  components,
                  ...selectProps
                }) => {
                  return (
                    <span
                      data-disabled={selectProps.disabled}
                      className={cn(classNames.dropdown_root)}
                    >
                      <Button
                        variant="text"
                        onClick={() => {
                          console.log("click");
                          setPickerMode("year");
                        }}
                        className={cn(
                          // "hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-md px-2 py-1 transition-colors",
                          className,
                          // classNames.dropdown,
                          // classNames.years_dropdown,
                        )}
                      >
                        {value}
                      </Button>
                    </span>
                  );
                },
              }}
            />
          </div>
        }
      >
        <div data-slot="picker-input" className={cn("inline-flex", className)}>
          <Input
            ref={composedRef}
            id={id}
            value={inputValue}
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
                    setValue(parsed as DateValueType);
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
                  setValue(parsed as DateValueType);
                  setInputValue(parsed.format(format));
                  setTypedDate(parsed.toDate());
                } else {
                  // Invalid input - revert to previous value
                  setInputValue(value ? (value as Dayjs).format(format) : "");
                  setTypedDate(value ? (value as Dayjs).toDate() : undefined);
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
