import type { IconProps } from "./icon-component";
import { Icon } from "./icon-component";

type EditIconProps = Omit<IconProps, "icon">;
export const EditIcon = (props: EditIconProps) => {
  return <Icon icon="icon-[uil--edit]" {...props} />;
};
