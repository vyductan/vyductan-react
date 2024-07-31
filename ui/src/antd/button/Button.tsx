import type { ButtonProps as AntdButtonProps } from "antd";
import type { ButtonType } from "antd/es/button";
import type { Ref } from "react";
import { forwardRef } from "react";
import { Button as AntdButton } from "antd";

type ButtonProps = Omit<AntdButtonProps, "type" | "htmlType"> & {
  type?: AntdButtonProps["htmlType"];
  variant?: "dashed" | "outline" | "text";
  primary?: boolean;
};
const Button = forwardRef(
  (
    { primary = true, variant: variantProp, type, ...props }: ButtonProps,
    ref: Ref<HTMLButtonElement | HTMLAnchorElement>,
  ) => {
    let variant = variantProp ? variantProp : primary ? "primary" : "default";
    if (variantProp === "outline") {
      variant = "default";
    }
    return (
      <AntdButton
        ref={ref}
        type={variant as ButtonType}
        htmlType={type}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export type { ButtonProps };
export { Button };
