import type { IconProps } from "./icon";
import { Icon } from "./icon";

type CheckFilledProps = Omit<IconProps, "icon">;
export const CheckFilled = (props: CheckFilledProps) => {
  return <Icon icon="icon-[mingcute--check-fill]" {...props} />;
};
