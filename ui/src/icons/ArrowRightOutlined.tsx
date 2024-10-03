import type { IconProps } from "./icon";
import { Icon } from "./icon";

type ArrowRightOutlinedProps = Omit<IconProps, "icon">;
export const ArrowRightOutlined = (props: ArrowRightOutlinedProps) => {
  return <Icon icon="mingcute:arrow-right-fill" {...props} />;
};
