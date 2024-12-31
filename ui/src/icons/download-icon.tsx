import type { IconProps } from "./icon";
import { Icon } from "./icon";

type DownloadIconProps = Omit<IconProps, "icon">;
export const DownloadIcon = (props: DownloadIconProps) => {
  return <Icon icon="icon-[mingcute--download-2-fill]" {...props} />;
};
