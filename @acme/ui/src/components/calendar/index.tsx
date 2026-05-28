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

import type { CalendarProps as OwnCalendarProperties } from "./calendar";
import { CustomCalendar } from "./_components";
import { Calendar as CalendarComponent } from "./calendar";

type ShadcnCalendarProperties = PropsBase &
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

type ConditionalProperties = XOR<
  OwnCalendarProperties,
  ShadcnCalendarProperties
>;

const Calendar = (properties: ConditionalProperties) => {
  if ("selected" in properties) {
    return <CustomCalendar {...(properties as ShadcnCalendarProperties)} />;
  }

  return <CalendarComponent {...(properties as OwnCalendarProperties)} />;
};

export { Calendar };
