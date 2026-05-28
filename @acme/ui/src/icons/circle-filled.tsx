import type { IconProps as IconProperties } from "./icon-component";
import { Icon } from "./icon-component";

type CircleFilledProperties = Omit<IconProperties, "icon">;
export const CircleFilled = (properties: CircleFilledProperties) => {
  return <Icon icon="bi:circle-fill" {...properties} />;
};
