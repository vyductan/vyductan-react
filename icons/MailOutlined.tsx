import { Icon, IconProps } from "./Icon";

type MailOutlinedProps = Omit<IconProps, "icon">;
export const MailOutlined = (props: MailOutlinedProps) => {
  return <Icon icon="mingcute:mail-line" {...props} />;
};
