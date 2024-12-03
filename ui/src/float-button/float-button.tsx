import React, { useContext } from "react";

import type { BadgeProps } from "../badge";
import type { ButtonProps } from "../button";
import type { TooltipProps } from "../tooltip";
import type { FloatButtonElement } from "./types";
import { Badge } from "../badge";
import { Button } from "../button";
import { Tooltip } from "../tooltip";
import FloatButtonGroupContext from "./context";

export const floatButtonPrefixCls = "float-btn";

export type FloatButtonProps = ButtonProps & {
  className?: string;
  style?: React.CSSProperties;
  tooltip?: TooltipProps["title"];
  href?: string;
  target?: React.HTMLAttributeAnchorTarget;
  badge?: Omit<BadgeProps, "status" | "text" | "title" | "children">;
  ["aria-label"]?: React.HtmlHTMLAttributes<HTMLElement>["aria-label"];
};
export const FloatButton = React.forwardRef<
  FloatButtonElement,
  FloatButtonProps
>((props, ref) => {
  const {
    shape = "circle",
    tooltip,
    badge = {},

    ...restProps
  } = props;
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

  if ("badge" in props) {
    buttonNode = <Badge {...badge}>{buttonNode}</Badge>;
  }

  if ("tooltip" in props) {
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
});

if (process.env.NODE_ENV !== "production") {
  FloatButton.displayName = "FloatButton";
}
