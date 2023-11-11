import { Icon, IconProps } from "./Icon";

type ArrowDownFilledProps = Omit<IconProps, "icon">;
export const ArrowDownFilled = (props: ArrowDownFilledProps) => {
  return <Icon icon="mingcute:arrow-down-fill" {...props} />;
};
