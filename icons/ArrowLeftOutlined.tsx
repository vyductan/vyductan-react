import { Icon, IconProps } from "./Icon";

type ArrowLeftOutlinedProps = Omit<IconProps, "icon">;
export const ArrowLeftOutlined = (props: ArrowLeftOutlinedProps) => {
  return <Icon icon="mingcute:arrow-left-fill" {...props} />;
};
