import React from "react";
import { formatDate, toDate } from "date-fns";
import { useMergedState } from "rc-util";

import type { DatePickerBaseProps, DateType } from "./date-picker";
import { cn } from "..";
import { Calendar } from "../calendar";
import { Icon } from "../icons";
import { inputSizeVariants, inputVariants } from "../input";
import { Popover } from "../popover";

type DateRangePickerProps<T extends DateType = Date> = DatePickerBaseProps & {
  mode: "range";
  defaultValue?: [T, T];
  value?: [T, T];
  /** Callback function, can be executed when the selected time is changing */
  onChange?: (dates: [T, T | undefined] | undefined) => void;

  placeholder?: [string, string];
};

const DateRangePickerInternal = <T extends DateType = Date>(
  {
    // mode,
    id: inputId,

    disabled,
    readOnly,
    // borderless,
    format = "dd/MM/yyyy",
    // size,
    // status,

    valueType,
    showTime,

    // allowClear = false,
    className,
    ...props
  }: DateRangePickerProps<T>,
  ref: React.Ref<HTMLDivElement>,
) => {
  const [open, setOpen] = React.useState(false);

  // ====================== Format Date =======================
  format = showTime ? `${format} HH:mm` : format;

  const getDestinationValue = React.useCallback(
    (date: Date) => {
      if (valueType === "string") {
        return formatDate(date, "yyyy-MM-dd'T'HH:mm:ss");
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
        props.onChange?.(value as [T, T | undefined] | undefined);
      },
    },
  );

  const CalendarComponent = React.useMemo(() => {
    const x = value as [T, T | undefined] | undefined;
    return (
      <Calendar
        mode="range"
        // showYearSwitcher
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
  }, [value, setValue, getDestinationValue]);

  const ValueComponent = React.useMemo(() => {
    const x = value as [T, T | undefined] | undefined;
    const input1 = x?.[0] ? formatDate(toDate(x[0]), format) : undefined;
    const input2 = x?.[1] ? formatDate(toDate(x[1]), format) : undefined;
    return (
      <div
        ref={ref}
        className={cn(
          inputVariants({ disabled, readOnly }),
          inputSizeVariants(),
          "gap-2",
          className,
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
  }, [
    ref,
    format,
    className,
    value,
    // allowClear,
    // borderless,
    // inputId,
    open,
    // size,
    // status,
    // ref,
    disabled,
    readOnly,
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

export type { DateRangePickerProps };

export const DateRangePicker = React.forwardRef(DateRangePickerInternal) as <
  T extends DateType = Date,
>(
  props: DateRangePickerProps<T> & {
    ref?: React.ForwardedRef<HTMLInputElement>;
  },
) => ReturnType<typeof DateRangePickerInternal>;
