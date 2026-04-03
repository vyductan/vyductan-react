import type { IconProps } from "./icon-component";
import { Icon } from "./icon-component";

type DeleteOutlinedProps = Omit<IconProps, "icon">;
export const DeleteIcon = (props: DeleteOutlinedProps) => {
  return <Icon icon="icon-[mingcute--delete-3-line]" {...props} />;
};
