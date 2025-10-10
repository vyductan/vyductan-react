import type {
  PropsBase,
  PropsMulti,
  PropsMultiRequired,
  PropsRange,
  PropsRangeRequired,
  PropsSingle,
  PropsSingleRequired,
} from "react-day-picker";
import type { XOR } from "ts-xor";

import type { CalendarProps as OwnCalendarProps } from "./calendar";
import { Calendar as ShadcnCalendar } from "../../shadcn/calendar";
import { Calendar as CalendarComponent } from "./calendar";
import { CustomCalendarDayButton } from "./_components";
import { cn } from "@/lib/utils";

export const mergedClassNames = (
  classNames: ShadcnCalendarProps["classNames"],
): ShadcnCalendarProps["classNames"] => ({
  day: cn(
    "data-[range-middle=true]:bg-primary/20 data-[range-middle=true]:text-primary",
    classNames?.day,
  ),
  range_start: cn("bg-transparent", classNames?.range_start),
  range_end: cn("bg-transparent", classNames?.range_end),
});

type ShadcnCalendarProps = PropsBase &
  (
    | PropsSingle
    | PropsSingleRequired
    | PropsMulti
    | PropsMultiRequired
    | PropsRange
    | PropsRangeRequired
  );

type ConditionalProps = XOR<OwnCalendarProps, ShadcnCalendarProps>;

const Calendar = ({ classNames, ...props }: ConditionalProps) => {
  // if(props.mode === "single"){
  //     props.onSelect
  // }

  if ("selected" in props) {
    return (
      <ShadcnCalendar
        classNames={mergedClassNames(classNames)}
        components={{
          DayButton: CustomCalendarDayButton,
        }}
        {...(props as ShadcnCalendarProps)}
      />
    );
  }

  //   if("value" in props) {
  //     return <CalendarComponent {...props.onSel} />;
  //   }

  return (
    <CalendarComponent
      classNames={mergedClassNames(classNames)}
      {...(props as OwnCalendarProps)}
    />
  );
};

export { Calendar };
