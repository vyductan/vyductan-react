"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CalendarDayButton } from "../../shadcn/calendar";

export function CustomCalendarDayButton({
  className,
  //   day,
  modifiers,
  //   color,
  ...props
}: React.ComponentProps<typeof CalendarDayButton>) {
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
        // "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-70",
        // defaultClassNames.day,
        className,
      )}
      modifiers={modifiers}
      //   color={color as ButtonProps["color"]}
      {...props}
    />
  );
}
