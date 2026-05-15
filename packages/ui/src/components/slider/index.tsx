import type { XOR } from "ts-xor";

import type { OwnSliderProps as OwnSliderProperties } from "./slider";
import { Slider as ShadcnSlider } from "../../shadcn/slider";
import { InternalSlider } from "./slider";

type ShadcnSliderProperties = React.ComponentProps<typeof ShadcnSlider> & {
  ariaLabel?: string;
};
type SliderProperties = XOR<OwnSliderProperties, ShadcnSliderProperties>;

const Slider = (properties: SliderProperties) => {
  const isShadcnSlider =
    "onValueChange" in properties ||
    "defaultValue" in properties ||
    Array.isArray(properties.value);

  if (isShadcnSlider) {
    const { ariaLabel, ...rootProperties } =
      properties as ShadcnSliderProperties;

    return <ShadcnSlider {...rootProperties} aria-label={ariaLabel} />;
  }

  return <InternalSlider {...(properties as OwnSliderProperties)} />;
};

export type { SliderProperties as SliderProps };
export { Slider };

export type { OwnSliderProps } from "./slider";
