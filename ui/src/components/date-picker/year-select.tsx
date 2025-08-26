import type { Dayjs } from "dayjs";
import React, { useCallback, useMemo, useState } from "react";
import dayjs from "dayjs";

import { cn } from "@acme/ui/lib/utils";

type YearSelectProps<DateValueType extends Dayjs = Dayjs> = {
  value?: DateValueType | null;
  onChange?: (value?: DateValueType | null, yearString?: string) => void;
  onHoverChange?: (value?: DateValueType | null, yearString?: string) => void;
};

const YearSelect = <DateValueType extends Dayjs = Dayjs>({
  value,
  onChange,
  onHoverChange,
}: YearSelectProps<DateValueType>) => {
  const currentYear = useMemo(() => value ?? dayjs(), [value]);
  const [currentDecadeRange, setCurrentDecadeRange] = useState<Dayjs[]>(() =>
    Array.from({ length: 10 }, (_, i) => {
      const yearValue = currentYear.year();
      const startYear = Math.floor(yearValue / 10) * 10;
      return dayjs((startYear + i).toString());
    }),
  );

  const computedDecadeRange = useMemo(() => {
    return {
      start: currentDecadeRange[0]!.year(),
      end: currentDecadeRange.at(-1)!.year(),
      years: currentDecadeRange,
    };
  }, [currentDecadeRange]);

  const yearGrid = useMemo(() => {
    const { start, end, years } = computedDecadeRange;
    return [
      dayjs((start - 1).toString()),
      ...years,
      dayjs((end + 1).toString()),
    ];
  }, [computedDecadeRange]);

  const handleYearSelect = useCallback(
    (year: Dayjs) => {
      onChange?.(year as DateValueType, year.format("YYYY"));
    },
    [onChange],
  );

  // const handlePreviousDecade = useCallback(() => {
  //   const newStart = computedDecadeRange.start - 10;
  //   const newDecade = Array.from({ length: 10 }, (_, i) => dayjs(newStart + i));
  //   setCurrentDecadeRange(newDecade);
  // }, [computedDecadeRange.start]);

  // const handleNextDecade = useCallback(() => {
  //   const newStart = computedDecadeRange.start + 10;
  //   const newDecade = Array.from({ length: 10 }, (_, i) => dayjs(newStart + i));
  //   setCurrentDecadeRange(newDecade);
  // }, [computedDecadeRange.start]);

  const currentYearValue = currentYear.year();
  const currentSystemYear = new Date().getFullYear();

  return (
    <div
      className="grid grid-cols-3 gap-1 p-3"
      onMouseLeave={() => onHoverChange?.()}
    >
      {yearGrid.map((year, index) => {
        const yearNumber = year.year();
        const isSelected = year.year() === currentYearValue;
        const isCurrentYear = year.year() === currentSystemYear;
        const isInDecade = index > 0 && index < 11;

        return (
          <div
            key={yearNumber}
            className={cn(
              "cursor-pointer rounded-md p-2 text-center transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              !isInDecade && "text-muted-foreground opacity-50",
              isSelected &&
                "bg-primary text-primary-foreground hover:bg-primary",
              isCurrentYear &&
                !isSelected &&
                "bg-accent text-accent-foreground",
            )}
            onMouseEnter={() =>
              onHoverChange?.(year as DateValueType, year.format("YYYY"))
            }
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Clear hover preview so input color returns to normal immediately
              onHoverChange?.();
              handleYearSelect(year);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                handleYearSelect(year);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <span className="text-sm font-medium">{yearNumber}</span>
          </div>
        );
      })}
    </div>
  );
};

export { YearSelect };
