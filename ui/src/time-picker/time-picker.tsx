import type { ForwardedRef } from "react";
import React from "react";
import { format as formatDate, parse } from "date-fns";
import { useMergedState } from "rc-util";

import type { InputProps } from "../input";
import type { TimeSelectProps } from "./_components/time-select";
import { cn } from "..";
import { Icon } from "../icons";
import { Input } from "../input";
import { Popover } from "../popover";
import { TimeSelect } from "./_components/time-select";

type TimePickerProps = Omit<InputProps, "defaultValue" | "value"> & {
  id?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  format?: string;

  defaultValue?: string;
  value?: string;
  onChange?: (time: string | undefined) => void;
};
const TimePickerInternal = (
  props: TimePickerProps,
  ref: ForwardedRef<HTMLInputElement>,
) => {
  const {
    id: inputId,
    open: openProp,
    onOpenChange,

    className,
    placeholder = "Select time",

    format = "HH:mm",

    defaultValue,
    value,
    onChange,
    ...inputProps
  } = props;
  const [open, setOpen] = useMergedState(false, {
    value: openProp,
    onChange: onOpenChange,
  });

  // ====================== Value =======================
  const [inputValue, setInputValue] = useMergedState(defaultValue, {
    value,
  });

  const onInputChangeHandler = (input: string | undefined) => {
    onChange?.(input);
    setInputValue(input);
  };
  return (
    <>
      <Popover
        open={open}
        className="w-auto p-0"
        trigger="click"
        sideOffset={8}
        placement="bottomLeft"
        onInteractOutside={(event) => {
          if (
            event.target &&
            "id" in event.target &&
            event.target.id !== inputId
          ) {
            setOpen(false);
          }
        }}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
        content={
          <div className="flex">
            <TimeSelect
              value={
                inputValue ? parse(inputValue, format, new Date()) : undefined
              }
              format={format}
              onChange={(value) => {
                onInputChangeHandler(formatDate(value, format));
                // setOpen(false);
              }}
            />
          </div>
        }
      >
        <Input
          ref={ref}
          id={inputId}
          autoComplete="off"
          {...inputProps}
          // allowClear={allowClear}
          // borderless={borderless}
          // size={size}
          // status={status}
          placeholder={placeholder}
          className={cn(
            "items-center",
            "justify-start text-left",
            "w-[128px]",
            className,
          )}
          suffix={
            <Icon
              icon="icon-[mingcute--time-line]"
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
              if (event.currentTarget.value.length === 10) {
                onInputChangeHandler(event.currentTarget.value);
              } else {
                setInputValue(value);
              }
              setOpen(false);
            }
          }}
          onChange={(event) => {
            setInputValue(event.currentTarget.value);
            if (event.currentTarget.value === "") {
              // eslint-disable-next-line unicorn/no-useless-undefined
              onInputChangeHandler(undefined);
            } else {
              try {
                parse(event.currentTarget.value, format, new Date());
                onInputChangeHandler(event.currentTarget.value);
              } catch {
                //
              }
            }
          }}
        />
      </Popover>
    </>
  );
};

export const TimePicker = React.forwardRef(TimePickerInternal) as (
  props: TimeSelectProps & {
    ref?: React.ForwardedRef<HTMLInputElement>;
  },
) => ReturnType<typeof TimePickerInternal>;
