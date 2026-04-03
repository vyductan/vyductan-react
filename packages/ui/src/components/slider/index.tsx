import type { XOR } from "ts-xor";

import type { OwnSliderProps } from "./slider";
import { Slider as ShadcnSlider } from "../../shadcn/slider";
import { InternalSlider } from "./slider";

type ShadcnSliderProps = React.ComponentProps<typeof ShadcnSlider> & {
  ariaLabel?: string;
};
type SliderProps = XOR<OwnSliderProps, ShadcnSliderProps>;

const Slider = (props: SliderProps) => {
  const isShadcnSlider =
    "onValueChange" in props ||
    "defaultValue" in props ||
    Array.isArray(props.value);

  if (isShadcnSlider) {
    const { ariaLabel, ...rootProps } = props as ShadcnSliderProps;

    return <ShadcnSlider {...rootProps} aria-label={ariaLabel} />;
  }

  return <InternalSlider {...(props as OwnSliderProps)} />;
};

export type { SliderProps };
export { Slider };

export type { OwnSliderProps } from "./slider";
