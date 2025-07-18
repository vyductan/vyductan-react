// https://github.com/shadcn-ui/ui/blob/805ed4120a6a8ae6f6e9714cbd776e18eeba92c7/apps/www/registry/new-york/example/date-picker-form.tsx
// Nov 6, 2024
// react-day-picker v9
// https://github.com/shadcn-ui/ui/pull/4371
// https://github.com/shadcn-ui/ui/pull/4421
"use client";

import * as React from "react";
import { useEffect } from "react";
import { useMergedState } from "@rc-component/util";
import { composeRef } from "@rc-component/util/lib/ref";
import { format as formatDate, isValid, parse, toDate } from "date-fns";

import { cn } from "@acme/ui/lib/utils";

import type { AnyObject } from "../_util/type";
import type { InputRef } from "../input";
import type { InputSizeVariants, InputVariants } from "../input/variants";
import type { DisabledDate } from "./types";
import { Icon } from "../../icons";
import { Calendar } from "../calendar";
import { useUiConfig } from "../config-provider/config-provider";
import { useComponentConfig } from "../config-provider/context";
import { Input } from "../input";
import { Popover } from "../popover";

// type DatePickerValueType = "date" | "string" | "number" | "format";

// type DateType<T extends DatePickerValueType> = T extends "date"
//   ? Date
//   : T extends "number"
//     ? number
//     : string;

type DatePickerBaseProps = InputVariants &
  InputSizeVariants & {
    id?: string;
    format?: string;
    /** To provide an additional time selection **/
    showTime?: boolean;

    allowClear?: boolean;
    className?: string;
    suffix?: React.ReactNode;
  };

type DatePickerProps<DateType extends AnyObject = Date> =
  DatePickerBaseProps & {
    ref?: React.Ref<InputRef>;
    defaultValue?: DateType;
    value?: DateType;
    /** Callback function, can be executed when the selected time is changing */
    onChange?: (date: DateType | undefined, dateString: string) => void;
    /**
     * Function that determines whether a date should be disabled
     * @param current The current date to check
     * @returns boolean indicating if the date should be disabled
     */
    disabledDate?: DisabledDate<DateType>;
    placeholder?: string;

    styles?: {
      root?: React.CSSProperties;
    };
    classNames?: {
      root?: string;
    };
  };
const DatePicker = <DateType extends AnyObject = Date>(
  props: DatePickerProps<DateType>,
) => {
  const {
    ref,
    id,

    value: valueProp,
    defaultValue: defaultValueProp,
    onChange,

    placeholder,
    format: formatProp,
    showTime,
    disabledDate,

    classNames: _,
    styles: __,
    disabled,
    allowClear = false,
    variant,
    size,
    status,

    className,
    ...rest
  } = props;

  const [open, setOpen] = React.useState(false);
  const { format: formatConfig } = useComponentConfig("datePicker");

  // ====================== Format Date =======================
  const datePickerConfig = useUiConfig((state) => state.components.datePicker);
  const format =
    formatProp ??
    (showTime
      ? `${formatConfig ?? datePickerConfig?.format} HH:mm`
      : (formatConfig ?? datePickerConfig?.format ?? "YYYY-MM-DD"));

  const valueType = React.useMemo(() => {
    let result = "format";
    if (typeof valueProp === "string") {
      result = "format";
    } else if (typeof valueProp === "number") {
      result = "number";
    } else if (typeof valueProp === "object") {
      result = "object";
    }
    return result;
  }, [valueProp]);

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
      return result as unknown as DateType;
    },
    [format, valueType],
  );

  // ====================== Value =======================
  const [value, setValue] = useMergedState(defaultValueProp, {
    value: valueProp,
    onChange: (value) => {
      onChange?.(
        value ? getDestinationValue(value as unknown as Date) : undefined,
        value ? formatDate(value as unknown as Date, format) : "",
      );
    },
  });
  const preInputValue = value
    ? formatDate(toDate(value as unknown as Date), format)
    : "";
  const [inputValue, setInputValue] = useMergedState(preInputValue, {});

  const handleChange = (input: string | Date | undefined) => {
    if (!input) {
      setValue(undefined);
      return;
    }

    const date = toDate(input);
    let result;
    if (valueType === "string") {
      result = formatDate(date, format);
    } else if (valueType === "format") {
      result = formatDate(date, format);
    } else if (typeof valueType === "number") {
      result = date.getTime();
    } else {
      result = date;
    }
    setValue(result as unknown as DateType);
  };

  const inputRef = React.useRef<InputRef>(null);

  const composedRef = ref ? composeRef(ref, inputRef) : inputRef;
  const handleChangeInput = (value: string) => {
    if (isValidDateStringExact(value, format)) {
      handleChange(inputValue);
    } else {
      setInputValue(preInputValue);
    }
    setOpen(false);
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

  const [month, setMonth] = React.useState<Date | undefined>(
    value && toDate(value as unknown as Date),
  );

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
              captionLayout="dropdown"
              // initialFocus // disable default focus (in shadcn default is true)
              // defaultMonth={value && toDate(value)}
              month={month}
              onMonthChange={setMonth}
              selected={value ? toDate(value as unknown as Date) : undefined}
              onSelect={(date) => {
                if (date) {
                  setValue(getDestinationValue(date));
                  setInputValue(formatDate(date, format));
                }
                setOpen(false);
              }}
              disabled={(date) => {
                if (disabledDate) {
                  // Pass both the date and the required info object
                  return disabledDate(getDestinationValue(date), {
                    type: "date",
                  });
                }
                return false;
              }}
            />
          </div>
        }
      >
        <div data-slot="picker-input">
          <Input
            ref={composedRef}
            id={id}
            value={inputValue}
            placeholder={placeholder}
            status={status}
            allowClear={allowClear}
            variant={variant}
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
              }
            }}
            onChange={(event) => {
              setInputValue(event.currentTarget.value);
              // if (isValidDateStringExact(event.currentTarget.value, format)) {
              //   handleChange(event.currentTarget.value);
              // } else {
              //   // eslint-disable-next-line unicorn/no-useless-undefined
              //   handleChange(undefined);
              // }
            }}
            {...rest}
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
  // Validation:
  // 1. The date must be valid (`isValid(parsedDate)`).
  // 2. The reformatted string (`format(parsedDate, formatString)`) must match `dateString`.
  return (
    isValid(parsedDate) && formatDate(parsedDate, formatString) === dateString
  );
}

export type { DatePickerProps, DatePickerBaseProps };
export { DatePicker };
