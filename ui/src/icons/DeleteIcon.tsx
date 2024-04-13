import type { IconProps } from "./Icon";
import { Icon } from "./Icon";

type DeleteOutlinedProps = Omit<IconProps, "icon">;
export const DeleteIcon = (props: DeleteOutlinedProps) => {
  return <Icon icon="mingcute:delete-3-line" {...props} />;
};
