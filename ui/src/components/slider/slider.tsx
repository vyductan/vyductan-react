import type { XOR } from "ts-xor";

import { Slider as SliderShadcn } from "@acme/ui/shadcn/slider";

type ShadcnSliderProps = React.ComponentProps<typeof SliderShadcn>;
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
type OwnProps = XOR<SingleSliderProps, RangeSliderProps>;

type SliderProps = XOR<ShadcnSliderProps, OwnProps>;

const Slider = (props: SliderProps) => {
  const isShadcnSlider = props.onValueChange;
  if (isShadcnSlider) {
    return <SliderShadcn {...props} />;
  }

  const {
    range,
    value: valueProps,
    onChange,
    ...restProps
  } = props as OwnProps;

  const value = range ? valueProps : [valueProps];
  const onValueChange = range
    ? onChange
    : (value: number[]) => onChange?.(value[0]!);

  return (
    <SliderShadcn value={value} onValueChange={onValueChange} {...restProps} />
  );
};

export { Slider };
