import type { IconProps } from "./Icon";
import { Icon } from "./Icon";

export const CloseOutlined = (props: Omit<IconProps, "icon">) => {
  return <Icon icon="mingcute:close-fill" {...props} />;
};
