"use client";

import * as React from "react";

import type { DatePickerPropsDayjs } from "./date-picker";
import { DatePicker } from "./date-picker";

export type YearPickerProps = Omit<
  DatePickerPropsDayjs,
  "picker" | "disabledDate" | "showTime" | "valueType"
> & {
  // valueType: "dayjs";
  // defaultValue?: Dayjs;
  // value?: Dayjs;
  // onChange?: (date: Dayjs | null | undefined, dateString: string) => void;
  // format?: string;
};

// function toDayjsYear(value?: number | Dayjs): Dayjs | undefined {
//   if (typeof value === "number") {
//     return dayjs().year(value).startOf("year");
//   }
//   if (value && dayjs.isDayjs(value)) {
//     return value.startOf("year");
//   }
//   return undefined;
// }

export function YearPicker({
  // value,
  // onChange,
  // format = "YYYY",
  ...rest
}: YearPickerProps) {
  // const djValue = React.useMemo(() => toDayjsYear(value), [value]);

  return (
    <DatePicker
      // valueType="dayjs"
      picker="year"
      // Commit immediately when picking a year
      commitYearOnClose
      {...rest}
      // value={djValue}
      // format={format}
      // onChange={(d) => {
      //   // Always emit Dayjs at start of year (demo and docs handle either number or Dayjs)
      //   onChange?.(d ? d.startOf("year") : undefined);
      // }}
    />
  );
}
