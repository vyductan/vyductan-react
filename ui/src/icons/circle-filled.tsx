import type { IconProps } from "./icon";
import { Icon } from "./icon";

type CircleFilledProps = Omit<IconProps, "icon">;
export const CircleFilled = (props: CircleFilledProps) => {
  return <Icon icon="bi:circle-fill" {...props} />;
};
