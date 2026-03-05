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
import { Calendar as ShadcnCalendar } from "./_components";
import { Calendar as InternalCalendar } from "./calendar";

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
    return <ShadcnCalendar {...(props as ShadcnCalendarProps)} />;
  }

  return <InternalCalendar {...(props as OwnCalendarProps)} />;
};

export { Calendar };
