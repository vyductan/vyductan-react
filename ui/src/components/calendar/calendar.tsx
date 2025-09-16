import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

import { Calendar as ShadcnCalendar } from "../../shadcn/calendar";

type ShadcnCalendarProps = React.ComponentProps<typeof ShadcnCalendar>;

type CalendarPassThroughProps = ShadcnCalendarProps & {
  value?: never;
  format?: string;
  disabledDate?: (date: Dayjs) => boolean;
};

type CalendarSingleValueProps = Omit<
  ShadcnCalendarProps,
  "selected" | "onSelect"
> & {
  mode: "single";
  value: Dayjs;
  onSelect?: (date: Dayjs, dateString: string) => void;
  format?: string;
  disabledDate?: (date: Dayjs) => boolean;
};

type CalendarMultipleValueProps = Omit<
  ShadcnCalendarProps,
  "selected" | "onSelect" | "required"
> & {
  mode: "multiple";
  value: Dayjs[];
  onSelect?: (dates: Dayjs[], dateStrings: string[]) => void;
  format?: string;
  disabledDate?: (date: Dayjs) => boolean;
};

type CalendarProps =
  | CalendarPassThroughProps
  | CalendarSingleValueProps
  | CalendarMultipleValueProps;

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
        mode="single"
        disabled={disabled}
        selected={value.toDate()}
        onSelect={(date) => {
          if (date) onSelect?.(dayjs(date), dayjs(date).format(format));
        }}
      />
    );
  }

  // Multiple (Dayjs convenience)
  if (
    props.mode === "multiple" &&
    "value" in props &&
    Array.isArray(props.value)
  ) {
    const { value, onSelect, disabledDate, ...rest } =
      props as CalendarMultipleValueProps;
    const disabled = composeDisabled(rest.disabled, disabledDate);
    return (
      <ShadcnCalendar
        {...(rest as Omit<ShadcnCalendarProps, "selected" | "onSelect">)}
        mode="multiple"
        required
        disabled={disabled}
        selected={value.map((v) => v.toDate())}
        onSelect={(dates) =>
          onSelect?.(
            dates.map((d) => dayjs(d)),
            dates.map((d) => dayjs(d).format(format)),
          )
        }
      />
    );
  }

  // Pass-through (including range)
  const {
    disabledDate,
    format: _f,
    value: _v,
    ...rest
  } = props as CalendarPassThroughProps;
  const disabled = composeDisabled(rest.disabled, disabledDate);
  return (
    <ShadcnCalendar {...(rest as ShadcnCalendarProps)} disabled={disabled} />
  );
};
export { Calendar };
