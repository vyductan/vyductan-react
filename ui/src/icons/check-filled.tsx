import type { IconProps } from "./icon-component";
import { Icon } from "./icon-component";

type CheckFilledProps = Omit<IconProps, "icon">;
export const CheckFilled = (props: CheckFilledProps) => {
  return <Icon icon="icon-[mingcute--check-fill]" {...props} />;
};
