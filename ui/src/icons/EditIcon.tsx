import type { IconProps } from "./Icon";
import { Icon } from "./Icon";

type DeleteOutlinedProps = Omit<IconProps, "icon">;
export const EditIcon = (props: DeleteOutlinedProps) => {
  return <Icon icon="mingcute:edit-3-line" {...props} />;
};
