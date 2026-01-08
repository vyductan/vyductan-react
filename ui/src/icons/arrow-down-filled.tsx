import type { IconProps } from "./icon-component";
import { Icon } from "./icon-component";

type ArrowDownFilledProps = Omit<IconProps, "icon">;
export const ArrowDownFilled = (props: ArrowDownFilledProps) => {
  return <Icon icon="mingcute:arrow-down-fill" {...props} />;
};
