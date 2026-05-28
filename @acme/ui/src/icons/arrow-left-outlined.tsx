import type { IconProps as IconProperties } from "./icon-component";
import { Icon } from "./icon-component";

type ArrowLeftOutlinedProperties = Omit<IconProperties, "icon">;
export const ArrowLeftOutlined = (properties: ArrowLeftOutlinedProperties) => {
  return <Icon icon="mingcute:arrow-left-fill" {...properties} />;
};
