import type { IconProps as IconProperties } from "./icon-component";
import { Icon } from "./icon-component";

type ArrowRightOutlinedProperties = Omit<IconProperties, "icon">;
export const ArrowRightOutlined = (
  properties: ArrowRightOutlinedProperties,
) => {
  return <Icon icon="icon-[mingcute--arrow-right-fill]" {...properties} />;
};
