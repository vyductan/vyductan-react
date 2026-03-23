import type { IconProps } from "./icon-component";
import { Icon } from "./icon-component";

type MailOutlinedProps = Omit<IconProps, "icon">;
export const MailOutlined = (props: MailOutlinedProps) => {
  return <Icon icon="mingcute:mail-line" {...props} />;
};
