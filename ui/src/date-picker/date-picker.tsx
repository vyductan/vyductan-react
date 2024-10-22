"use client";

import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { format as formatDate, toDate } from "date-fns";
import { useMergedState } from "rc-util";

import type { InputVariants } from "../input";
import { cn } from "..";
import { Calendar } from "../calendar";
import { Icon } from "../icons";
import { inputSizeVariants, inputVariants } from "../input";
import { Popover } from "../popover";

type DateType = Date | string | number | undefined | null;

type PropsSingle<T extends DateType = Date> = {
  mode?: "single";
  defaultValue?: T;
  value?: T;
  placeholder?: string;
  onChange?: (date: T | undefined) => void;
};

type PropsRange<T extends DateType = Date> = {
  mode: "range";
  defaultValue?: [T, T];
  value?: [T, T];
  /** Callback function, can be executed when the selected time is changing */
  onChange?: (dates: [T, T | undefined] | undefined) => void;

  placeholder?: [string, string];
};
export type DatePickerProps<T extends DateType = Date> = InputVariants &
  VariantProps<typeof inputSizeVariants> &
  (PropsSingle<T> | PropsRange<T>) & {
    valueType?: "date" | "string" | "number" | "format";
    id?: string;
    format?: string;
    /** To provide an additional time selection **/
    showTime?: boolean;

    allowClear?: boolean;
  };
const DatePickerInternal = <T extends DateType = Date>(
  {
    // mode,
    id: inputId,
    // borderless,
    format = "dd/MM/yyyy",
    // size,
    // status,

    valueType,
    showTime,

    // allowClear = false,
    ...props
  }: DatePickerProps<T>,
  // ref: React.Ref<HTMLInputElement>,
) => {
  const [open, setOpen] = React.useState(false);

  // ====================== Format Date =======================
  format = showTime ? `${format} HH:mm` : format;

  const getDestinationValue = React.useCallback(
    (date: Date) => {
      // if(!date) return undefined
      if (valueType === "string") {
        return formatDate(date, "yyyy-MM-dd'T'HH:mm:ss");
        // return date.toISOString();
      } else if (valueType === "format") {
        return formatDate(date, format);
      } else if (typeof valueType === "number") {
        return date.getTime();
      } else {
        return date;
      }
    },
    [format, valueType],
  );

  const [value, setValue] = useMergedState<T | [T, T | undefined] | undefined>(
    props.defaultValue,
    {
      value: props.value,
      onChange: (value) => {
        if (!props.mode || props.mode === "single") {
          props.onChange?.(value as T);
        }
        if (props.mode === "range") {
          props.onChange?.(value as [T, T | undefined] | undefined);
        }
      },
    },
  );

  const CalendarComponent = React.useMemo(() => {
    if (!props.mode || props.mode === "single") {
      const x = value as T | undefined;
      return (
        <Calendar
          mode="single"
          defaultMonth={x && toDate(x)}
          selected={x ? toDate(x) : undefined}
          onSelect={(date) => {
            if (date) {
              setValue(getDestinationValue(date) as T);
            }
          }}
        />
      );
    } else {
      const x = value as [T, T | undefined] | undefined;
      return (
        <Calendar
          mode="range"
          showYearSwitcher
          numberOfMonths={2}
          defaultMonth={x?.[0] && toDate(x[0])}
          selected={
            x
              ? {
                  from: x[0] && toDate(x[0]),
                  to: x[1] && toDate(x[1]),
                }
              : undefined
          }
          onSelect={(dateRange) => {
            if (dateRange?.from && dateRange.to) {
              setValue([
                getDestinationValue(dateRange.from) as T,
                getDestinationValue(dateRange.to) as T,
              ]);
            }
          }}
        />
      );
    }
  }, [props.mode, value, setValue, getDestinationValue]);

  const ValueComponent = React.useMemo(() => {
    if (!props.mode || props.mode === "single") {
      const x = value as T | undefined;
      const input = x ? formatDate(toDate(x), format) : undefined;
      return (
        <div
          className={cn(
            inputVariants(),
            inputSizeVariants(),
            "gap-2",
            // "grid grid-cols-[1fr_16px_1fr] items-center gap-2",
          )}
          onClick={() => {
            if (!open) setOpen(true);
          }}
        >
          <div>
            <span>{input}</span>
          </div>
          <Icon
            icon="icon-[mingcute--calendar-2-line]"
            className="ml-auto size-4 opacity-50"
          />
        </div>
      );
    } else {
      const x = value as [T, T | undefined] | undefined;
      const input1 = x?.[0] ? formatDate(toDate(x[0]), format) : undefined;
      const input2 = x?.[1] ? formatDate(toDate(x[1]), format) : undefined;
      return (
        <div
          className={cn(
            inputVariants(),
            inputSizeVariants(),
            "gap-2",
            // "grid grid-cols-[1fr_16px_1fr] items-center gap-2",
          )}
          onClick={() => {
            if (!open) setOpen(true);
          }}
        >
          <div>
            <span>{input1}</span>
            <span
              className={cn(
                "px-2 text-center text-foreground-muted",
                !input1 && !input2 && "opacity-0",
              )}
            >
              -
            </span>
            <span>{input2}</span>
          </div>
          <Icon
            icon="icon-[mingcute--calendar-2-line]"
            className="ml-auto size-4 opacity-50"
          />
        </div>
      );
    }
  }, [
    format,
    props.mode,
    value,
    // allowClear,
    // borderless,
    // inputId,
    open,
    // size,
    // status,
    // ref,
  ]);

  return (
    <>
      <Popover
        open={open}
        className="w-auto p-0"
        trigger="click"
        sideOffset={8}
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
        {ValueComponent}
      </Popover>
    </>
  );
};

export const DatePicker = React.forwardRef(DatePickerInternal) as <
  T extends DateType = Date,
>(
  props: DatePickerProps<T> & {
    ref?: React.ForwardedRef<HTMLInputElement>;
  },
) => ReturnType<typeof DatePickerInternal>;
