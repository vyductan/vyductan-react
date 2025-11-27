import type { ButtonProps } from "@/components/ui/button";
import React, { useContext } from "react";
import { Button } from "@/components/ui/button";

import type { TagWithCountProps } from "../tag/tag-with-count";
import type { TooltipProps } from "../tooltip";
import type { FloatButtonElement } from "./types";
import { TagWithCount } from "../tag/tag-with-count";
import { Tooltip } from "../tooltip";
import FloatButtonGroupContext from "./context";

export const floatButtonPrefixCls = "float-btn";

export type FloatButtonProps = ButtonProps & {
  className?: string;
  style?: React.CSSProperties;
  tooltip?: TooltipProps["title"];
  href?: string;
  target?: React.HTMLAttributeAnchorTarget;
  badge?: Omit<TagWithCountProps, "status" | "text" | "title" | "children">;
  ["aria-label"]?: React.HtmlHTMLAttributes<HTMLElement>["aria-label"];
};
export const FloatButton = ({
  shape = "circle",
  tooltip,
  badge = {},
  ref,
  ...restProps
}: FloatButtonProps & { ref?: React.Ref<FloatButtonElement> }) => {
  const groupShape = useContext(FloatButtonGroupContext);

  const mergeShape = groupShape ?? shape;

  // // 虽然在 ts 中已经 omit 过了，但是为了防止多余的属性被透传进来，这里再 omit 一遍，以防万一
  // const badgeProps = useMemo<FloatButtonBadgeProps>(
  //   () => omit(badge, ["title", "children", "status", "text"] as any[]),
  //   [badge],
  // );

  // const contentProps = useMemo<FloatButtonContentProps>(
  //   () => ({ prefixCls, description, icon, type }),
  //   [prefixCls, description, icon, type],
  // );

  let buttonNode = (
    <div>
      <Button ref={ref} shape={mergeShape} {...restProps} />
    </div>
  );

  if (badge && Object.keys(badge).length > 0) {
    buttonNode = <TagWithCount {...badge}>{buttonNode}</TagWithCount>;
  }

  if (tooltip) {
    buttonNode = <Tooltip title={tooltip}>{buttonNode}</Tooltip>;
  }

  return buttonNode;

  // return  props.href ? (
  //     <a ref={ref} {...restProps} className={classString}>
  //       {buttonNode}
  //     </a>
  //   ) : (
  //     <button ref={ref} {...restProps} className={classString} type="button">
  //       {buttonNode}
  //     </button>
  //   )
};

if (process.env.NODE_ENV !== "production") {
  FloatButton.displayName = "FloatButton";
}
