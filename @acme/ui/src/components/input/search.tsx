"use client";

import type React from "react";
import { useState } from "react";

import type { InputProps as InputProperties } from ".";
import type { InputRef as InputReference } from "./types";
import { Icon } from "../../icons";
import { Input } from "./input";

export type InputSearchProps = Omit<InputProperties, "type"> & {
  onSearch?: (value: string) => void;
  enterButton?: boolean;
};

export const InputSearch = ({
  onSearch,
  onChange,
  onPressEnter,
  onBlur,
  onFocus,
  value,
  defaultValue,
  ref,
  ...properties
}: InputSearchProps & { ref?: React.Ref<InputReference> }) => {
  const isControlled = value !== undefined;
  const [localValue, setLocalValue] = useState<string>(
    String(value ?? defaultValue ?? ""),
  );
  const [prevValue, setPrevValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  // Sync external → local only when not focused (IME-safe: avoid interrupting composition)
  if (isControlled && value !== prevValue) {
    setPrevValue(value);
    if (!isFocused) {
      setLocalValue(String(value ?? ""));
    }
  }

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setLocalValue(e.target.value);
    onChange?.(e);
  };

  const handleFocus: React.FocusEventHandler<HTMLInputElement> = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
    setIsFocused(false);
    onBlur?.(e);
    onSearch?.(localValue);
  };

  return (
    <Input
      ref={ref}
      value={isControlled ? localValue : undefined}
      defaultValue={isControlled ? undefined : defaultValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onPressEnter={(e) => {
        onPressEnter?.(e);
        onSearch?.(localValue);
      }}
      suffix={
        <span className="cursor-pointer" onClick={() => onSearch?.(localValue)}>
          <Icon icon="icon-[ant-design--search-outlined]" />
        </span>
      }
      {...properties}
    />
  );
};
InputSearch.displayName = "InputSearch";
