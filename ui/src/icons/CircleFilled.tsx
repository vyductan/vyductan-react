import type { IconProps } from "./Icon";
import { Icon } from "./Icon";

type CircleFilledProps = Omit<IconProps, "icon">;
export const CircleFilled = (props: CircleFilledProps) => {
  return <Icon icon="bi:circle-fill" {...props} />;
};
