// https://github.com/shadcn-ui/ui/blob/805ed4120a6a8ae6f6e9714cbd776e18eeba92c7/apps/www/registry/new-york/example/date-picker-form.tsx
// Nov 6, 2024
// react-day-picker v9
// https://github.com/shadcn-ui/ui/pull/4371
// https://github.com/shadcn-ui/ui/pull/4421
"use client";

import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { useEffect } from "react";
import { useMergedState } from "@rc-component/util";
import { composeRef } from "@rc-component/util/lib/ref";
import { format as formatDate, isValid, parse, toDate } from "date-fns";

import type { InputRef, inputSizeVariants, InputVariants } from "../input";
import { cn } from "..";
import { Calendar } from "../calendar";
import { Icon } from "../icons";
import { Input } from "../input";
import { Popover } from "../popover";
import { useUiConfig } from "../store";

type DatePickerValueType = "date" | "string" | "number" | "format";

type DateType<T extends DatePickerValueType> = T extends "date"
  ? Date
  : T extends "number"
    ? number
    : string;

type DatePickerBaseProps = InputVariants &
  VariantProps<typeof inputSizeVariants> & {
    id?: string;
    format?: string;
    /** To provide an additional time selection **/
    showTime?: boolean;

    allowClear?: boolean;
    className?: string;
    suffix?: React.ReactNode;
  };

type DatePickerProps<T extends DatePickerValueType = "date"> =
  DatePickerBaseProps & {
    ref?: React.Ref<InputRef>;
    valueType?: T;
    defaultValue?: DateType<T>;
    value?: DateType<T>;
    /** Callback function, can be executed when the selected time is changing */
    onChange?: (date: DateType<T> | undefined, dateString: string) => void;
    placeholder?: string;
  };
const DatePicker = <T extends DatePickerValueType = "date">({
  valueType,
  ref,
  id,

  placeholder,
  format: formatProp = "dd/MM/yyyy",
  showTime,

  disabled,
  allowClear = false,
  borderless,
  size,
  status,

  className,
  ...props
}: DatePickerProps<T>) => {
  const [open, setOpen] = React.useState(false);

  // ====================== Format Date =======================
  const datePickerConfig = useUiConfig((state) => state.components.datePicker);
  let format = formatProp;
  if (datePickerConfig?.format) {
    format = datePickerConfig.format;
  }
  format = showTime ? `${format} HH:mm` : format;

  const getDestinationValue = React.useCallback(
    (date: Date) => {
      let result;
      if (valueType === "string") {
        result = formatDate(date, "yyyy-MM-dd'T'HH:mm:ss");
      } else if (valueType === "format") {
        result = formatDate(date, format);
      } else if (typeof valueType === "number") {
        result = date.getTime();
      } else {
        result = date;
      }
      return result as DateType<T>;
    },
    [format, valueType],
  );

  // ====================== Value =======================
  const [value, setValue] = useMergedState(props.defaultValue, {
    value: props.value,
    onChange: (value) => {
      props.onChange?.(
        getDestinationValue(value as Date),
        formatDate(value as Date, format),
      );
    },
  });
  const preInputValue = value ? formatDate(toDate(value), format) : "";
  const [inputValue, setInputValue] = useMergedState(preInputValue, {
    value: preInputValue,
  });
  const handleChange = (input: string | Date) => {
    const date = toDate(input);
    let result;
    if (valueType === "string") {
      result = date.toISOString();
    } else if (valueType === "format") {
      result = formatDate(date, format);
    } else if (typeof valueType === "number") {
      result = date.getTime();
    } else {
      result = date;
    }
    setValue(result as DateType<T>);
  };

  const inputRef = React.useRef<InputRef>(null);
  // eslint-disable-next-line react-compiler/react-compiler
  const composedRef = ref ? composeRef(ref, inputRef) : inputRef;
  const handleChangeInput = (value: string) => {
    if (isValidDateStringExact(value, format)) {
      handleChange(inputValue);
    } else {
      setInputValue(preInputValue);
    }
  };

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
        placement="bottomLeft"
        align={{
          // fix panel offset -  based on input size
          offset: [-12, 10],
        }}
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
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
                  setValue(getDestinationValue(date));
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
          value={inputValue}
          placeholder={placeholder}
          status={status}
          allowClear={allowClear}
          borderless={borderless}
          size={size}
          disabled={disabled}
          className={cn(
            "items-center",
            "justify-start text-left",
            "[&>input]:w-full", // fix width of input is not fit with parent width
            className,
          )}
          suffix={
            <Icon
              icon="icon-[mingcute--calendar-2-line]"
              className="ml-auto size-4 opacity-50"
            />
          }
          onClick={(e) => {
            if (open) {
              // prevent close when click into input if popover openning
              e.preventDefault();
            }
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
      </Popover>
    </>
  );
};

function isValidDateStringExact(
  dateString: string,
  formatString: string,
): boolean {
  const parsedDate = parse(dateString, formatString, new Date());

  // Validation:
  // 1. The date must be valid (`isValid(parsedDate)`).
  // 2. The reformatted string (`format(parsedDate, formatString)`) must match `dateString`.
  return (
    isValid(parsedDate) && formatDate(parsedDate, formatString) === dateString
  );
}

export type {
  DatePickerProps,
  DatePickerBaseProps,
  DatePickerValueType,
  DateType,
};
export { DatePicker };
