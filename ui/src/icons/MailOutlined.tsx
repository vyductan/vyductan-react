import type { IconProps } from "./Icon";
import { Icon } from "./Icon";

type MailOutlinedProps = Omit<IconProps, "icon">;
export const MailOutlined = (props: MailOutlinedProps) => {
  return <Icon icon="mingcute:mail-line" {...props} />;
};
