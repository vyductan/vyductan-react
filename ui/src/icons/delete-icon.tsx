import type { IconProps } from "./icon";
import { Icon } from "./icon";

type DeleteOutlinedProps = Omit<IconProps, "icon">;
export const DeleteIcon = (props: DeleteOutlinedProps) => {
  return <Icon icon="icon-[mingcute--delete-3-line]" {...props} />;
};
