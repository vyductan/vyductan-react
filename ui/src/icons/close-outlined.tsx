import type { IconProps } from "./icon-component";
import { Icon } from "./icon-component";

export const CloseOutlined = (props: Omit<IconProps, "icon">) => {
  return <Icon icon="icon-[mingcute--close-fill]" {...props} />;
};
