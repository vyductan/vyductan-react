// https://github.com/shadcn-ui/ui/blob/805ed4120a6a8ae6f6e9714cbd776e18eeba92c7/apps/www/registry/new-york/example/date-picker-form.tsx
// Nov 6, 2024
// https://github.com/shadcn-ui/ui/pull/4371
// https://github.com/shadcn-ui/ui/pull/4421
"use client";

import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { useEffect } from "react";
import { useClickAway, useFocusWithin } from "ahooks";
import { format as formatDate, isValid, parse, toDate } from "date-fns";
import { useMergedState } from "rc-util";
import { composeRef } from "rc-util/lib/ref";

import type { inputSizeVariants, InputVariants } from "../input";
import { cn } from "..";
import { Calendar } from "../calendar";
import { Icon } from "../icons";
import { Input } from "../input";
import { Popover } from "../popover";
import { useUi } from "../store";

type DateType = Date | string | number | undefined | null;

type DatePickerBaseProps = InputVariants &
  VariantProps<typeof inputSizeVariants> & {
    id?: string;
    valueType?: "date" | "string" | "number" | "format";
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
    id,

    placeholder,
    valueType,
    format: propFormat = "dd/MM/yyyy",
    showTime,

    disabled,
    allowClear = false,
    borderless,
    size,
    status,

    className,
    ...props
  }: DatePickerProps<T>,
  ref: React.ForwardedRef<HTMLInputElement>,
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
      if (valueType === "string") {
        return formatDate(date, "yyyy-MM-dd'T'HH:mm:ss");
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

  // ====================== Value =======================
  const [value, setValue] = useMergedState(props.defaultValue, {
    value: props.value,
    onChange: (value) => {
      props.onChange?.(value as T);
    },
  });
  const preInputValue = value ? formatDate(toDate(value), format) : "";
  const [inputValue, setInputValue] = useMergedState(preInputValue);
  const handleChange = (input: string | Date) => {
    const date = toDate(input);
    if (valueType === "string") {
      setValue(date.toISOString() as T);
    } else if (valueType === "format") {
      setValue(formatDate(date, format) as T);
    } else if (typeof valueType === "number") {
      setValue(date.getTime() as T);
    } else {
      setValue(date as T);
    }
  };

  const inputRef = React.useRef<HTMLInputElement>(null);
  const composedRef = composeRef(ref, inputRef);
  const handleChangeInput = (value: string) => {
    if (isValidDateStringExact(value, format)) {
      handleChange(inputValue);
    } else {
      setInputValue(preInputValue);
    }
  };
  // handle click outside from input (is focus within)
  const [isFocused, setIsFocused] = React.useState(false);
  useFocusWithin(inputRef, {
    onFocus: () => {
      setIsFocused(true);
    },
  });
  useClickAway((event) => {
    if (
      isFocused &&
      !(event.target && "name" in event.target && event.target.name === "day") // check if choose a day in panel or not
    ) {
      handleChangeInput(inputValue);
      setOpen(false);
    }
  }, inputRef);

  // prevent click label to focus input (open popover)
  useEffect(() => {
    const labelElm = document.querySelector(`label[for="${id}"]`);
    const eventFn = (event: Event) => {
      event.preventDefault();
    };
    labelElm?.addEventListener("click", eventFn);
    return () => {
      labelElm?.removeEventListener("click", eventFn);
    };
  }, [id]);

  return (
    <>
      <Popover
        className="w-auto p-0"
        trigger="click"
        sideOffset={8}
        placement="bottomLeft"
        open={open}
        onOpenChange={setOpen}
        onInteractOutside={(event) => {
          if (event.target === inputRef.current) {
            setOpen(false);
          }
        }}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
        content={
          <div className="flex">
            <Calendar
              mode="single"
              // initialFocus // disable default focus (in shadcn default is true)
              defaultMonth={value && toDate(value)}
              selected={value ? toDate(value) : undefined}
              onSelect={(date) => {
                if (date) {
                  setValue(getDestinationValue(date) as T);
                  setInputValue(formatDate(date, format));
                }
                setOpen(false);
              }}
            />
          </div>
        }
      >
        <Input
          ref={composedRef}
          id={id}
          allowClear={allowClear}
          borderless={borderless}
          size={size}
          disabled={disabled}
          status={status}
          className={cn("items-center", "justify-start text-left", className)}
          placeholder={placeholder}
          suffix={
            <Icon
              icon="icon-[mingcute--calendar-2-line]"
              className="ml-auto size-4 opacity-50"
            />
          }
          value={inputValue}
          onClick={() => {
            if (!open) setOpen(true);
          }}
          onKeyUp={(event) => {
            event.stopPropagation();
            if (event.key === "Enter" || event.key === "Escape") {
              handleChangeInput(event.currentTarget.value);
              setOpen(false);
            }
          }}
          onChange={(event) => {
            setInputValue(event.currentTarget.value);
            if (isValidDateStringExact(event.currentTarget.value, format)) {
              handleChange(event.currentTarget.value);
            }
          }}
        />

        {/* <div
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
        </div> */}
      </Popover>
    </>
  );
};

function isValidDateStringExact(
  dateString: string,
  formatString: string,
): boolean {
  const parsedDate = parse(dateString, formatString, new Date());

  // Kiểm tra:
  // 1. Ngày phải hợp lệ (`isValid(parsedDate)`).
  // 2. Chuỗi định dạng lại (`format(parsedDate, formatString)`) phải trùng khớp với `dateString`.
  return (
    isValid(parsedDate) && formatDate(parsedDate, formatString) === dateString
  );
}

export type { DatePickerProps, DateType, DatePickerBaseProps };

export const DatePicker = React.forwardRef(DatePickerInternal) as <
  T extends DateType = Date,
>(
  props: DatePickerProps<T> & {
    ref?: React.ForwardedRef<HTMLInputElement>;
  },
) => ReturnType<typeof DatePickerInternal>;
