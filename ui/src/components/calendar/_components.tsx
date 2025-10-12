"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

import {
  CalendarDayButton,
  Calendar as ShadcnCalendar,
} from "../../shadcn/calendar";

export const CustomCalendarDayButton = ({
  className,
  //   day,
  modifiers,
  //   color,
  ...props
}: React.ComponentProps<typeof CalendarDayButton>) => {
  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  // Custom logic for Ant Design-like range highlighting
  // Only highlight range dates that belong to the current month being displayed
  const isRangeStart = modifiers.range_start && !modifiers.outside;
  const isRangeEnd = modifiers.range_end && !modifiers.outside;
  const isRangeMiddle = modifiers.range_middle && !modifiers.outside;

  return (
    <CalendarDayButton
      data-range-start={isRangeStart}
      data-range-end={isRangeEnd}
      data-range-middle={isRangeMiddle}
      className={cn(
        "data-[range-middle=true]:bg-primary/20 data-[range-middle=true]:text-primary data-[range-end=true]:rounded-none data-[range-end=true]:rounded-r-md data-[range-start=true]:rounded-none data-[range-start=true]:rounded-l-md",
        className,
      )}
      modifiers={modifiers}
      //   color={color as ButtonProps["color"]}
      {...props}
    />
  );
};

export type ShadcnCalendarProps = React.ComponentProps<
  typeof ShadcnCalendar
> & {
  onWeeksMouseLeave?: (e: React.MouseEvent<HTMLTableSectionElement>) => void;
};
const CustomCalendar = ({
  fixedWeeks = true,
  classNames,
  onWeeksMouseLeave,
  ...props
}: ShadcnCalendarProps) => {
  return (
    <ShadcnCalendar
      fixedWeeks={fixedWeeks}
      classNames={{
        ...classNames,
        range_start: cn("bg-transparent", classNames?.range_start),
        range_end: cn("bg-transparent", classNames?.range_end),
      }}
      components={{
        DayButton: CustomCalendarDayButton,
        Weeks: ({ children, onMouseLeave, ...props }) => {
          return (
            <tbody
              onMouseLeave={(e) => {
                onMouseLeave?.(e);
                onWeeksMouseLeave?.(e);
              }}
              {...props}
            >
              {children}
            </tbody>
          );
        },
      }}
      {...props}
    />
  );
};

export { CustomCalendar };
