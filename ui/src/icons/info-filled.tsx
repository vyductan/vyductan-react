import type { IconProps } from "./icon";
import { Icon } from "./icon";

type EditIconProps = Omit<IconProps, "icon">;
export const InfoFilled = (props: EditIconProps) => {
  return <Icon icon="icon-[pepicons-pop--info-circle-filled]" {...props} />;
};
