"use client";

import type React from "react";

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
  onPressEnter,
  ref,
  ...properties
}: InputSearchProps & { ref?: React.Ref<InputReference> }) => {
  const handleSearch = (currentValue?: string) => {
    if (!onSearch) return;
    const value = (properties.value ?? properties.defaultValue ?? "") as string;
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
      {...properties}
    />
  );
};
InputSearch.displayName = "InputSearch";
