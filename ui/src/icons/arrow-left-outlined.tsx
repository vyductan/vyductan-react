import type { IconProps } from "./icon";
import { Icon } from "./icon";

type ArrowLeftOutlinedProps = Omit<IconProps, "icon">;
export const ArrowLeftOutlined = (props: ArrowLeftOutlinedProps) => {
  return <Icon icon="mingcute:arrow-left-fill" {...props} />;
};
