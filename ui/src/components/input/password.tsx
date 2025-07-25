"use client";

import React from "react";

import type { InputProps } from "./input";
import type { InputRef } from "./types";
import { Icon } from "../../icons";
import { Input } from "./input";

export type InputPasswordProps = Omit<InputProps, "type">;
export const InputPassword = React.forwardRef<InputRef, InputPasswordProps>(
  (props, ref) => {
    const [type, setType] = React.useState("password");
    const toggle = () => setType(type === "password" ? "text" : "password");

    return (
      <Input
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
  },
);
InputPassword.displayName = "InputPassword";
