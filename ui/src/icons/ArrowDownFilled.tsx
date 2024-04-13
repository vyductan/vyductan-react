import type { IconProps } from "./Icon";
import { Icon } from "./Icon";

type ArrowDownFilledProps = Omit<IconProps, "icon">;
export const ArrowDownFilled = (props: ArrowDownFilledProps) => {
  return <Icon icon="mingcute:arrow-down-fill" {...props} />;
};
