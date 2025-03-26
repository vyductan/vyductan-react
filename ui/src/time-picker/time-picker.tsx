import React from "react";
import { useMergedState } from "@rc-component/util";
import { format as formatDate, parse } from "date-fns";

import type { InputProps, InputRef } from "../input";
import { cn } from "..";
import { Icon } from "../icons";
import { Input } from "../input";
import { Popover } from "../popover";
import { TimeSelect } from "./_components/time-select";

type TimePickerProps = Omit<InputProps, "defaultValue" | "value"> & {
  ref?: React.Ref<InputRef>;
  id?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  format?: string;

  defaultValue?: string;
  value?: string;
  onChange?: (time: string | undefined) => void;
};
const TimePicker = (props: TimePickerProps) => {
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

export { TimePicker };
