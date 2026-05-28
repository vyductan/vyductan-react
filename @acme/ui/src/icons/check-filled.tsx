import type { IconProps as IconProperties } from "./icon-component";
import { Icon } from "./icon-component";

type CheckFilledProperties = Omit<IconProperties, "icon">;
export const CheckFilled = (properties: CheckFilledProperties) => {
  return <Icon icon="icon-[mingcute--check-fill]" {...properties} />;
};
