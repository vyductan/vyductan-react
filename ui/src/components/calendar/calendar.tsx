import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

import { Calendar as ShadcnCalendar } from "../../shadcn/calendar";
import { CustomCalendarDayButton } from "./_components";

type ShadcnCalendarProps = React.ComponentProps<typeof ShadcnCalendar>;

type CalendarSingleValueProps = Omit<
  ShadcnCalendarProps,
  "mode" | "required" | "selected" | "onSelect"
> & {
  mode: "single";
  value?: Dayjs;
  onSelect?: (date: Dayjs, dateString: string) => void;
  format?: string;
  disabledDate?: (date: Dayjs) => boolean;
  onMonthChange?: (month: Date) => void;
};

type CalendarMultipleValueProps = Omit<
  ShadcnCalendarProps,
  "mode" | "required" | "selected" | "onSelect"
> & {
  mode: "multiple";
  value?: Dayjs[];
  onSelect?: (dates: Dayjs[], dateStrings: string[]) => void;
  format?: string;
  disabledDate?: (date: Dayjs) => boolean;
  onMonthChange?: (month: Date) => void;
};

type CalendarProps =
  | CalendarSingleValueProps
  | CalendarMultipleValueProps
  | {
      mode?: undefined;
      onSelect?: undefined;
      className?: string;
      classNames?: ShadcnCalendarProps["classNames"];
    };

function composeDisabled(
  base: ShadcnCalendarProps["disabled"],
  disabledDate?: (date: Dayjs) => boolean,
): ShadcnCalendarProps["disabled"] {
  const disabledMatchers = [
    ...(base ? (Array.isArray(base) ? base : [base]) : []),
    ...(disabledDate ? [(d: Date) => disabledDate(dayjs(d))] : []),
  ];
  if (disabledMatchers.length === 0) return undefined;
  if (disabledMatchers.length === 1) return disabledMatchers[0];
  return disabledMatchers;
}

const Calendar = (props: CalendarProps) => {
  const { format = "YYYY-MM-DD" } = props as { format?: string };

  // Single (Dayjs convenience)
  if (
    props.mode === "single" &&
    "value" in props &&
    props.value &&
    !Array.isArray(props.value)
  ) {
    const { value, onSelect, disabledDate, ...rest } = props;
    const disabled = composeDisabled(rest.disabled, disabledDate);
    return (
      <ShadcnCalendar
        {...(rest as Omit<ShadcnCalendarProps, "selected" | "onSelect">)}
        // classNames={mergedClassNames(classNames)}
        mode="single"
        disabled={disabled}
        selected={value.toDate()}
        onSelect={(date) => {
          if (date) onSelect?.(dayjs(date), dayjs(date).format(format));
        }}
        components={{
          DayButton: CustomCalendarDayButton,
        }}
      />
    );
  }

  const { value, onSelect, disabledDate, onMonthChange, ...rest } =
    props as CalendarMultipleValueProps;
  const disabled = composeDisabled(rest.disabled, disabledDate);

  // Extract props that shouldn't be passed to ShadcnCalendar
  const { className, ...restWithoutClassName } = rest;

  return (
    <ShadcnCalendar
      {...restWithoutClassName}
      className={className}
      // classNames={mergedClassNames(classNames)}
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
      components={{
        DayButton: CustomCalendarDayButton,
      }}
    />
  );
};

export type { CalendarProps };
export { Calendar };
