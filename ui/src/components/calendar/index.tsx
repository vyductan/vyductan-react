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
import { CustomCalendar } from "./_components";
import { Calendar as CalendarComponent } from "./calendar";

type ShadcnCalendarProps = PropsBase &
  (
    | PropsSingle
    | PropsSingleRequired
    | PropsMulti
    | PropsMultiRequired
    | PropsRange
    | PropsRangeRequired
  ) & {
    numberOfMonths?: number;
    showEndDateMonth?: boolean;
  };

type ConditionalProps = XOR<OwnCalendarProps, ShadcnCalendarProps>;

const Calendar = (props: ConditionalProps) => {
  if ("selected" in props) {
    return <CustomCalendar {...(props as ShadcnCalendarProps)} />;
  }

  return <CalendarComponent {...(props as OwnCalendarProps)} />;
};

export { Calendar };
