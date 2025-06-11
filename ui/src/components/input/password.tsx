"use client";

import React from "react";

import type { InputTextProps } from "./text";
import { Icon } from "../../icons";
import { InputText } from "./text";

export type InputPasswordProps = Omit<InputTextProps, "type">;
export const InputPassword = React.forwardRef<
  HTMLInputElement,
  InputPasswordProps
>((props, ref) => {
  const [type, setType] = React.useState("password");
  const toggle = () => setType(type === "password" ? "text" : "password");

  return (
    <InputText
      ref={ref}
      type={type}
      suffix={
        <span className="cursor-pointer">
          {type === "password" ? (
            <Icon
              icon="icon-[ant-design--eye-invisible-outlined]"
              onClick={toggle}
            />
          ) : (
            <Icon icon="icon-[ant-design--eye-outlined]" onClick={toggle} />
          )}
        </span>
      }
      {...props}
    />
  );
});
InputPassword.displayName = "InputPassword";
