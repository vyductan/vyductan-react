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
import { differenceInCalendarDays } from "date-fns";
import {
  DayPicker,
  labelNext,
  labelPrevious,
  useDayPicker,
} from "react-day-picker";

import { clsm } from "..";
import { Button, buttonVariants } from "../button";
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

    /**
     * In the year view, the number of years to display at once.
     * @default 12
     */
    yearRange?: number;
    /**
     * Wether to let user switch between months and years view.
     * @default false
     */
    showYearSwitcher?: boolean;
  };

function Calendar({
  className,
  classNames,
  disabled: _,
  showOutsideDays = true,
  disabledDays,

  yearRange = 12,
  showYearSwitcher = false,
  numberOfMonths,
  ...props
}: CalendarProps) {
  const [navView, setNavView] = React.useState<"days" | "years">("days");
  const [displayYears, setDisplayYears] = React.useState<{
    from: number;
    to: number;
  }>(
    React.useMemo(() => {
      const currentYear = new Date().getFullYear();
      return {
        from: currentYear - Math.floor(yearRange / 2 - 1),
        to: currentYear + Math.ceil(yearRange / 2),
      };
    }, [yearRange]),
  );

  const { onNextClick, onPrevClick, startMonth, endMonth } = props;

  const columnsDisplayed = navView === "years" ? 1 : numberOfMonths;

  return (
    <DayPicker
      disabled={disabledDays}
      showOutsideDays={showOutsideDays}
      className={clsm("p-3", className)}
      style={{
        width: 248.8 * (columnsDisplayed ?? 1) + "px",
      }}
      classNames={{
        // disabled: "text-muted-foreground opacity-50",
        // months: "relative flex flex-col sm:flex-row",
        // months: "relative flex flex-col sm:flex-row ",
        month: "w-full gap-y-4 overflow-x-hidden",
        month_caption: "relative mx-10 flex h-7 items-center justify-center",
        month_grid: "mt-4",
        months: "relative flex flex-col gap-y-4 sm:flex-row sm:gap-y-0",
        week: "mt-2 flex w-full",
        weekday: "w-8 text-[0.8rem] font-normal text-muted-foreground",
        weekdays: "flex flex-row",
        day: "flex size-8 flex-1 items-center justify-center rounded-md p-0 text-sm [&:has(button)]:hover:!bg-accent [&:has(button)]:hover:text-accent-foreground [&:has(button)]:hover:aria-selected:!bg-primary [&:has(button)]:hover:aria-selected:text-primary-foreground",
        day_button: clsm(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal transition-none hover:bg-transparent hover:text-inherit aria-selected:opacity-100",
        ),
        caption: "relative flex items-center justify-center pt-1",
        caption_label: "truncate text-sm font-medium",
        // month: "space-y-4",
        // month_caption: "flex justify-center pt-1 relative items-center mx-10",
        // month_grid: "w-full border-collapse space-y-1",
        // caption_label: "text-sm font-medium",
        // nav: "space-x-1 flex items-center",
        nav: "flex items-start",
        button_next: clsm(
          buttonVariants({
            variant: "outline",
            className:
              "absolute right-0 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          }),
        ),
        button_previous: clsm(
          buttonVariants({
            variant: "outline",
            className:
              "absolute left-0 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          }),
        ),
        // button_next: clsm(
        //   buttonVariants({ variant: "outline" }),
        //   "size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        //   "absolute right-1 top-0",
        // ),
        // button_previous: clsm(
        //   buttonVariants({ variant: "outline" }),
        //   "size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        //   "absolute left-1 top-0",
        // ),
        // weekdays: "flex",
        // weekday:
        //   "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        // week: "flex w-full mt-2",
        // day: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        // day_button: clsm(
        //   buttonVariants({ variant: "ghost" }),
        //   "size-9 p-0 font-normal aria-selected:opacity-100",
        // ),
        range_start: "day-range-start rounded-s-md",
        range_end: "day-range-end rounded-e-md",
        selected:
          "bg-primary text-primary-foreground hover:!bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "bg-accent text-accent-foreground",
        outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "rounded-none aria-selected:bg-accent aria-selected:text-accent-foreground hover:aria-selected:!bg-accent hover:aria-selected:text-accent-foreground",
        hidden: "invisible hidden",
        // range_end: "day-range-end",
        // selected:
        //   "bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white",
        // today: "bg-background-hover text-accent-foreground rounded-md",
        // outside:
        //   "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        // range_middle:
        //   "aria-selected:bg-accent aria-selected:text-accent-foreground",
        // hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...props }) => {
          if (orientation === "left") {
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
        // Chevron: ({ orientation, ...props }) => {
        //   const Icon =
        //     orientation === "left" ? ChevronLeftIcon : ChevronRightIcon;
        //   return <Icon className="h-4 w-4" {...props}/>;
        //   // if (props.orientation === "left") {
        //   //   return <ChevronLeft className="size-4" {...props} />;
        //   // }
        //   // return <ChevronRight className="size-4" {...props} />;
        // },
        Nav: ({ className, children: _, ...props }) => {
          const { nextMonth, previousMonth, goToMonth } = useDayPicker();

          const isPreviousDisabled = (() => {
            if (navView === "years") {
              return (
                (startMonth &&
                  differenceInCalendarDays(
                    new Date(displayYears.from - 1, 0, 1),
                    startMonth,
                  ) < 0) ??
                (endMonth &&
                  differenceInCalendarDays(
                    new Date(displayYears.from - 1, 0, 1),
                    endMonth,
                  ) > 0)
              );
            }
            return !previousMonth;
          })();

          const isNextDisabled = (() => {
            if (navView === "years") {
              return (
                (startMonth &&
                  differenceInCalendarDays(
                    new Date(displayYears.to + 1, 0, 1),
                    startMonth,
                  ) < 0) ??
                (endMonth &&
                  differenceInCalendarDays(
                    new Date(displayYears.to + 1, 0, 1),
                    endMonth,
                  ) > 0)
              );
            }
            return !nextMonth;
          })();

          const handlePreviousClick = React.useCallback(() => {
            if (!previousMonth) return;
            if (navView === "years") {
              setDisplayYears((prev) => ({
                from: prev.from - (prev.to - prev.from + 1),
                to: prev.to - (prev.to - prev.from + 1),
              }));
              onPrevClick?.(
                new Date(
                  displayYears.from - (displayYears.to - displayYears.from),
                  0,
                  1,
                ),
              );
              return;
            }
            goToMonth(previousMonth);
            onPrevClick?.(previousMonth);
          }, [previousMonth, goToMonth]);

          const handleNextClick = React.useCallback(() => {
            if (!nextMonth) return;
            if (navView === "years") {
              setDisplayYears((prev) => ({
                from: prev.from + (prev.to - prev.from + 1),
                to: prev.to + (prev.to - prev.from + 1),
              }));
              onNextClick?.(
                new Date(
                  displayYears.from + (displayYears.to - displayYears.from),
                  0,
                  1,
                ),
              );
              return;
            }
            goToMonth(nextMonth);
            onNextClick?.(nextMonth);
          }, [goToMonth, nextMonth]);
          return (
            <nav className={clsm("flex items-center", className)} {...props}>
              <Button
                variant="outline"
                className="absolute left-0 size-7 bg-transparent p-0 opacity-80 hover:opacity-100"
                type="button"
                tabIndex={isPreviousDisabled ? undefined : -1}
                disabled={isPreviousDisabled}
                aria-label={
                  navView === "years"
                    ? `Go to the previous ${
                        displayYears.to - displayYears.from + 1
                      } years`
                    : labelPrevious(previousMonth)
                }
                onClick={handlePreviousClick}
                icon={
                  <Icon
                    icon="icon-[mingcute--left-fill]"
                    className="size-4"
                    {...props}
                  />
                }
              />

              <Button
                variant="outline"
                className="absolute right-0 size-7 bg-transparent p-0 opacity-80 hover:opacity-100"
                type="button"
                tabIndex={isNextDisabled ? undefined : -1}
                disabled={isNextDisabled}
                aria-label={
                  navView === "years"
                    ? `Go to the next ${
                        displayYears.to - displayYears.from + 1
                      } years`
                    : labelNext(nextMonth)
                }
                onClick={handleNextClick}
                icon={
                  <Icon
                    icon="icon-[mingcute--right-fill]"
                    className="size-4"
                    {...props}
                  />
                }
              />
            </nav>
          );
        },
        CaptionLabel: ({ children, ...props }) => {
          if (!showYearSwitcher) return <span {...props}>{children}</span>;

          return (
            <Button
              className="h-7 w-full truncate text-sm font-medium"
              variant="ghost"
              size="sm"
              onClick={() =>
                setNavView((prev) => (prev === "days" ? "years" : "days"))
              }
            >
              {navView === "days"
                ? children
                : displayYears.from + " - " + displayYears.to}
            </Button>
          );
        },
        MonthGrid: ({ className, children, ...props }) => {
          const { goToMonth } = useDayPicker();
          if (navView === "years") {
            return (
              <div
                className={clsm("grid grid-cols-4 gap-y-2", className)}
                {...props}
              >
                {Array.from(
                  { length: displayYears.to - displayYears.from + 1 },
                  (_, index) => {
                    const isBefore =
                      differenceInCalendarDays(
                        new Date(displayYears.from + index, 12, 31),
                        startMonth!,
                      ) < 0;

                    const isAfter =
                      differenceInCalendarDays(
                        new Date(displayYears.from + index, 0, 0),
                        endMonth!,
                      ) > 0;

                    const isDisabled = isBefore || isAfter;
                    return (
                      <Button
                        key={index}
                        className={clsm(
                          "h-7 w-full text-sm font-normal text-foreground",
                          displayYears.from + index ===
                            new Date().getFullYear() &&
                            "bg-accent font-medium text-accent-foreground",
                        )}
                        variant="ghost"
                        onClick={() => {
                          setNavView("days");
                          goToMonth(
                            new Date(
                              displayYears.from + index,
                              new Date().getMonth(),
                            ),
                          );
                        }}
                        // disabled={navView === "years" ? isDisabled : undefined}
                        disabled={isDisabled}
                      >
                        {displayYears.from + index}
                      </Button>
                    );
                  },
                )}
              </div>
            );
          }
          return (
            <table className={className} {...props}>
              {children}
            </table>
          );
        },
      }}
      numberOfMonths={
        // we need to override the number of months if we are in years view to 1
        columnsDisplayed
      }
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
