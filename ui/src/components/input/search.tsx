"use client";

import React from "react";

import type { InputProps } from "./input";
import type { InputRef } from "./types";
import { Icon } from "../../icons";
import { Input } from "./input";

export type InputSearchProps = Omit<InputProps, "type"> & {
  onSearch?: (value: string) => void;
  enterButton?: boolean;
};

export const InputSearch = ({
  onSearch,
  onPressEnter,
  ref,
  ...props
}: InputSearchProps & { ref?: React.Ref<InputRef> }) => {
  const handleSearch = (currentValue?: string) => {
    if (!onSearch) return;
    const value = (props.value ?? props.defaultValue ?? "") as string;
    onSearch(currentValue ?? value);
  };

  return (
    <Input
      ref={ref}
      type="search"
      onPressEnter={(e) => {
        onPressEnter?.(e);
        handleSearch((e.target as HTMLInputElement | undefined)?.value);
      }}
      suffix={
        <span className="cursor-pointer" onClick={() => handleSearch()}>
          <Icon icon="icon-[ant-design--search-outlined]" />
        </span>
      }
      {...props}
    />
  );
};
InputSearch.displayName = "InputSearch";
