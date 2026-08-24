"use client";

import type { Dayjs } from "dayjs";
import * as React from "react";
import { useMergedState } from "@rc-component/util";
import dayjs from "dayjs";

import { cn } from "@acme/ui/lib/utils";

import type { InputSizeVariants, InputVariants } from "../input/variants";
import type { DisabledDate } from "./types";
import { Icon } from "../../icons";
// Import the value-based (Dayjs) calendar directly; the package index exports an
// XOR wrapper that only accepts the react-day-picker `selected` shape.
import { Calendar } from "../calendar/calendar";
import { useComponentConfig } from "../config-provider/context";
import { controlRadiusBySize, inputVariants } from "../input/variants";
import { Popover } from "../popover";
import { Tag } from "../tag";

type MultipleDatePickerProps = InputVariants &
  InputSizeVariants & {
    ref?: React.Ref<HTMLDivElement>;
    id?: string;
    /** Enables multiple selection. Always true for this component. */
    multiple: true;

    value?: Dayjs[] | null;
    defaultValue?: Dayjs[] | null;
    onChange?: (dates: Dayjs[], dateStrings: string[]) => void;

    format?: string;
    placeholder?: string;
    disabled?: boolean;
    allowClear?: boolean;
    className?: string;
    style?: React.CSSProperties;

    disabledDate?: DisabledDate<Dayjs>;
    minDate?: Dayjs;
    maxDate?: Dayjs;

    /** Max tags shown before collapsing to a "+N" placeholder. */
    maxTagCount?: number;
    /** Node (or fn of the omitted dates) rendered for the collapsed tags. */
    maxTagPlaceholder?:
      | React.ReactNode
      | ((omittedValues: Dayjs[]) => React.ReactNode);

    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  };

const MultipleDatePicker = (properties: MultipleDatePickerProps) => {
  const {
    ref,
    id,
    value: valueProperty,
    defaultValue,
    onChange,
    format: formatProperty,
    placeholder,
    disabled,
    allowClear = true,
    variant,
    size,
    status,
    className,
    style,
    disabledDate,
    minDate,
    maxDate,
    maxTagCount,
    maxTagPlaceholder,
    open: openProperty,
    onOpenChange,
  } = properties;

  const {
    format: formatConfig,
    captionLayout: captionLayoutConfig,
  } = useComponentConfig("datePicker");
  const format = formatProperty ?? formatConfig ?? "YYYY-MM-DD";

  const [value, setValue] = useMergedState<Dayjs[]>(defaultValue ?? [], {
    value: valueProperty ?? undefined,
    onChange: (next) =>
      onChange?.(
        next,
        next.map((d) => d.format(format)),
      ),
  });

  const [open, setOpenState] = useMergedState(false, { value: openProperty });
  const setOpen = React.useCallback(
    (next: boolean) => {
      setOpenState(next);
      onOpenChange?.(next);
    },
    [onOpenChange, setOpenState],
  );

  const isDateAllowed = React.useCallback(
    (date: Dayjs) => {
      if (minDate && date.isBefore(minDate, "day")) return false;
      if (maxDate && date.isAfter(maxDate, "day")) return false;
      if (disabledDate?.(date, { type: "date" })) return false;
      return true;
    },
    [disabledDate, maxDate, minDate],
  );

  // Sorted for stable tag order and calendar highlighting.
  const sorted = React.useMemo(
    () => [...value].sort((a, b) => a.valueOf() - b.valueOf()),
    [value],
  );

  const [month, setMonth] = React.useState<Date | undefined>(
    () => sorted[0]?.toDate(),
  );

  const shownTags = maxTagCount == null ? sorted : sorted.slice(0, maxTagCount);
  const omittedTags = maxTagCount == null ? [] : sorted.slice(maxTagCount);

  const removeDate = (date: Dayjs) => {
    setValue(value.filter((v) => !v.isSame(date, "day")));
  };

  const clearAll = () => setValue([]);
  const clearable = allowClear && !disabled && sorted.length > 0;

  return (
    <Popover
      trigger="click"
      placement="bottomLeft"
      className="w-auto p-0 max-sm:p-0"
      arrow={false}
      open={disabled ? false : open}
      onOpenChange={(next) => {
        if (disabled) return;
        setOpen(next);
      }}
      onOpenAutoFocus={(event) => event.preventDefault()}
      content={
        <Calendar
          mode="multiple"
          captionLayout={captionLayoutConfig}
          month={month}
          onMonthChange={setMonth}
          value={sorted}
          disabledDate={(d) => !isDateAllowed(d)}
          startMonth={
            minDate?.toDate() ??
            dayjs().subtract(50, "year").startOf("year").toDate()
          }
          endMonth={
            maxDate?.toDate() ?? dayjs().add(50, "year").endOf("year").toDate()
          }
          onSelect={(dates: Dayjs[]) => {
            // Calendar returns the full next selection as Dayjs; keep only
            // allowed dates. Panel stays open (multiple mode never closes).
            setValue(dates.filter((d) => isDateAllowed(d)));
          }}
        />
      }
    >
      <div
        ref={ref}
        id={id}
        role="combobox"
        aria-expanded={open}
        data-slot="multiple-picker-input"
        className={cn("inline-flex", className)}
        style={style}
      >
        <div
          className={cn(
            "group min-h-control relative flex w-full cursor-pointer items-center gap-1 rounded-md py-1 pr-8 pl-2",
            inputVariants({ variant, status, disabled }),
            controlRadiusBySize[size ?? "middle"],
          )}
        >
          {sorted.length === 0 ? (
            <span className="text-muted-foreground truncate pl-1">
              {placeholder}
            </span>
          ) : (
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
              {shownTags.map((date) => (
                <Tag
                  key={date.valueOf()}
                  className="mr-0 py-0 leading-[22px]"
                  onClose={disabled ? undefined : () => removeDate(date)}
                >
                  {date.format(format)}
                </Tag>
              ))}
              {omittedTags.length > 0 && (
                <Tag className="mr-0 py-0 leading-[22px]">
                  {typeof maxTagPlaceholder === "function"
                    ? maxTagPlaceholder(omittedTags)
                    : (maxTagPlaceholder ?? `+ ${omittedTags.length} ...`)}
                </Tag>
              )}
            </div>
          )}

          <span className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center">
            <Icon
              aria-hidden="true"
              icon="icon-[mingcute--calendar-2-line]"
              className={cn(
                "size-4 opacity-50",
                clearable && "group-hover:hidden",
              )}
            />
            {clearable && (
              <button
                type="button"
                aria-label="Clear"
                className="absolute inset-0 hidden items-center justify-center group-hover:flex"
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  clearAll();
                }}
              >
                <Icon
                  icon="icon-[lucide--circle-x]"
                  className="size-4 opacity-50"
                />
              </button>
            )}
          </span>
        </div>
      </div>
    </Popover>
  );
};

export { MultipleDatePicker };
export type { MultipleDatePickerProps };
