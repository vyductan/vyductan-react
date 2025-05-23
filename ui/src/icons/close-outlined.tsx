import type { IconProps } from "./icon";
import { Icon } from "./icon";

export const CloseOutlined = (props: Omit<IconProps, "icon">) => {
  return <Icon icon="icon-[mingcute--close-fill]" {...props} />;
};
