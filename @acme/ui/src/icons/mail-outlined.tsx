import type { IconProps as IconProperties } from "./icon-component";
import { Icon } from "./icon-component";

type MailOutlinedProperties = Omit<IconProperties, "icon">;
export const MailOutlined = (properties: MailOutlinedProperties) => {
  return <Icon icon="mingcute:mail-line" {...properties} />;
};
