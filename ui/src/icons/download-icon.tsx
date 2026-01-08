import type { IconProps } from "./icon-component";
import { Icon } from "./icon-component";

type DownloadIconProps = Omit<IconProps, "icon">;
export const DownloadIcon = (props: DownloadIconProps) => {
  return <Icon icon="icon-[mingcute--download-2-fill]" {...props} />;
};
