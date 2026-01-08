import type { IconProps } from "./icon-component";
import { Icon } from "./icon-component";

type CircleFilledProps = Omit<IconProps, "icon">;
export const CircleFilled = (props: CircleFilledProps) => {
  return <Icon icon="bi:circle-fill" {...props} />;
};
