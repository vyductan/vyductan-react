"use client";

import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import * as React from "react";

import type { DatePickerProps } from "./date-picker";
import { DatePicker } from "./date-picker";

export type YearPickerProps = Omit<
  DatePickerProps<Dayjs>,
  "picker" | "value" | "onChange" | "showTime"
> & {
  value?: number | Dayjs;
  onChange?: (value?: number | Dayjs) => void;
  format?: string;
};

function toDayjsYear(value?: number | Dayjs): Dayjs | undefined {
  if (typeof value === "number") {
    return dayjs().year(value).startOf("year");
  }
  if (value && dayjs.isDayjs(value)) {
    return value.startOf("year");
  }
  return undefined;
}

export function YearPicker({ value, onChange, format = "YYYY", ...rest }: YearPickerProps) {
  const djValue = React.useMemo(() => toDayjsYear(value), [value]);

  return (
    <DatePicker
      {...rest}
      picker="year"
      // Commit immediately when picking a year
      commitYearOnClose
      value={djValue}
      format={format}
      onChange={(d) => {
        // Always emit Dayjs at start of year (demo and docs handle either number or Dayjs)
        onChange?.(d ? d.startOf("year") : undefined);
      }}
    />
  );
}
