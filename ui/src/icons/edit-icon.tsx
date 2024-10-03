import type { IconProps } from "./icon";
import { Icon } from "./icon";

type EditIconProps = Omit<IconProps, "icon">;
export const EditIcon = (props: EditIconProps) => {
  return <Icon icon="icon-[uil--edit]" {...props} />;
};
