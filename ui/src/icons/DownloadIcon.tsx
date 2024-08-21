import type { IconProps } from "./Icon";
import { Icon } from "./Icon";

type DownloadIconProps = Omit<IconProps, "icon">;
export const DownloadIcon = (props: DownloadIconProps) => {
  return <Icon icon="icon-[mingcute--download-2-fill]" {...props} />;
};
