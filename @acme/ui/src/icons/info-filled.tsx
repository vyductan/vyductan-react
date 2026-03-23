import type { IconProps } from "./icon-component";
import { Icon } from "./icon-component";

type EditIconProps = Omit<IconProps, "icon">;
export const InfoFilled = (props: EditIconProps) => {
  return <Icon icon="icon-[pepicons-pop--info-circle-filled]" {...props} />;
};
