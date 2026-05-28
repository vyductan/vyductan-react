import type { IconProps as IconProperties } from "./icon-component";
import { Icon } from "./icon-component";

export const CloseOutlined = (properties: Omit<IconProperties, "icon">) => {
  return <Icon icon="icon-[mingcute--close-fill]" {...properties} />;
};
