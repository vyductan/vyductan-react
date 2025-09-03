import React from "react";
import dayjs from "dayjs";

import { cn } from "@acme/ui/lib/utils";

import type { DateType } from "../time-picker";
import { Button } from "../../button";

type TimeSelectProps = {
  value?: DateType;
  onChange?: (value: DateType) => void;

  format?: string;
  onOk?: () => void;
};
export const TimeSelect = ({
  value,
  format = "HH:mm",
  onChange,
  onOk,
}: TimeSelectProps) => {
  const hourType = format.split(":")[0];
  const hourOptions = Array.from(
    { length: hourType === "HH" ? 24 : 12 },
    (_, index) => index,
  );
  const minuteOptions = Array.from({ length: 60 }, (_, index) => index);

  // Refs for scrollable containers
  const hourListRef = React.useRef<HTMLUListElement>(null);
  const minuteListRef = React.useRef<HTMLUListElement>(null);

  // Auto-scroll to selected values when component mounts or value changes
  React.useEffect(() => {
    if (!value) return;

    const scrollToSelected = () => {
      const selectedHour = value.hour();
      const selectedMinute = value.minute();

      // Scroll hour list to selected hour
      if (hourListRef.current) {
        const hourElement = hourListRef.current.children[selectedHour] as
          | HTMLElement
          | undefined;
        if (hourElement) {
          hourElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }

      // Scroll minute list to selected minute
      if (minuteListRef.current) {
        const minuteElement = minuteListRef.current.children[selectedMinute] as
          | HTMLElement
          | undefined;
        if (minuteElement) {
          minuteElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(scrollToSelected, 100);
    return () => clearTimeout(timeoutId);
  }, [value]);
  return (
    <div className="flex flex-col py-3 pr-3 text-sm">
      <div className="flex h-[224px] flex-auto divide-x">
        <ul
          ref={hourListRef}
          className="flex flex-1 flex-col gap-0.5 overflow-y-auto"
        >
          {/* <ScrollArea className="h-[227px]"> */}
          {hourOptions.map((hour) => (
            <li
              key={hour}
              className={cn(
                "mx-1 flex cursor-pointer justify-center rounded-sm px-4 py-1",
                "hover:bg-background-hover",
                value?.hour() === hour && "bg-primary-200",
              )}
              onClick={() => {
                const newDate = value ?? dayjs();
                onChange?.(newDate.hour(hour));
              }}
            >
              {hour.toString().padStart(2, "0")}
            </li>
          ))}
          {/* </ScrollArea> */}
        </ul>
        <ul
          ref={minuteListRef}
          className="flex flex-col gap-0.5 overflow-y-auto"
        >
          {minuteOptions.map((minute) => (
            <li
              key={minute}
              className={cn(
                "mx-1 flex cursor-pointer justify-center rounded-sm px-4 py-1",
                "hover:bg-background-hover",
                value?.minute() === minute && "bg-primary-200",
              )}
              onClick={() => {
                const newDate = value ?? dayjs();
                onChange?.(newDate.minute(minute));
              }}
            >
              {minute.toString().padStart(2, "0")}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex justify-end border-t pt-3">
        <Button size="sm" className="ml-auto" onClick={() => onOk?.()}>
          Ok
        </Button>
      </div>
    </div>
  );
};

export type { TimeSelectProps };
