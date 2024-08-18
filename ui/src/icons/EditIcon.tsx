import type { IconProps } from "./Icon";
import { Icon } from "./Icon";

type EditIconProps = Omit<IconProps, "icon">;
export const EditIcon = (props: EditIconProps) => {
  return <Icon icon="icon-[uil--edit]" {...props} />;
};
