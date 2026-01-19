/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { XOR } from "ts-xor";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@acme/ui/lib/utils";

type SingleSliderProps = {
  range?: false;
  value: number;
  onChange?: (value: number) => void;
};
type RangeSliderProps = {
  range: true;
  value: [number, number];
  onChange?: (value: [number, number]) => void;
};
export type OwnSliderProps = XOR<SingleSliderProps, RangeSliderProps> & {
  ariaLabel?: string;
  className?: string;
};

export const InternalSlider = (props: OwnSliderProps) => {
  const {
    range,
    value: valueProps,
    onChange,
    ariaLabel,
    className,
    ...restProps
  } = props;

  const controlledValue = range ? valueProps : [valueProps];
  const onValueChange = range
    ? onChange
    : (val: number[]) => onChange?.(val[0]!);

  const thumbCount = Array.isArray(controlledValue)
    ? controlledValue.length
    : 1;

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      value={controlledValue as number[]}
      onValueChange={onValueChange as (value: number[]) => void}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className,
      )}
      {...restProps}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5",
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: thumbCount }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          aria-label={ariaLabel}
          className="border-primary ring-ring/50 block size-4 shrink-0 rounded-full border bg-white shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  );
};
