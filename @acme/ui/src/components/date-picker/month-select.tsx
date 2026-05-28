import type { Dayjs } from "dayjs";
import { useCallback, useMemo } from "react";
import dayjs from "dayjs";

import { cn } from "@acme/ui/lib/utils";

import { PickerOption } from "./picker-option";

type MonthSelectProperties<DateValueType extends Dayjs = Dayjs> = {
  value?: DateValueType | null;
  onChange?: (value?: DateValueType | null, monthString?: string) => void;
  onHoverChange?: (value?: DateValueType | null, monthString?: string) => void;
  isOptionDisabled?: (value: DateValueType) => boolean;
};

const MonthSelect = <DateValueType extends Dayjs = Dayjs>({
  value,
  onChange,
  onHoverChange,
  isOptionDisabled,
}: MonthSelectProperties<DateValueType>) => {
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
    return Array.from({ length: 12 }, (_, index) => {
      // Use a fixed date to get month names to avoid issues with different day lengths
      // setting day to 1st to be safe
      return dayjs().month(index).date(1);
    });
  }, []);

  return (
    <div
      className="grid w-[276px] grid-cols-3 gap-2 p-3"
      onMouseLeave={() => onHoverChange?.()}
    >
      {months.map((monthDate, index) => {
        const monthName = monthDate.format("MMM");
        const optionDate = currentMonth.month(index);
        const isSelected = index === currentMonthValue;
        const isCurrentMonth =
          index === currentSystemMonth &&
          currentYearValue === currentSystemYear;
        const isDisabled =
          isOptionDisabled?.(optionDate as DateValueType) ?? false;

        return (
          <PickerOption
            key={index}
            disabled={isDisabled}
            className={cn(
              isSelected &&
                !isDisabled &&
                "bg-primary text-primary-foreground hover:bg-primary",
              isCurrentMonth &&
                !isSelected &&
                !isDisabled &&
                "bg-accent text-accent-foreground",
            )}
            onHover={() => {
              onHoverChange?.(
                optionDate as DateValueType,
                optionDate.format("MMM"),
              );
            }}
            onSelect={() => {
              onHoverChange?.();
              handleMonthSelect(index);
            }}
          >
            <span className="text-sm font-medium">{monthName}</span>
          </PickerOption>
        );
      })}
    </div>
  );
};

export { MonthSelect };
