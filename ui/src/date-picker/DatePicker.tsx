"use client";

import type { SelectSingleEventHandler } from "react-day-picker";
import * as React from "react";
import { format } from "date-fns";

import { Icon } from "@vyductan/icons";
import { clsm } from "@vyductan/utils";

import { Button } from "../button";
import { Calendar } from "../calendar";
import { Popover } from "../popover";

type DateRange = {
  start: Date | undefined;
  end?: Date | undefined;
};

export type DatePickerSingleProps = {
  mode: "single";
  value?: Date;
  onChange?: SelectSingleEventHandler;
};
export type DatePickerRangeProps = {
  mode: "range";
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
};
export type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps;
const DatePickerInternal = (
  props: DatePickerProps,
  ref: React.Ref<HTMLButtonElement>,
) => {
  const valueToDisplay =
    props.mode === "range" ? (
      props.value?.start ? (
        props.value.end ? (
          <>
            {format(props.value.start, "LLL dd, y")} -{" "}
            {format(props.value.end, "LLL dd, y")}
          </>
        ) : (
          format(props.value.start, "LLL dd, y")
        )
      ) : (
        <span className="text-placeholder">From Date - To Date</span>
      )
    ) : props.mode === "single" ? (
      props.value ? (
        format(props.value, "PPP")
      ) : (
        <span className="text-placeholder">Pick a date</span>
      )
    ) : null;
  const picker = (() => {
    if (props.mode === "single") {
      const { value, onChange, ...rest } = props;
      return (
        <Calendar initialFocus selected={value} onSelect={onChange} {...rest} />
      );
    }
    if (props.mode === "range") {
      const { value, onChange, ...rest } = props;
      return (
        <Calendar
          initialFocus
          selected={{
            from: value?.start,
            to: value?.end,
          }}
          onSelect={(range) => {
            onChange?.({
              start: range?.from,
              end: range?.to,
            });
          }}
          numberOfMonths={2}
          {...rest}
          mode="range"
        />
      );
    }
    return null;
  })();

  return (
    <Popover
      className="w-auto p-0"
      trigger={
        <Button
          className={clsm(
            "flex w-full",
            "justify-start text-left font-normal",
            !props.value && "text-muted-foreground",
          )}
          ref={ref}
        >
          {valueToDisplay}
          <Icon
            icon="mingcute:calendar-2-line"
            className="ml-auto size-4 opacity-50"
          />
        </Button>
      }
    >
      {picker}
    </Popover>
  );
};

export const DatePicker = React.forwardRef(DatePickerInternal);
