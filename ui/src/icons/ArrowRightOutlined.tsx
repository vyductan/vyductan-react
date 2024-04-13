import type { IconProps } from "./Icon";
import { Icon } from "./Icon";

type ArrowRightOutlinedProps = Omit<IconProps, "icon">;
export const ArrowRightOutlined = (props: ArrowRightOutlinedProps) => {
  return <Icon icon="mingcute:arrow-right-fill" {...props} />;
};
