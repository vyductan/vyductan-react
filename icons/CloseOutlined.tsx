import { Icon, IconProps } from "./Icon";

export const CloseOutlined = (props: Omit<IconProps, "icon">) => {
  return <Icon icon="mingcute:close-fill" {...props} />;
};
