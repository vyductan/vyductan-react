import type { IconProps as IconProperties } from "./icon-component";
import { Icon } from "./icon-component";

type ArrowDownFilledProperties = Omit<IconProperties, "icon">;
export const ArrowDownFilled = (properties: ArrowDownFilledProperties) => {
  return <Icon icon="mingcute:arrow-down-fill" {...properties} />;
};
