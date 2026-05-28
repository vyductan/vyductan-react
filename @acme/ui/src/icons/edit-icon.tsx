import type { IconProps as IconProperties } from "./icon-component";
import { Icon } from "./icon-component";

type EditIconProperties = Omit<IconProperties, "icon">;
export const EditIcon = (properties: EditIconProperties) => {
  return <Icon icon="icon-[uil--edit]" {...properties} />;
};
