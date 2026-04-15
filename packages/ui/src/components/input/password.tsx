"use client";

import React from "react";

import type { InputProps as InputProperties } from ".";
import type { InputRef as InputReference } from "./types";
import { Icon } from "../../icons";
import { Input } from "./input";

export type InputPasswordProps = Omit<InputProperties, "type">;
export const InputPassword = ({
  ref,
  ...properties
}: InputPasswordProps & { ref?: React.Ref<InputReference> }) => {
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
      {...properties}
    />
  );
};
InputPassword.displayName = "InputPassword";
