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
  const isDisabled = modifiers.disabled || properties.disabled;

  return (
    <CalendarDayButton
      data-range-start={isRangeStart}
      data-range-end={isRangeEnd}
      data-range-middle={isRangeMiddle}
      className={cn(
        "data-[range-middle=true]:bg-primary/20 data-[range-middle=true]:text-primary data-[range-end=true]:rounded-none data-[range-end=true]:rounded-r-md data-[range-start=true]:rounded-none data-[range-start=true]:rounded-l-md",
        isDisabled && "cursor-not-allowed disabled:pointer-events-auto",
        className,
      )}
      modifiers={modifiers}
      //   color={color as ButtonProps["color"]}
      {...properties}
      aria-disabled={isDisabled ? true : undefined}
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
  className,
  modifiersClassNames,
  ...properties
}: ShadcnCalendarProps) => {
  const DayButtonComponent = components?.DayButton ?? CustomCalendarDayButton;
  const WeeksComponent = components?.Weeks;
  const isMultiple = properties.mode === "multiple";

  return (
    <ShadcnCalendar
      // In multiple mode, put a gap between the day cells (the week row is a
      // flexbox) so adjacent selected days read as separate boxes instead of
      // merging into a range-like bar. `size-full` + `min-w-0` makes the day
      // button fill its cell so a selected day paints edge-to-edge ("fills the
      // whole cell"). Range mode is left untouched — highlight stays continuous.
      className={cn(
        isMultiple &&
          "[&_tr]:gap-1 [&_td]:size-(--cell-size) [&_td]:p-0 [&_td>button]:size-full [&_td>button]:min-w-0",
        className,
      )}
      // In multiple mode, modifier styling is applied to the day BUTTON (see
      // the DayButton wrapper) instead of the cell, so a marker (border/ring)
      // is concentric with the selected fill on the same box. Other modes keep
      // the default cell-level behavior.
      modifiersClassNames={isMultiple ? undefined : modifiersClassNames}
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
        DayButton: (dayButtonProperties) => {
          const modifierClassName =
            isMultiple && modifiersClassNames
              ? Object.entries(modifiersClassNames)
                  .filter(
                    ([key]) =>
                      (
                        dayButtonProperties.modifiers as Record<string, boolean>
                      )[key],
                  )
                  .map(([, cls]) => cls)
                  .join(" ")
              : undefined;
          return (
            <DayButtonComponent
              {...dayButtonProperties}
              className={cn(dayButtonProperties.className, modifierClassName)}
              data-day={dayButtonProperties.day.date.toLocaleDateString(
                locale?.code,
              )}
            />
          );
        },
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
