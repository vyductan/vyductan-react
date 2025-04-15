import React, { useEffect, useMemo } from "react";
import { Slot } from "@radix-ui/react-slot";
import { useMergedState } from "@rc-component/util";
import { composeRef } from "@rc-component/util/lib/ref";
import { useHover } from "ahooks";
import { formatDate, toDate } from "date-fns";

import type {
  DatePickerBaseProps,
  DatePickerValueType,
  DateType,
} from "./date-picker";
import { cn } from "..";
import { Calendar } from "../calendar";
import { Icon } from "../icons";
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

type DateRangePickerProps<T extends DatePickerValueType = "date"> =
  DatePickerBaseProps & {
    ref?: React.RefObject<HTMLDivElement | null>;

    valueType?: T;
    value?: RangeValueType<DateType<T>> | null;
    defaultValue?: RangeValueType<DateType<T>> | null;
    /** Callback function, can be executed when the selected time is changing */
    onChange?: (dates: NoUndefinedRangeValueType<DateType<T>> | null) => void;

    placeholder?: [string, string];
  };

const DateRangePicker = <T extends DatePickerValueType = "date">({
  valueType,

  ref: refProp,

  id: inputId,

  disabled,
  // borderless,
  format = "dd/MM/yyyy",
  // size,
  // status,
  placeholder,

  // valueType,
  showTime,

  className,
  allowClear = false,
  suffix = (
    <Icon icon="icon-[mingcute--calendar-2-line]" className="opacity-50" />
  ),

  defaultValue,
  value: valueProp,
  onChange,
  // ...props
}: DateRangePickerProps<T>) => {
  const [open, setOpen] = React.useState(false);

  // ====================== Format Date =======================
  format = showTime ? `${format} HH:mm` : format;

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
      return result as DateType<T>;
    },
    [format, valueType],
  );

  const [value, setValue] = useMergedState(valueProp ?? defaultValue, {});
  useEffect(() => {
    // sync parent value
    setValue((pre) => {
      if (valueProp?.[0] !== pre?.[0] || valueProp?.[1] !== pre?.[1]) {
        return valueProp;
      }
      return pre;
    });
  }, [valueProp, setValue]);

  const CalendarComponent = React.useMemo(() => {
    return (
      <Calendar
        mode="range"
        // showYearSwitcher
        initialFocus
        numberOfMonths={2}
        defaultMonth={value?.[0] ? toDate(value[0]) : undefined}
        selected={
          value
            ? {
                from: value[0] ? toDate(value[0]) : undefined,
                to: value[1] ? toDate(value[1]) : undefined,
              }
            : undefined
        }
        onSelect={(dateRange) => {
          if (!dateRange) {
            setValue(undefined);
            return;
          }
          if (dateRange.from) {
            setValue([getDestinationValue(dateRange.from), value?.[1]]);
          }
          if (dateRange.to && value) {
            setValue([
              getDestinationValue(dateRange.from!),
              getDestinationValue(dateRange.to),
            ]);
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
  }, [value, setValue, getDestinationValue]);

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
      ? formatDate(toDate(value[0]), format)
      : undefined;
    const input2 = value?.[1]
      ? formatDate(toDate(value[1]), format)
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
        {ValueComponent}
      </Popover>
    </>
  );
};

export type { DateRangePickerProps };
export { DateRangePicker };
