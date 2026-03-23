import React from "react";
import dayjs from "dayjs";

import { cn } from "@acme/ui/lib/utils";

import type { DateType } from "../time-picker";
import { Button } from "../../button";

type TimeSelectProps = {
  value?: DateType;
  onChange?: (value: DateType) => void;
  onHoverChange?: (value?: DateType) => void;

  format?: string;
  onOk?: () => void;
  onNow?: () => void;
};
export const TimeSelect = ({
  value,
  format = "HH:mm:ss",
  onChange,
  onHoverChange,
  onOk,
  onNow,
}: TimeSelectProps) => {
  const hourType = format.split(":")[0];
  const baseHourOptions = Array.from(
    { length: hourType === "HH" ? 24 : 12 },
    (_, index) => index,
  );
  const baseMinuteOptions = Array.from({ length: 60 }, (_, index) => index);
  const baseSecondOptions = Array.from({ length: 60 }, (_, index) => index);
  const showSeconds = format.split(":").length > 2;

  // Create infinite scroll effect by duplicating items
  const hourOptions = [
    ...baseHourOptions,
    ...baseHourOptions,
    ...baseHourOptions,
  ];
  const minuteOptions = [
    ...baseMinuteOptions,
    ...baseMinuteOptions,
    ...baseMinuteOptions,
  ];
  const secondOptions = [
    ...baseSecondOptions,
    ...baseSecondOptions,
    ...baseSecondOptions,
  ];

  // Refs for scrollable containers
  const hourListRef = React.useRef<HTMLUListElement>(null);
  const minuteListRef = React.useRef<HTMLUListElement>(null);
  const secondListRef = React.useRef<HTMLUListElement>(null);

  // Item height for scroll calculations (py-1 = 4px top + 4px bottom + ~20px text ≈ 28px)
  const ITEM_HEIGHT = 28;

  // Handle infinite scroll by resetting scroll position at boundaries
  const handleInfiniteScroll = React.useCallback(
    (e: React.UIEvent<HTMLUListElement>, baseLength: number) => {
      const container = e.currentTarget;
      const scrollTop = container.scrollTop;
      const setHeight = ITEM_HEIGHT * baseLength;

      // If scrolling into the first set (near top), jump to equivalent position in middle set
      if (scrollTop < setHeight * 0.5) {
        container.scrollTop = scrollTop + setHeight;
      }

      // If scrolling into the last set (near bottom), jump to equivalent position in middle set
      if (scrollTop > setHeight * 2.5) {
        container.scrollTop = scrollTop - setHeight;
      }
    },
    [],
  );

  // Instant scroll to selected values when component mounts (no animation)
  // Use useLayoutEffect to ensure scroll happens after DOM render but before paint
  React.useLayoutEffect(() => {
    const scrollToSelected = () => {
      const hourLength = baseHourOptions.length;
      const minuteLength = baseMinuteOptions.length;
      const secondLength = baseSecondOptions.length;

      // If no value, scroll to start of middle set to show 00 at top
      if (!value) {
        if (hourListRef.current) {
          const targetIndex = hourLength; // Start of middle set
          const hourElement = hourListRef.current.children[targetIndex] as
            | HTMLElement
            | undefined;
          if (hourElement) {
            hourElement.scrollIntoView({
              behavior: "auto",
              block: "start",
            });
          }
        }

        if (minuteListRef.current) {
          const targetIndex = minuteLength;
          const minuteElement = minuteListRef.current.children[targetIndex] as
            | HTMLElement
            | undefined;
          if (minuteElement) {
            minuteElement.scrollIntoView({
              behavior: "auto",
              block: "start",
            });
          }
        }

        if (showSeconds && secondListRef.current) {
          const targetIndex = secondLength;
          const secondElement = secondListRef.current.children[targetIndex] as
            | HTMLElement
            | undefined;
          if (secondElement) {
            secondElement.scrollIntoView({
              behavior: "auto",
              block: "start",
            });
          }
        }
        return;
      }

      // If value exists, scroll to selected value
      const selectedHour = value.hour();
      const selectedMinute = value.minute();

      // Scroll to middle set (offset by one full set) for infinite scroll effect
      if (hourListRef.current) {
        const targetIndex = hourLength + selectedHour;
        const hourElement = hourListRef.current.children[targetIndex] as
          | HTMLElement
          | undefined;
        if (hourElement) {
          hourElement.scrollIntoView({
            behavior: "auto", // instant scroll, no animation
            block: "start",
          });
        }
      }

      if (minuteListRef.current) {
        const targetIndex = minuteLength + selectedMinute;
        const minuteElement = minuteListRef.current.children[targetIndex] as
          | HTMLElement
          | undefined;
        if (minuteElement) {
          minuteElement.scrollIntoView({
            behavior: "auto", // instant scroll, no animation
            block: "start",
          });
        }
      }

      // Scroll second list to selected second if seconds are shown
      if (showSeconds && secondListRef.current) {
        const selectedSecond = value.second();
        const targetIndex = secondLength + selectedSecond;
        const secondElement = secondListRef.current.children[targetIndex] as
          | HTMLElement
          | undefined;
        if (secondElement) {
          secondElement.scrollIntoView({
            behavior: "auto", // instant scroll, no animation
            block: "start",
          });
        }
      }
    };

    scrollToSelected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // NOTE: 'value' is intentionally NOT in deps to preserve smooth scroll UX:
    // - On mount: useLayoutEffect runs ONCE with instant scroll (behavior: "auto")
    // - On click: onClick handler provides smooth scroll (behavior: "smooth")
    // If 'value' were in deps, every value change would trigger instant scroll,
    // overriding the smooth animation from onClick and degrading UX.
    // value,
    showSeconds,
    baseHourOptions.length,
    baseMinuteOptions.length,
    baseSecondOptions.length,
  ]);
  return (
    <div className="flex flex-col py-3 text-sm">
      <div
        className="flex h-[224px] flex-auto"
        onMouseLeave={() => onHoverChange?.()}
      >
        <ul
          ref={hourListRef}
          className="flex w-14 flex-1 flex-col gap-0.5 overflow-y-auto py-24 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={(e) => handleInfiniteScroll(e, baseHourOptions.length)}
        >
          {/* <ScrollArea className="h-[227px]"> */}
          {hourOptions.map((hour, index) => {
            const actualHour = hour % baseHourOptions.length;
            return (
              <li
                key={index}
                className={cn(
                  "mx-1 flex cursor-pointer justify-center rounded-sm py-1 transition-colors",
                  "hover:bg-accent hover:text-muted-foreground",
                  value?.hour() === actualHour && "bg-primary-200",
                )}
                onMouseEnter={() => {
                  const newDate = value
                    ? value.hour(actualHour)
                    : dayjs()
                        .hour(0)
                        .minute(0)
                        .second(0)
                        .millisecond(0)
                        .hour(actualHour);
                  onHoverChange?.(newDate);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  const newDate = value
                    ? value.hour(actualHour)
                    : dayjs()
                        .hour(0)
                        .minute(0)
                        .second(0)
                        .millisecond(0)
                        .hour(actualHour);
                  onChange?.(newDate);

                  // Scroll to top
                  const target = e.currentTarget;
                  target.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
              >
                {actualHour.toString().padStart(2, "0")}
              </li>
            );
          })}
          {/* </ScrollArea> */}
        </ul>
        <ul
          ref={minuteListRef}
          className="flex w-14 flex-col gap-0.5 overflow-y-auto border-l py-24 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={(e) => handleInfiniteScroll(e, baseMinuteOptions.length)}
        >
          {minuteOptions.map((minute, index) => {
            const actualMinute = minute % baseMinuteOptions.length;
            return (
              <li
                key={index}
                className={cn(
                  "mx-1 flex cursor-pointer justify-center rounded-sm py-1 transition-colors",
                  "hover:bg-accent hover:text-muted-foreground",
                  value?.minute() === actualMinute && "bg-primary-200",
                )}
                onMouseEnter={() => {
                  const newDate = value
                    ? value.minute(actualMinute)
                    : dayjs()
                        .hour(0)
                        .minute(0)
                        .second(0)
                        .millisecond(0)
                        .minute(actualMinute);
                  onHoverChange?.(newDate);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  const newDate = value
                    ? value.minute(actualMinute)
                    : dayjs()
                        .hour(0)
                        .minute(0)
                        .second(0)
                        .millisecond(0)
                        .minute(actualMinute);
                  onChange?.(newDate);

                  // Scroll to top
                  const target = e.currentTarget;
                  target.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
              >
                {actualMinute.toString().padStart(2, "0")}
              </li>
            );
          })}
        </ul>
        {showSeconds && (
          <ul
            ref={secondListRef}
            className="flex w-14 flex-col gap-0.5 overflow-y-auto border-l py-24 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onScroll={(e) => handleInfiniteScroll(e, baseSecondOptions.length)}
          >
            {secondOptions.map((second, index) => {
              const actualSecond = second % baseSecondOptions.length;
              return (
                <li
                  key={index}
                  className={cn(
                    "mx-1 flex cursor-pointer justify-center rounded-sm py-1 transition-colors",
                    "hover:bg-accent hover:text-muted-foreground",
                    value?.second() === actualSecond && "bg-primary-200",
                  )}
                  onMouseEnter={() => {
                    const newDate = value
                      ? value.second(actualSecond)
                      : dayjs()
                          .hour(0)
                          .minute(0)
                          .second(0)
                          .millisecond(0)
                          .second(actualSecond);
                    onHoverChange?.(newDate);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    const newDate = value
                      ? value.second(actualSecond)
                      : dayjs()
                          .hour(0)
                          .minute(0)
                          .second(0)
                          .millisecond(0)
                          .second(actualSecond);
                    onChange?.(newDate);

                    // Scroll to top
                    const target = e.currentTarget;
                    target.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                >
                  {actualSecond.toString().padStart(2, "0")}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="flex justify-between border-t px-3 pt-3">
        <Button
          size="small"
          type="link"
          className="px-0"
          onClick={() => onNow?.()}
        >
          Now
        </Button>
        <Button size="small" type="primary" onClick={() => onOk?.()}>
          Ok
        </Button>
      </div>
    </div>
  );
};

export type { TimeSelectProps };
