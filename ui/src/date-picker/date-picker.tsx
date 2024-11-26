// https://github.com/shadcn-ui/ui/blob/805ed4120a6a8ae6f6e9714cbd776e18eeba92c7/apps/www/registry/new-york/example/date-picker-form.tsx
// Nov 6, 2024
"use client";

import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { format as formatDate, toDate } from "date-fns";
import { useMergedState } from "rc-util";

import type { InputVariants } from "../input";
import { cn } from "..";
import { Calendar } from "../calendar";
import { Icon } from "../icons";
import { inputSizeVariants, inputVariants } from "../input";
import { Popover } from "../popover";
import { useUi } from "../store";

type DateType = Date | string | number | undefined | null;

type DatePickerBaseProps = InputVariants &
  VariantProps<typeof inputSizeVariants> & {
    valueType?: "date" | "string" | "number" | "format";
    id?: string;
    format?: string;
    /** To provide an additional time selection **/
    showTime?: boolean;

    allowClear?: boolean;
    className?: string;
  };

type DatePickerProps<T extends DateType = Date> = DatePickerBaseProps & {
  defaultValue?: T;
  value?: T;
  /** Callback function, can be executed when the selected time is changing */
  onChange?: (date: T | undefined) => void;
  placeholder?: string;
};
const DatePickerInternal = <T extends DateType = Date>(
  {
    // mode,
    // id: inputId,

    placeholder,

    disabled,
    readOnly,
    // borderless,
    format: propFormat = "dd/MM/yyyy",
    // size,
    // status,

    valueType,
    showTime,

    // allowClear = false,
    className,
    ...props
  }: DatePickerProps<T>,
  ref: React.Ref<HTMLDivElement>,
) => {
  const [open, setOpen] = React.useState(false);

  // ====================== Format Date =======================
  const datePickerConfig = useUi((state) => state.componentConfig?.datePicker);
  let format = propFormat;
  if (datePickerConfig?.format) {
    format = datePickerConfig.format;
  }
  format = showTime ? `${format} HH:mm` : format;

  const getDestinationValue = React.useCallback(
    (date: Date) => {
      // if(!date) return undefined
      if (valueType === "string") {
        return formatDate(date, "yyyy-MM-dd'T'HH:mm:ss");
        // return date.toISOString();
      } else if (valueType === "format") {
        return formatDate(date, format);
      } else if (typeof valueType === "number") {
        return date.getTime();
      } else {
        return date;
      }
    },
    [format, valueType],
  );

  const [value, setValue] = useMergedState(props.defaultValue, {
    value: props.value,
    onChange: (value) => {
      props.onChange?.(value as T);
    },
  });

  return (
    <>
      <Popover
        className="w-auto p-0"
        trigger="click"
        sideOffset={8}
        placement="bottomLeft"
        open={open}
        onOpenChange={setOpen}
        // onInteractOutside={(event) => {
        //   if (
        //     event.target &&
        //     "id" in event.target &&
        //     event.target.id !== inputId
        //   ) {
        //     setOpen(false);
        //   }
        // }}
        // onOpenAutoFocus={(event) => {
        //   event.preventDefault();
        // }}
        content={
          <div className="flex">
            <Calendar
              mode="single"
              initialFocus
              defaultMonth={value && toDate(value)}
              selected={value ? toDate(value) : undefined}
              onSelect={(date) => {
                if (date) {
                  setValue(getDestinationValue(date) as T);
                }
                setOpen(false);
              }}
            />
          </div>
        }
      >
        <div
          ref={ref}
          className={cn(
            inputVariants({ disabled, readOnly }),
            inputSizeVariants(),
            "cursor-pointer gap-2",
            className,
            // "grid grid-cols-[1fr_16px_1fr] items-center gap-2",
          )}
          // onClick={() => {
          //   if (!open) setOpen(true);
          // }}
        >
          <span>{value ? formatDate(toDate(value), format) : placeholder}</span>
          <Icon
            icon="icon-[mingcute--calendar-2-line]"
            className="ml-auto size-4 opacity-50"
          />
        </div>
      </Popover>
    </>
  );
};

export type { DatePickerProps, DateType, DatePickerBaseProps };

export const DatePicker = React.forwardRef(DatePickerInternal) as <
  T extends DateType = Date,
>(
  props: DatePickerProps<T> & {
    ref?: React.ForwardedRef<HTMLInputElement>;
  },
) => ReturnType<typeof DatePickerInternal>;
