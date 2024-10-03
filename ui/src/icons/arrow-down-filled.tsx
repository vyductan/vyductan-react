import type { IconProps } from "./icon";
import { Icon } from "./icon";

type ArrowDownFilledProps = Omit<IconProps, "icon">;
export const ArrowDownFilled = (props: ArrowDownFilledProps) => {
  return <Icon icon="mingcute:arrow-down-fill" {...props} />;
};
