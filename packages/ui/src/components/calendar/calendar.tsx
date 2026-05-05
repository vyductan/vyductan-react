import type { Dayjs } from "dayjs";
import type { Modifiers } from "react-day-picker";
import dayjs from "dayjs";

import type { ShadcnCalendarProps as ShadcnCalendarProperties } from "./_components";
import { CustomCalendar, CustomCalendarDayButton } from "./_components";

type CalendarSingleValueProperties = Omit<
  ShadcnCalendarProperties,
  "mode" | "required" | "selected" | "onSelect"
> & {
  mode: "single";
  value?: Dayjs;
  onSelect?: (date: Dayjs, dateString: string) => void;
  format?: string;
  disabledDate?: (date: Dayjs) => boolean;
  onMonthChange?: (month: Date) => void;
  numberOfMonths?: number;
  fixedWeeks?: boolean;
};

type CalendarMultipleValueProperties = Omit<
  ShadcnCalendarProperties,
  "mode" | "required" | "selected" | "onSelect"
> & {
  mode: "multiple";
  value?: Dayjs[];
  onSelect?: (dates: Dayjs[], dateStrings: string[]) => void;
  format?: string;
  disabledDate?: (date: Dayjs) => boolean;
  onMonthChange?: (month: Date) => void;
  numberOfMonths?: number;
  fixedWeeks?: boolean;
};

type CalendarRangeValueProperties = Omit<
  ShadcnCalendarProperties,
  "mode" | "required" | "selected" | "onSelect"
> & {
  mode: "range";
  value?: [Dayjs | null, Dayjs | null];
  onSelect?: (
    dateRange: { from?: Date; to?: Date } | undefined,
    triggerDate: Date,
    modifiers: Modifiers,
  ) => void;
  format?: string;
  disabledDate?: (date: Dayjs) => boolean;
  onMonthChange?: (month: Date) => void;
  numberOfMonths?: number;
  fixedWeeks?: boolean;
};

type CalendarProperties =
  | CalendarSingleValueProperties
  | CalendarMultipleValueProperties
  | CalendarRangeValueProperties
  | {
      mode?: undefined;
      onSelect?: undefined;
      className?: string;
      classNames?: ShadcnCalendarProperties["classNames"];
      numberOfMonths?: number;
      fixedWeeks?: boolean;
    };

function composeDisabled(
  base: ShadcnCalendarProperties["disabled"],
  disabledDate?: (date: Dayjs) => boolean,
): ShadcnCalendarProperties["disabled"] {
  const disabledMatchers = [
    ...(base ? (Array.isArray(base) ? base : [base]) : []),
    ...(disabledDate ? [(d: Date) => disabledDate(dayjs(d))] : []),
  ];
  if (disabledMatchers.length === 0) return undefined;
  if (disabledMatchers.length === 1) return disabledMatchers[0];
  return disabledMatchers;
}

const Calendar = (properties: CalendarProperties) => {
  const { format = "YYYY-MM-DD" } = properties as {
    format?: string;
  };

  if ("selected" in properties) {
    return (
      <CustomCalendar
        components={{
          DayButton: CustomCalendarDayButton,
        }}
        fixedWeeks={true}
        {...(properties as ShadcnCalendarProperties)}
      />
    );
  }

  // Single (Dayjs convenience)
  if (
    properties.mode === "single" &&
    "value" in properties &&
    properties.value &&
    !Array.isArray(properties.value)
  ) {
    const { value, onSelect, disabledDate, ...rest } = properties;
    const disabled = composeDisabled(rest.disabled, disabledDate);
    return (
      <CustomCalendar
        {...(rest as Omit<ShadcnCalendarProperties, "selected" | "onSelect">)}
        mode="single"
        disabled={disabled}
        selected={value.toDate()}
        onSelect={(date) => {
          if (date) onSelect?.(dayjs(date), dayjs(date).format(format));
        }}
        components={{
          DayButton: CustomCalendarDayButton,
        }}
        fixedWeeks={true}
      />
    );
  }

  // Range mode
  if (properties.mode === "range") {
    const { value, onSelect, disabledDate, onMonthChange, ...rest } =
      properties;
    const disabled = composeDisabled(rest.disabled, disabledDate);

    // Extract props that shouldn't be passed to ShadcnCalendar
    const { className, numberOfMonths, ...restWithoutClassName } = rest;

    // Range mode: single calendar with 2 panels
    return (
      <CustomCalendar
        {...restWithoutClassName}
        className={className}
        mode="range"
        required
        disabled={disabled}
        numberOfMonths={numberOfMonths ?? 2}
        selected={
          value
            ? {
                from: value[0] ? value[0].toDate() : undefined,
                to: value[1] ? value[1].toDate() : undefined,
              }
            : undefined
        }
        onSelect={onSelect}
        onMonthChange={onMonthChange}
      />
    );
  }

  const { value, onSelect, disabledDate, onMonthChange, ...rest } =
    properties as CalendarMultipleValueProperties;
  const disabled = composeDisabled(rest.disabled, disabledDate);

  // Extract props that shouldn't be passed to ShadcnCalendar
  const { className, ...restWithoutClassName } = rest;

  return (
    <CustomCalendar
      {...restWithoutClassName}
      className={className}
      mode="multiple"
      required
      disabled={disabled}
      selected={value?.map((v) => v.toDate())}
      onSelect={(dates) =>
        onSelect?.(
          dates.map((d) => dayjs(d)),
          dates.map((d) => dayjs(d).format(format)),
        )
      }
      onMonthChange={onMonthChange}
    />
  );
};

export type { CalendarProperties as CalendarProps };
export { Calendar };
