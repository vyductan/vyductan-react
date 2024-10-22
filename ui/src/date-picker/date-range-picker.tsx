"use client";

import * as React from "react";

import type { DatePickerProps } from "./date-picker";
import { cn } from "..";
import { inputVariants } from "../input";
import { DatePicker } from "./date-picker";

type DateType = Date | string | number | undefined | null;

export type DateRangePickerProps<T extends DateType = Date> = Omit<
  DatePickerProps<T>,
  "value" | "defaultValue" | "onChange" | "placeholder"
> & {
  defaultValue?: [T, T];
  value?: [T, T];
  /** Callback function, can be executed when the selected time is changing */
  onChange?: (dates: [DateType, DateType]) => void;

  placeholder?: [string, string];
};
const DateRangePickerInternal = <T extends DateType = Date>(
  {
    defaultValue,
    value,
    placeholder,
    onChange,

    ...props
  }: DateRangePickerProps<T>,
  ref: React.Ref<HTMLInputElement>,
) => {
  return (
    <div className={cn("flex items-center gap-2", inputVariants())}>
      {/* <DatePicker */}
      {/*   ref={ref} */}
      {/*   defaultValue={defaultValue?.[0]} */}
      {/*   value={value?.[0]} */}
      {/*   placeholder={placeholder?.[0]} */}
      {/*   onChange={(date) => { */}
      {/*     onChange?.([date, value?.[1]]); */}
      {/*   }} */}
      {/*   borderless={true} */}
      {/*   {...props} */}
      {/* /> */}
      {/* <span className="text-foreground-muted">-</span> */}
      {/* <DatePicker */}
      {/*   ref={ref} */}
      {/*   defaultValue={defaultValue?.[0]} */}
      {/*   value={value?.[0]} */}
      {/*   placeholder={placeholder?.[0]} */}
      {/*   onChange={(date) => { */}
      {/*     onChange?.([value?.[0], date]); */}
      {/*   }} */}
      {/*   borderless={true} */}
      {/*   {...props} */}
      {/* /> */}
    </div>
  );
};

export const DateRangePicker = React.forwardRef(DateRangePickerInternal) as <
  T extends DateType,
>(
  props: DateRangePickerProps<T> & {
    ref?: React.ForwardedRef<HTMLInputElement>;
  },
) => ReturnType<typeof DateRangePickerInternal>;
