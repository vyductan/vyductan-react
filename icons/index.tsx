export * from "./CheckOutlined";
export * from "./ChevronRightOutlined";
export * from "./CircleOutlined";
export { default as CloseOutlined } from "./CloseOutlined";
export * from "./LogoutOutlined";
export * from "./UserOutlined";
export { default as WarningFilled } from "./WarningFilled";

import { Icon as Iconify, IconProps as IconifyProps } from "@iconify/react";
import { clsm } from "@vyductan/utils";

type IconProps = IconifyProps;
export const Icon = ({ className, ...props }: IconProps) => {
  return <Iconify className={clsm("w-5 h-5", className)} {...props} />;
};
