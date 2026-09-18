import React from "react";
import dayjs from "dayjs";

import { cn } from "@acme/ui/lib/utils";

import type { DateType } from "../time-picker";
import { Button } from "../../button";

/**
 * Presentation options forwarded from a DatePicker's `showTime={{ ... }}`
 * config, mirroring how AntD passes `showTime` props to its internal TimePicker.
 */
export type TimeSelectOptions = {
  /** Time format controlling which columns render (e.g. "HH:mm" hides seconds). */
  format?: string;
  /** Hide (instead of just greying) options rejected by the disabled predicates. */
  hideDisabledOptions?: boolean;
  /** Show the "Now" footer button. Default true. */
  showNow?: boolean;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  /** 12-hour clock: hours show 12/1..11 and an AM/PM column is added. */
  use12Hours?: boolean;
};

type TimeSelectProperties = TimeSelectOptions & {
  value?: DateType;
  onChange?: (value: DateType) => void;
  onHoverChange?: (value?: DateType) => void;

  onOk?: () => void;
  onNow?: () => void;

  /** Render the "Now"/"Ok" footer. Set false to supply a shared footer outside. */
  showFooter?: boolean;
  /** Optional header (e.g. the selected time) shown above the columns. */
  header?: React.ReactNode;
  className?: string;
  disabledHours?: () => number[];
  disabledMinutes?: (selectedHour: number) => number[];
  disabledSeconds?: (selectedHour: number, selectedMinute: number) => number[];
  /** Grey out the "Now" footer button when the current time is itself disabled. */
  nowDisabled?: boolean;
};
export const TimeSelect = ({
  value,
  format = "HH:mm:ss",
  onChange,
  onHoverChange,
  onOk,
  onNow,
  showFooter = true,
  showNow = true,
  hourStep = 1,
  minuteStep = 1,
  secondStep = 1,
  header,
  className,
  disabledHours,
  disabledMinutes,
  disabledSeconds,
  hideDisabledOptions = false,
  nowDisabled = false,
  use12Hours = false,
}: TimeSelectProperties) => {
  const hourType = format.split(":")[0];
  // 12-hour helpers: the hour column shows 12/1..11 while values stay 24h.
  const meridiem: "AM" | "PM" =
    value && value.hour() >= 12 ? "PM" : "AM";
  const to12 = (h24: number) => (h24 % 12 === 0 ? 12 : h24 % 12);
  const from12 = (displayHour: number, mer: "AM" | "PM") => {
    const base = displayHour % 12; // 12 -> 0
    return mer === "PM" ? base + 12 : base;
  };
  const baseHourOptions = use12Hours
    ? [12, ...Array.from({ length: 11 }, (_, index) => index + 1)]
    : Array.from(
        { length: Math.ceil((hourType === "HH" ? 24 : 12) / hourStep) },
        (_, index) => index * hourStep,
      );
  const baseMinuteOptions = Array.from(
    { length: Math.ceil(60 / minuteStep) },
    (_, index) => index * minuteStep,
  );
  const baseSecondOptions = Array.from(
    { length: Math.ceil(60 / secondStep) },
    (_, index) => index * secondStep,
  );
  const showSeconds = format.split(":").length > 2;

  // Disabled time options (AntD `disabledTime` parity).
  const selectedHour = value?.hour();
  const selectedMinute = value?.minute();
  const disabledHourList = disabledHours?.() ?? [];
  const disabledMinuteList =
    selectedHour === undefined ? [] : (disabledMinutes?.(selectedHour) ?? []);
  const disabledSecondList =
    selectedHour === undefined || selectedMinute === undefined
      ? []
      : (disabledSeconds?.(selectedHour, selectedMinute) ?? []);

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
  const hourListReference = React.useRef<HTMLUListElement>(null);
  const minuteListReference = React.useRef<HTMLUListElement>(null);
  const secondListReference = React.useRef<HTMLUListElement>(null);

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

  // Scroll a column so the option at `baseIndex` (in the MIDDLE copy of the
  // tripled list) sits flush at the top. Scoped to the <ul> — sets the
  // container's own scrollTop instead of element.scrollIntoView, which walks up
  // and would also scroll the popover/modal ("stops mid-way"). Instant: a
  // "smooth" scroll fights the onScroll infinite-loop reset and stalls partway.
  // Landing in the middle set keeps scrollTop inside [0.5, 2.5]·set so the reset
  // does not immediately snap it and cause a visible jump.
  const scrollColumnToBaseIndex = React.useCallback(
    (
      reference: React.RefObject<HTMLUListElement | null>,
      baseLength: number,
      baseIndex: number,
    ) => {
      const container = reference.current;
      if (!container) return;
      const element = container.children[baseLength + Math.max(0, baseIndex)];
      if (element instanceof HTMLElement) {
        container.scrollTop +=
          element.getBoundingClientRect().top -
          container.getBoundingClientRect().top;
      }
    },
    [],
  );

  // On open, jump the columns to the selected value (or to 00 when empty).
  // useLayoutEffect so it lands before paint (no flash of the top of the list).
  React.useLayoutEffect(() => {
    if (!value) {
      scrollColumnToBaseIndex(hourListReference, baseHourOptions.length, 0);
      scrollColumnToBaseIndex(minuteListReference, baseMinuteOptions.length, 0);
      if (showSeconds)
        scrollColumnToBaseIndex(
          secondListReference,
          baseSecondOptions.length,
          0,
        );
      return;
    }

    // Use the value's INDEX in the base options (not the raw value) so 12h and
    // stepped columns land right.
    scrollColumnToBaseIndex(
      hourListReference,
      baseHourOptions.length,
      baseHourOptions.indexOf(use12Hours ? to12(value.hour()) : value.hour()),
    );
    scrollColumnToBaseIndex(
      minuteListReference,
      baseMinuteOptions.length,
      baseMinuteOptions.indexOf(value.minute()),
    );
    if (showSeconds)
      scrollColumnToBaseIndex(
        secondListReference,
        baseSecondOptions.length,
        baseSecondOptions.indexOf(value.second()),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // 'value' intentionally excluded: this runs once on open; clicks scroll via
    // their own onClick. Including it would re-jump the column on every
    // hover/change and fight the click scroll.
    showSeconds,
    baseHourOptions.length,
    baseMinuteOptions.length,
    baseSecondOptions.length,
  ]);
  return (
    <div
      className={cn("flex h-full min-h-[16rem] flex-col text-sm", className)}
    >
      {header !== undefined && (
        <div className="flex min-h-[3.5rem] items-center justify-center border-b px-3 font-medium">
          {header}
        </div>
      )}
      {/* relative/absolute so the scroll lists never inflate the panel:
          the panel stretches to the calendar height and the columns scroll
          within it. */}
      <div
        className="relative min-h-0 flex-1"
        style={{
          // 56px per column (+2px for column borders): hour, minute,
          // optionally second, optionally AM/PM.
          width:
            56 * (2 + (showSeconds ? 1 : 0) + (use12Hours ? 1 : 0)) + 2,
        }}
      >
        <div
          className="absolute inset-0 flex py-3"
          onMouseLeave={() => onHoverChange?.()}
        >
        <ul
          ref={hourListReference}
          className="flex w-14 min-h-0 flex-1 scrollbar-none flex-col gap-0.5 overflow-y-auto py-24 [&::-webkit-scrollbar]:hidden"
          onScroll={(e) => handleInfiniteScroll(e, baseHourOptions.length)}
        >
          {/* <ScrollArea className="h-[227px]"> */}
          {hourOptions.map((hour, index) => {
            // Tripled options already hold real values; no modulo (which would
            // corrupt stepped values, e.g. 15 % 4). In 12h mode `actualHour` is
            // the display hour (12/1..11) and `hour24` its 24h value.
            const actualHour = hour;
            const hour24 = use12Hours
              ? from12(actualHour, meridiem)
              : actualHour;
            const hourSelected = use12Hours
              ? value != null && to12(value.hour()) === actualHour
              : value?.hour() === actualHour;
            const hourDisabled = disabledHourList.includes(hour24);
            const setHour = () =>
              (value ?? dayjs().hour(0).minute(0).second(0).millisecond(0)).hour(
                hour24,
              );
            return (
              <li
                key={index}
                aria-disabled={hourDisabled || undefined}
                className={cn(
                  "mx-1 flex cursor-pointer justify-center rounded-sm py-1 transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  hourSelected && "bg-primary-200",
                  hourDisabled && "pointer-events-none opacity-30",
                  hourDisabled && hideDisabledOptions && "hidden",
                )}
                onMouseEnter={() => {
                  onHoverChange?.(setHour());
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={() => {
                  onChange?.(setHour());
                  scrollColumnToBaseIndex(
                    hourListReference,
                    baseHourOptions.length,
                    index % baseHourOptions.length,
                  );
                }}
              >
                {actualHour.toString().padStart(2, "0")}
              </li>
            );
          })}
          {/* </ScrollArea> */}
        </ul>
        <ul
          ref={minuteListReference}
          className="flex w-14 scrollbar-none flex-col gap-0.5 overflow-y-auto border-l py-24 [&::-webkit-scrollbar]:hidden"
          onScroll={(e) => handleInfiniteScroll(e, baseMinuteOptions.length)}
        >
          {minuteOptions.map((minute, index) => {
            const actualMinute = minute;
            return (
              <li
                key={index}
                aria-disabled={
                  disabledMinuteList.includes(actualMinute) || undefined
                }
                className={cn(
                  "mx-1 flex cursor-pointer justify-center rounded-sm py-1 transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  value?.minute() === actualMinute && "bg-primary-200",
                  disabledMinuteList.includes(actualMinute) &&
                    "pointer-events-none opacity-30",
                  disabledMinuteList.includes(actualMinute) &&
                    hideDisabledOptions &&
                    "hidden",
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
                onClick={() => {
                  const newDate = value
                    ? value.minute(actualMinute)
                    : dayjs()
                        .hour(0)
                        .minute(0)
                        .second(0)
                        .millisecond(0)
                        .minute(actualMinute);
                  onChange?.(newDate);
                  scrollColumnToBaseIndex(
                    minuteListReference,
                    baseMinuteOptions.length,
                    index % baseMinuteOptions.length,
                  );
                }}
              >
                {actualMinute.toString().padStart(2, "0")}
              </li>
            );
          })}
        </ul>
        {showSeconds && (
          <ul
            ref={secondListReference}
            className="flex w-14 min-h-0 scrollbar-none flex-col gap-0.5 overflow-y-auto border-l py-24 [&::-webkit-scrollbar]:hidden"
            onScroll={(e) => handleInfiniteScroll(e, baseSecondOptions.length)}
          >
            {secondOptions.map((second, index) => {
              const actualSecond = second;
              return (
                <li
                  key={index}
                  aria-disabled={
                    disabledSecondList.includes(actualSecond) || undefined
                  }
                  className={cn(
                    "mx-1 flex cursor-pointer justify-center rounded-sm py-1 transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    value?.second() === actualSecond && "bg-primary-200",
                    disabledSecondList.includes(actualSecond) &&
                      "pointer-events-none opacity-30",
                    disabledSecondList.includes(actualSecond) &&
                      hideDisabledOptions &&
                      "hidden",
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
                  onClick={() => {
                    const newDate = value
                      ? value.second(actualSecond)
                      : dayjs()
                          .hour(0)
                          .minute(0)
                          .second(0)
                          .millisecond(0)
                          .second(actualSecond);
                    onChange?.(newDate);
                    scrollColumnToBaseIndex(
                      secondListReference,
                      baseSecondOptions.length,
                      index % baseSecondOptions.length,
                    );
                  }}
                >
                  {actualSecond.toString().padStart(2, "0")}
                </li>
              );
            })}
          </ul>
        )}
        {use12Hours && (
          <ul className="flex w-14 min-h-0 flex-col gap-0.5 border-l">
            {(["AM", "PM"] as const).map((mer) => (
              <li
                key={mer}
                className={cn(
                  "mx-1 flex cursor-pointer justify-center rounded-sm py-1 transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  meridiem === mer && "bg-primary-200",
                )}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={() => {
                  const base =
                    value ??
                    dayjs().hour(0).minute(0).second(0).millisecond(0);
                  const h = base.hour();
                  const next =
                    mer === "AM" && h >= 12
                      ? base.hour(h - 12)
                      : mer === "PM" && h < 12
                        ? base.hour(h + 12)
                        : base;
                  onChange?.(next);
                }}
              >
                {mer}
              </li>
            ))}
          </ul>
        )}
        </div>
      </div>
      {showFooter && (
        <div className="flex justify-between border-t px-3 py-3">
          {showNow ? (
            <Button
              size="small"
              type="link"
              className="px-0"
              disabled={nowDisabled}
              onClick={() => onNow?.()}
            >
              Now
            </Button>
          ) : (
            <span />
          )}
          <Button size="small" type="primary" onClick={() => onOk?.()}>
            Ok
          </Button>
        </div>
      )}
    </div>
  );
};

export type { TimeSelectProperties as TimeSelectProps };
