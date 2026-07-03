"use client";

import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { cva } from "class-variance-authority";
import { Tabs as TabsPrimitive } from "radix-ui";

import type { TooltipProps } from "../tooltip";
import { cn } from "@acme/ui/lib/utils";

import { Tooltip } from "../tooltip";

const segmentedVariants = cva(
  "inline-flex max-w-full items-center rounded-lg bg-muted p-[3px] text-muted-foreground",
  {
    variants: {
      block: {
        true: "flex w-full",
        false: "",
      },
    },
    defaultVariants: {
      block: false,
    },
  },
);

// size sizes the inner item (button), not the outer track — the track height
// is then intrinsic: item height + p-1 padding. h-5/h-7/h-9 = 20/28/36px.
const segmentedItemVariants = cva(
  "ring-offset-background focus-visible:ring-ring data-[state=active]:bg-background data-[state=active]:text-foreground inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm",
  {
    variants: {
      size: {
        default: "h-[26px] px-3 text-sm",
        sm: "h-[18px] px-2 text-xs",
        lg: "h-[34px] px-4 text-sm",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

const FADE_WIDTH = "1.5rem";

function getMaskImage(left: boolean, right: boolean): string | undefined {
  if (left && right) {
    return `linear-gradient(to right, transparent, #000 ${FADE_WIDTH}, #000 calc(100% - ${FADE_WIDTH}), transparent)`;
  }
  if (right) {
    return `linear-gradient(to right, #000 calc(100% - ${FADE_WIDTH}), transparent)`;
  }
  if (left) {
    return `linear-gradient(to right, transparent, #000 ${FADE_WIDTH})`;
  }
  return undefined;
}

export interface SegmentedOption {
  label?: React.ReactNode;
  value: string;
  disabled?: boolean;
  /** Display icon for the segmented item, rendered before the label. */
  icon?: React.ReactNode;
  /** Additional css class applied to the segmented item trigger. */
  className?: string;
  /** Tooltip shown on hover; a string is used as the tooltip title. */
  tooltip?: string | TooltipProps;
}

export interface SegmentedProps
  extends
    Omit<
      React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>,
      "value" | "defaultValue" | "onValueChange" | "onChange"
    >,
    VariantProps<typeof segmentedVariants>,
    VariantProps<typeof segmentedItemVariants> {
  options: (string | number | SegmentedOption)[];
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

function stringifyValue(
  value: string | number | undefined,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return String(value);
}

function normalizeOption(
  option: string | number | SegmentedOption,
): SegmentedOption {
  if (typeof option === "string" || typeof option === "number") {
    const value = String(option);

    return { label: value, value };
  }

  return { ...option, value: String(option.value) };
}

const Segmented = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  SegmentedProps
>(
  (
    {
      className,
      size,
      block,
      options,
      value,
      defaultValue,
      onChange,
      disabled,
      ...properties
    },
    reference,
  ) => {
    const normalizedOptions = options.map((option) => normalizeOption(option));

    const listRef = React.useRef<HTMLDivElement>(null);
    const [fade, setFade] = React.useState({ left: false, right: false });

    React.useEffect(() => {
      const element = listRef.current;
      if (!element) {
        return;
      }

      const update = () => {
        const { scrollLeft, scrollWidth, clientWidth } = element;
        setFade({
          left: scrollLeft > 0,
          right: Math.ceil(scrollLeft + clientWidth) < scrollWidth,
        });
      };

      update();
      element.addEventListener("scroll", update, { passive: true });
      const observer = new ResizeObserver(update);
      observer.observe(element);

      return () => {
        element.removeEventListener("scroll", update);
        observer.disconnect();
      };
    }, [normalizedOptions.length]);

    const maskImage = getMaskImage(fade.left, fade.right);

    return (
      <TabsPrimitive.Root
        ref={reference}
        data-slot="segmented"
        value={stringifyValue(value)}
        defaultValue={stringifyValue(defaultValue)}
        onValueChange={onChange}
        {...properties}
      >
        <div
          data-slot="segmented-track"
          className={cn(segmentedVariants({ block }), className)}
        >
          <TabsPrimitive.List
            ref={listRef}
            data-slot="segmented-list"
            className="-my-1 flex w-full items-center overflow-x-auto py-1 scrollbar-none [&::-webkit-scrollbar]:hidden"
            style={
              maskImage
                ? { maskImage, WebkitMaskImage: maskImage }
                : undefined
            }
          >
            {normalizedOptions.map((option) => {
              const trigger = (
                <TabsPrimitive.Trigger
                  value={option.value}
                  data-slot="segmented-item"
                  disabled={disabled || option.disabled}
                  className={cn(
                    segmentedItemVariants({ size }),
                    block ? "flex-1" : "shrink-0",
                    option.className,
                  )}
                >
                  {option.icon ? (
                    <span className="inline-flex items-center">
                      {option.icon}
                    </span>
                  ) : null}
                  {option.label}
                </TabsPrimitive.Trigger>
              );

              if (option.tooltip) {
                const tooltipProps =
                  typeof option.tooltip === "string"
                    ? { title: option.tooltip }
                    : option.tooltip;

                return (
                  <Tooltip key={option.value} {...tooltipProps}>
                    {trigger}
                  </Tooltip>
                );
              }

              return (
                <React.Fragment key={option.value}>{trigger}</React.Fragment>
              );
            })}
          </TabsPrimitive.List>
        </div>
      </TabsPrimitive.Root>
    );
  },
);
Segmented.displayName = "Segmented";

export { Segmented };
