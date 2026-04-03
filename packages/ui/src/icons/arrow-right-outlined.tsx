import type { IconProps } from "./icon-component";
import { Icon } from "./icon-component";

type ArrowRightOutlinedProps = Omit<IconProps, "icon">;
export const ArrowRightOutlined = (props: ArrowRightOutlinedProps) => {
  return <Icon icon="icon-[mingcute--arrow-right-fill]" {...props} />;
};
