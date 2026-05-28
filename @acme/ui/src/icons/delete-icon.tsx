import type { IconProps as IconProperties } from "./icon-component";
import { Icon } from "./icon-component";

type DeleteOutlinedProperties = Omit<IconProperties, "icon">;
export const DeleteIcon = (properties: DeleteOutlinedProperties) => {
  return <Icon icon="icon-[mingcute--delete-3-line]" {...properties} />;
};
