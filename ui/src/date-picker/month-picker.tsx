import type { ForwardedRef } from "react";
import React from "react";
import { format } from "date-fns";
import { useMergedState } from "rc-util";

import { cn } from "..";
import { Icon } from "../icons";
import { inputSizeVariants, inputVariants } from "../input";
import { Popover } from "../popover";
import { Panel } from "./_components/panel";

type MonthPickerProps = {
  id?: string;
  open?: boolean;

  value?: number;
  onChange?: (value?: number) => void;
};
const MonthPickerInternal = (
  {
    id: inputId,
    open: openProp,

    value,
    onChange,
  }: MonthPickerProps,
  ref: ForwardedRef<HTMLDivElement>,
) => {
  const [open, setOpen] = useMergedState(false, {
    value: openProp,
  });

  const [currentYear, setCurrentYear] = React.useState(
    new Date().getFullYear(),
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
          title={currentYear}
          topbar={false}
          onNavigationLeftClick={() => {
            setCurrentYear(currentYear - 1);
          }}
          onNavigationRightClick={() => {
            setCurrentYear(currentYear + 1);
          }}
          classNames={{
            content: "grid grid-cols-3",
          }}
        >
          {Array.from({ length: 12 }).map((_, index) => {
            const monthString = format(new Date(currentYear, index, 1), "MMM");
            return (
              <div
                key={index}
                className="cursor-pointer p-4"
                onClick={() => {
                  onChange?.(index);
                  setOpen(false);
                }}
              >
                <div
                  className={cn(
                    "rounded-md px-4 py-0.5 hover:bg-background-hover",
                    index === new Date().getMonth() && "bg-background",
                    value === index &&
                      "bg-primary-600 text-white hover:bg-primary-600",
                  )}
                >
                  {monthString}
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
          <span>
            {value === undefined || (value as unknown as string) === "" ? (
              <></>
            ) : (
              format(new Date(currentYear, value, 1), "MMM")
            )}
          </span>
        </div>
        <Icon
          icon="icon-[mingcute--calendar-2-line]"
          className="my-0.5 ml-auto size-4 opacity-50"
        />
      </div>
    </Popover>
  );
};
export const MonthPicker = React.forwardRef(MonthPickerInternal) as (
  props: MonthPickerProps & {
    ref?: React.ForwardedRef<HTMLInputElement>;
  },
) => ReturnType<typeof MonthPickerInternal>;
