import type { Dayjs } from "dayjs";
import { useCallback, useMemo, useState } from "react";
import dayjs from "dayjs";

import { cn } from "@acme/ui/lib/utils";

import { PickerOption } from "./picker-option";

type YearSelectProperties<DateValueType extends Dayjs = Dayjs> = {
  value?: DateValueType | null;
  onChange?: (value?: DateValueType | null, yearString?: string) => void;
  onHoverChange?: (value?: DateValueType | null, yearString?: string) => void;
  isOptionDisabled?: (value: DateValueType) => boolean;
};

const YearSelect = <DateValueType extends Dayjs = Dayjs>({
  value,
  onChange,
  onHoverChange,
  isOptionDisabled,
}: YearSelectProperties<DateValueType>) => {
  const currentYear = useMemo(() => value ?? dayjs(), [value]);
  const [currentDecadeRange] = useState<Dayjs[]>(() =>
    Array.from({ length: 10 }, (_, index) => {
      const yearValue = currentYear.year();
      const startYear = Math.floor(yearValue / 10) * 10;
      return dayjs((startYear + index).toString());
    }),
  );

  const computedDecadeRange = useMemo(() => {
    const firstYear = currentDecadeRange[0];
    const lastYear = currentDecadeRange.at(-1);
    return {
      start: firstYear?.year() ?? 0,
      end: lastYear?.year() ?? 0,
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
      className="grid w-[276px] grid-cols-3 gap-1 p-3"
      onMouseLeave={() => onHoverChange?.()}
    >
      {yearGrid.map((year, index) => {
        const yearNumber = year.year();
        const optionYear = year as DateValueType;
        const isSelected = year.year() === currentYearValue;
        const isCurrentYear = year.year() === currentSystemYear;
        const isInDecade = index > 0 && index < 11;
        const isDisabled = isOptionDisabled?.(optionYear) ?? false;

        return (
          <PickerOption
            key={yearNumber}
            disabled={isDisabled}
            className={cn(
              !isInDecade && "text-muted-foreground opacity-50",
              isSelected &&
                !isDisabled &&
                "bg-primary text-primary-foreground hover:bg-primary",
              isCurrentYear &&
                !isSelected &&
                !isDisabled &&
                "bg-accent text-accent-foreground",
            )}
            onHover={() => {
              onHoverChange?.(optionYear, year.format("YYYY"));
            }}
            onSelect={() => {
              onHoverChange?.();
              handleYearSelect(year);
            }}
          >
            <span className="text-sm font-medium">{yearNumber}</span>
          </PickerOption>
        );
      })}
    </div>
  );
};

export { YearSelect };
