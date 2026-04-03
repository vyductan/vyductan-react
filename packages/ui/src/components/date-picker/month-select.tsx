import type { Dayjs } from "dayjs";
import { useCallback, useMemo } from "react";
import dayjs from "dayjs";

import { cn } from "@acme/ui/lib/utils";

type MonthSelectProps<DateValueType extends Dayjs = Dayjs> = {
  value?: DateValueType | null;
  onChange?: (value?: DateValueType | null, monthString?: string) => void;
  onHoverChange?: (value?: DateValueType | null, monthString?: string) => void;
};

const MonthSelect = <DateValueType extends Dayjs = Dayjs>({
  value,
  onChange,
  onHoverChange,
}: MonthSelectProps<DateValueType>) => {
  const currentMonth = useMemo(() => value ?? dayjs(), [value]);
  const currentMonthValue = currentMonth.month();
  const currentYearValue = currentMonth.year();
  const currentSystemDate = new Date();
  const currentSystemMonth = currentSystemDate.getMonth();
  const currentSystemYear = currentSystemDate.getFullYear();

  const handleMonthSelect = useCallback(
    (monthIndex: number) => {
      // Create a new date with the selected month, keeping the year
      const newDate = currentMonth.month(monthIndex);
      onChange?.(newDate as DateValueType, newDate.format("MMM"));
    },
    [onChange, currentMonth],
  );

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      // Use a fixed date to get month names to avoid issues with different day lengths
      // setting day to 1st to be safe
      return dayjs().month(i).date(1);
    });
  }, []);

  return (
    <div
      className="grid w-[276px] grid-cols-3 gap-2 p-3"
      onMouseLeave={() => onHoverChange?.()}
    >
      {months.map((monthDate, index) => {
        const monthName = monthDate.format("MMM");
        const isSelected = index === currentMonthValue;
        const isCurrentMonth =
          index === currentSystemMonth &&
          currentYearValue === currentSystemYear;

        return (
          <div
            key={index}
            className={cn(
              "cursor-pointer rounded-md p-2 text-center transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              isSelected &&
                "bg-primary text-primary-foreground hover:bg-primary",
              isCurrentMonth &&
                !isSelected &&
                "bg-accent text-accent-foreground",
            )}
            onMouseEnter={() => {
              const hoverDate = currentMonth.month(index);
              onHoverChange?.(
                hoverDate as DateValueType,
                hoverDate.format("MMM"),
              );
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onHoverChange?.();
              handleMonthSelect(index);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                handleMonthSelect(index);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <span className="text-sm font-medium">{monthName}</span>
          </div>
        );
      })}
    </div>
  );
};

export { MonthSelect };
