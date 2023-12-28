import { Icon, IconProps } from "./Icon";

type ArrowRightOutlinedProps = Omit<IconProps, "icon">;
export const ArrowRightOutlined = (props: ArrowRightOutlinedProps) => {
  return <Icon icon="mingcute:arrow-right-fill" {...props} />;
};
