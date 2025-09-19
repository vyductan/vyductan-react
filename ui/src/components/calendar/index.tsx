import type { XOR } from "ts-xor";

import type { CalendarProps as OwnCalendarProps } from "./calendar";
import { Calendar as ShadcnCalendar } from "../../shadcn/calendar";
import { Calendar as CalendarComponent } from "./calendar";

type ShadcnCalendarProps = React.ComponentProps<typeof ShadcnCalendar>;

type ConditionalProps = XOR<OwnCalendarProps, ShadcnCalendarProps>;

const Calendar = (props: ConditionalProps) => {
  // if(props.mode === "single"){
  //     props.onSelect
  // }
  if ("selected" in props) {
    return <ShadcnCalendar {...props} />;
  }

  //   if("value" in props) {
  //     return <CalendarComponent {...props.onSel} />;
  //   }

  return <CalendarComponent {...(props as OwnCalendarProps)} />;
};

export { Calendar };
