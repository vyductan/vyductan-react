import type { IconProps } from "./icon";
import { Icon } from "./icon";

type MailOutlinedProps = Omit<IconProps, "icon">;
export const MailOutlined = (props: MailOutlinedProps) => {
  return <Icon icon="mingcute:mail-line" {...props} />;
};
