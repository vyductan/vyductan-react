"use client";

import type {
  PropsBase,
  PropsMulti,
  PropsMultiRequired,
  PropsRange,
  PropsRangeRequired,
  PropsSingle,
  PropsSingleRequired,
} from "react-day-picker";
import * as React from "react";
import { DayPicker } from "react-day-picker";

import { clsm } from "..";
import { buttonVariants } from "../button";
import { Icon } from "../icons";

export type CalendarProps = Omit<PropsBase, "disabled"> &
  (
    | PropsSingle
    | PropsSingleRequired
    | PropsMulti
    | PropsMultiRequired
    | PropsRange
    | PropsRangeRequired
    | {
        mode?: undefined;
        required?: undefined;
      }
  ) & {
    disabled?: boolean;
    disabledDays?: PropsBase["disabled"];
  };

function Calendar({
  className,
  classNames,
  disabled: _,
  showOutsideDays = true,
  disabledDays,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      disabled={disabledDays}
      showOutsideDays={showOutsideDays}
      className={clsm("p-3", className)}
      classNames={{
        disabled: "text-muted-foreground opacity-50",
        months: "relative flex flex-col sm:flex-row",
        // months: "relative flex flex-col sm:flex-row ",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center mx-10",
        month_grid: "w-full border-collapse space-y-1",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        button_next: clsm(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          "absolute right-1 top-0",
        ),
        button_previous: clsm(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          "absolute left-1 top-0",
        ),
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day_button: clsm(
          buttonVariants({ variant: "ghost" }),
          "size-9 p-0 font-normal aria-selected:opacity-100",
        ),
        range_end: "day-range-end",
        selected:
          "bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white",
        today: "bg-background-hover text-accent-foreground rounded-md",
        outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: (props) => {
          if (props.orientation === "left") {
            return (
              <Icon
                icon="icon-[mingcute--left-fill]"
                className="size-4"
                {...props}
              />
            );
          }
          return (
            <Icon
              icon="icon-[mingcute--right-fill]"
              className="size-4"
              {...props}
            />
          );
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
