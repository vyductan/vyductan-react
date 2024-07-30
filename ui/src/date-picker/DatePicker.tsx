"use client";

import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { useClickAway, useFocusWithin } from "ahooks";
import { format as formatDate, isValid, parse } from "date-fns";
import { useMergedState } from "rc-util";

import type { inputSizeVariants, inputVariants } from "../input";
import { clsm } from "..";
import { Calendar } from "../calendar";
import { Icon } from "../icons";
import { Input } from "../input";
import { Popover } from "../popover";

export type DatePickerProps = VariantProps<typeof inputVariants> &
  VariantProps<typeof inputSizeVariants> & {
    format?: string;
    defaultValue?: Date;
    value?: Date;
    placeholder?: string;
    /** Callback function, can be executed when the selected time is changing */
    onChange?: (date: Date | undefined, dateString: string) => void;
  };
const DatePickerInternal = (
  {
    borderless,
    format = "dd/MM/yyyy",
    size,
    status,
    defaultValue,
    value,
    placeholder,
    ...props
  }: DatePickerProps,
  ref: React.Ref<HTMLInputElement>,
) => {
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState<Date | undefined>(
    defaultValue !== undefined
      ? isValid(defaultValue)
        ? defaultValue
        : new Date()
      : isValid(value)
        ? value
        : new Date(),
  );

  const inputId = React.useId();

  // ====================== Value =======================
  const preValue =
    defaultValue !== undefined
      ? isValid(defaultValue)
        ? formatDate(defaultValue, format)
        : ""
      : isValid(value)
        ? formatDate(value!, format)
        : "";
  const [inputValue, setInputValue] = useMergedState(preValue);

  // set input value if date value change
  React.useEffect(() => {
    const x = isValid(value) ? formatDate(value!, format) : "";
    setInputValue(x);
    setMonth(value ? value : new Date());
  }, [value, setInputValue, format]);

  const handleChange = (input: string | Date) => {
    const inputDate =
      typeof input === "string" ? parse(input, format, new Date()) : input;
    if (isValid(inputDate)) {
      props.onChange?.(inputDate, formatDate(inputDate, format));
      setInputValue(formatDate(inputDate, format));
      setMonth(inputDate);
    } else {
      setInputValue(preValue);
      props.onChange?.(undefined, "");
    }
  };

  const picker = (
    <Calendar
      mode="single"
      selected={value}
      onSelect={(_, selectedDate) => {
        handleChange(selectedDate);
        setOpen(false);
      }}
      month={month}
      onMonthChange={setMonth}
      {...props}
    />
  );

  // handle click outside from input (is focus within)
  const [isFocused, setIsFocused] = React.useState(false);
  useFocusWithin(() => document.getElementById(inputId), {
    onFocus: () => {
      setIsFocused(true);
    },
  });

  useClickAway(
    (e) => {
      if (isFocused) {
        // check if choose a day in panel or not
        if (!(e.target && "name" in e.target && e.target.name === "day")) {
          if (inputValue.length === 10) {
            handleChange(inputValue);
          } else {
            setInputValue(preValue);
          }
        }
      }
    },
    () => document.getElementById(inputId),
  );

  return (
    <>
      <Popover
        open={open}
        className="w-auto p-0"
        content={picker}
        trigger="click"
        sideOffset={8}
        onInteractOutside={(e) => {
          if (e.target && "id" in e.target && e.target.id !== inputId) {
            setOpen(false);
          }
        }}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <Input
          id={inputId}
          allowClear
          borderless={borderless}
          size={size}
          status={status}
          className={clsm("items-center", "justify-start text-left")}
          ref={ref}
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
          onKeyUp={(e) => {
            e.stopPropagation();
            if (e.key === "Enter" || e.key === "Escape") {
              if (e.currentTarget.value.length === 10) {
                handleChange(e.currentTarget.value);
              } else {
                setInputValue(preValue);
              }
              setOpen(false);
            }
          }}
          onChange={(e) => {
            setInputValue(e.currentTarget.value);
            if (e.currentTarget.value === "") {
              props.onChange?.(undefined, "");
            } else if (e.currentTarget.value.length === 10) {
              handleChange(e.currentTarget.value);
            }
          }}
        />
      </Popover>
    </>
  );
};

export const DatePicker = React.forwardRef(DatePickerInternal);
