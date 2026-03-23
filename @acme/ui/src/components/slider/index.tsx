import type { XOR } from "ts-xor";
import * as SliderPrimitive from "@radix-ui/react-slider";

import type { OwnSliderProps } from "./slider";
import { InternalSlider } from "./slider";

type ShadcnSliderProps = React.ComponentProps<typeof SliderPrimitive.Root> & {
  ariaLabel?: string;
};
type SliderProps = XOR<OwnSliderProps, ShadcnSliderProps>;

const Slider = (props: SliderProps) => {
  const isShadcnSlider = "onValueChange" in props && props.onValueChange;

  if (isShadcnSlider) {
    return <SliderPrimitive.Root {...(props as ShadcnSliderProps)} />;
  }

  return <InternalSlider {...(props as OwnSliderProps)} />;
};

export type { SliderProps };
export { Slider };

export type { OwnSliderProps } from "./slider";
