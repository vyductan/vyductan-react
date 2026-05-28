import type { IconProps as IconProperties } from "./icon-component";
import { Icon } from "./icon-component";

type EditIconProperties = Omit<IconProperties, "icon">;
export const InfoFilled = (properties: EditIconProperties) => {
  return (
    <Icon icon="icon-[pepicons-pop--info-circle-filled]" {...properties} />
  );
};
