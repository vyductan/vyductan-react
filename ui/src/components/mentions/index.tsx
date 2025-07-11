import type { Variant } from "../config-provider";
import type { InputStatus } from "../input";
import type { DataDrivenOptionProps as MentionsOptionProps } from "./types";

export interface MentionProps {
  rootClassName?: string;
  loading?: boolean;
  status?: InputStatus;
  options?: MentionsOptionProps[];
  popupClassName?: string;
  /**
   * @since 5.13.0
   * @default "outlined"
   */
  variant?: Variant;
}

export type MentionsProps = MentionProps;
