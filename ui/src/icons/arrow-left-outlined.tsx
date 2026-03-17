import type { IconProps } from "./icon-component";
import { Icon } from "./icon-component";

type ArrowLeftOutlinedProps = Omit<IconProps, "icon">;
export const ArrowLeftOutlined = (props: ArrowLeftOutlinedProps) => {
  return <Icon icon="mingcute:arrow-left-fill" {...props} />;
};
