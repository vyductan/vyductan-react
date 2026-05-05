"use client";

import * as React from "react";

import { cn } from "@acme/ui/lib/utils";
import {
  CalendarDayButton,
  Calendar as ShadcnCalendar,
} from "@acme/ui/shadcn/calendar";

export const CustomCalendarDayButton = ({
  className,
  //   day,
  modifiers,
  //   color,
  ...properties
}: React.ComponentProps<typeof CalendarDayButton>) => {
  const reference = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) reference.current?.focus();
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
      {...properties}
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
  components,
  formatters,
  locale,
  onWeeksMouseLeave,
  ...properties
}: ShadcnCalendarProps) => {
  const DayButtonComponent = components?.DayButton ?? CustomCalendarDayButton;
  const WeeksComponent = components?.Weeks;

  return (
    <ShadcnCalendar
      fixedWeeks={fixedWeeks}
      locale={locale}
      formatters={{
        ...formatters,
        formatMonthDropdown:
          formatters?.formatMonthDropdown ??
          ((date) => date.toLocaleString(locale?.code, { month: "short" })),
      }}
      classNames={{
        ...classNames,
        range_start: cn("bg-transparent", classNames?.range_start),
        range_end: cn("bg-transparent", classNames?.range_end),
      }}
      components={{
        ...components,
        DayButton: (dayButtonProperties) => (
          <DayButtonComponent
            {...dayButtonProperties}
            data-day={dayButtonProperties.day.date.toLocaleDateString(
              locale?.code,
            )}
          />
        ),
        Weeks: ({ children, onMouseLeave, ...weekProperties }) => {
          const handleMouseLeave = (
            e: React.MouseEvent<HTMLTableSectionElement>,
          ) => {
            onMouseLeave?.(e);
            onWeeksMouseLeave?.(e);
          };

          if (WeeksComponent) {
            return (
              <WeeksComponent
                {...weekProperties}
                onMouseLeave={handleMouseLeave}
              >
                {children}
              </WeeksComponent>
            );
          }

          return (
            <tbody onMouseLeave={handleMouseLeave} {...weekProperties}>
              {children}
            </tbody>
          );
        },
      }}
      {...properties}
    />
  );
};

export { CustomCalendar };
