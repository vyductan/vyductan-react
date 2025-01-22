// https://github.com/shadcn-ui/ui/blob/805ed4120a6a8ae6f6e9714cbd776e18eeba92c7/apps/www/registry/new-york/example/date-picker-form.tsx
// Nov 6, 2024
// react-day-picker v9
// https://github.com/shadcn-ui/ui/pull/4371
// https://github.com/shadcn-ui/ui/pull/4421
"use client";

import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { useEffect } from "react";
import { format as formatDate, isValid, parse, toDate } from "date-fns";
import { useMergedState } from "rc-util";
import { composeRef } from "rc-util/lib/ref";

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
    ref?: React.Ref<InputRef>;
    id?: string;
    format?: string;
    /** To provide an additional time selection **/
    showTime?: boolean;

    allowClear?: boolean;
    className?: string;
  };

type DatePickerProps<T extends DatePickerValueType = "date"> =
  DatePickerBaseProps & {
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
  const [inputValue, setInputValue] = useMergedState(preInputValue);
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
  const composedRef = ref ? composeRef(ref, inputRef) : inputRef;
  const handleChangeInput = (value: string) => {
    if (isValidDateStringExact(value, format)) {
      handleChange(inputValue);
    } else {
      setInputValue(preInputValue);
    }
  };
  // handle click outside from input (is focus within)
  // const [isFocused, setIsFocused] = React.useState(false);
  // useFocusWithin(inputRef, {
  //   onFocus: () => {
  //     setIsFocused(true);
  //   },
  // });
  // useClickAway((event) => {
  //   const target = event.target as HTMLElement | null;
  //   // if (target === inputRef.current) {
  //   //   setIsFocused(false);
  //   //   return;
  //   // }
  //   // if (
  //   //   isFocused &&
  //   //   // check if choose a day in panel or not
  //   //   !(target && "name" in target && target.name === "day") &&
  //   //   // condition click to navigate month
  //   //   !(
  //   //     target?.tagName === "SPAN" &&
  //   //     target.parentElement &&
  //   //     "name" in target.parentElement
  //   //   )
  //   // ) {
  //   //   handleChangeInput(inputValue);
  //   //   setOpen(false);
  //   // }
  // }, inputRef);

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
        open={open}
        onOpenChange={() => {
          if (!open) {
            setOpen(true);
          }
        }}
        onInteractOutside={(event) => {
          // console.log(
          //   "interact outside",
          //   event.target,
          //   inputRef.current,
          //   event.target?.querySelector("input") === inputRef.current,
          //   event.target === inputRef.current,
          // );
          // TODO: fix click div still close and reopen popup (maybe use clickaway)
          // TODO: fix pres ESC doesn't close
          if (event.target !== inputRef.current) {
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
                  setValue(getDestinationValue(date));
                  setInputValue(formatDate(date, format));
                }
                setOpen(false);
              }}
            />
          </div>
        }
      >
        {/* Use div to temp fix panel offset */}
        <div>
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
            className={cn("items-center", "justify-start text-left", className)}
            suffix={
              <Icon
                icon="icon-[mingcute--calendar-2-line]"
                className="ml-auto size-4 opacity-50"
              />
            }
            // onClick={() => {
            //   console.log("click", open);
            //   if (!open) setOpen(true);
            // }}
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
        </div>
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

export type {
  DatePickerProps,
  DatePickerBaseProps,
  DatePickerValueType,
  DateType,
};
export { DatePicker };
