import type { ForwardedRef } from "react";
import React from "react";
import { useMergedState } from "rc-util";

import { cn } from "..";
import { Icon } from "../icons";
import { inputSizeVariants, inputVariants } from "../input";
import { Popover } from "../popover";
import { Panel } from "./_components/panel";

type YearPickerProps = {
  id?: string;
  open?: boolean;

  value?: number;
  onChange?: (value?: number) => void;
};
const YearPickerInternal = (
  {
    id: inputId,
    open: openProp,

    value,
    onChange,
  }: YearPickerProps,
  ref: ForwardedRef<HTMLDivElement>,
) => {
  const [open, setOpen] = useMergedState(false, {
    value: openProp,
  });

  // const [currentYear, setCurrentYear] = React.useState(
  //   new Date().getFullYear(),
  // );
  const [currentDecadeRange, setCurrentDecadeRange] = React.useState<number[]>(
    getCurrentDecadeRange(new Date().getFullYear()),
  );

  return (
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
        <Panel
          title={currentDecadeRange[0] + " - " + currentDecadeRange[9]}
          onNavigationLeftClick={() => {
            setCurrentDecadeRange(
              getCurrentDecadeRange(currentDecadeRange[0]! - 10),
            );
          }}
          onNavigationRightClick={() => {
            setCurrentDecadeRange(
              getCurrentDecadeRange(currentDecadeRange[0]! + 10),
            );
          }}
          classNames={{
            content: "grid grid-cols-3",
          }}
        >
          {[
            currentDecadeRange.at(0)! - 1,
            ...currentDecadeRange,
            currentDecadeRange.at(-1)! + 1,
          ].map((number_, index) => {
            // const monthString = format(new Date(currentYear, index, 1), "MMM");
            return (
              <div
                key={index}
                className="cursor-pointer p-4"
                onClick={() => {
                  onChange?.(number_);
                  setOpen(false);
                }}
              >
                <div
                  className={cn(
                    "rounded-md px-4 py-0.5 hover:bg-background-hover",
                    number_ === new Date().getFullYear() && "bg-background",
                    value === index &&
                      "bg-primary-600 text-white hover:bg-primary-600",
                  )}
                >
                  {number_}
                </div>
              </div>
            );
          })}
        </Panel>
      }
    >
      <div
        ref={ref}
        className={cn(
          inputVariants(),
          inputSizeVariants(),
          "gap-2",
          // "grid grid-cols-[1fr_16px_1fr] items-center gap-2",
        )}
        onClick={() => {
          if (!open) setOpen(true);
        }}
      >
        <div>
          <span>{value}</span>
        </div>
        <Icon
          icon="icon-[mingcute--calendar-2-line]"
          className="my-0.5 ml-auto size-4 opacity-50"
        />
      </div>
    </Popover>
  );
};
export const YearPicker = React.forwardRef(YearPickerInternal) as (
  props: YearPickerProps & {
    ref?: React.ForwardedRef<HTMLInputElement>;
  },
) => ReturnType<typeof YearPickerInternal>;

function getCurrentDecadeRange(currentYear: number): number[] {
  const startYear = Math.floor(currentYear / 10) * 10; // Lấy năm bắt đầu của thập kỷ
  const endYear = startYear + 9; // Lấy năm kết thúc của thập kỷ
  const years: number[] = [];

  for (let year = startYear; year <= endYear; year++) {
    years.push(year);
  }

  return years;
}
