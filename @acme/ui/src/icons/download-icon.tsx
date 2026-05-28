import type { IconProps as IconProperties } from "./icon-component";
import { Icon } from "./icon-component";

type DownloadIconProperties = Omit<IconProperties, "icon">;
export const DownloadIcon = (properties: DownloadIconProperties) => {
  return <Icon icon="icon-[mingcute--download-2-fill]" {...properties} />;
};
