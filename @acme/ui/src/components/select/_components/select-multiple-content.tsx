import React from "react";

import { cn } from "@acme/ui/lib/utils";

import type { SelectValueType } from "../types";
import { inputInlineInsetClassName } from "../../input";
import { Tag } from "../../tag";

type SelectMultipleProps<TValue extends SelectValueType = SelectValueType> = {
  mode: "multiple" | "tags";
  open?: boolean;
  disabled?: boolean;
  selectedValues: TValue[];
  getTagLabel?: (value: TValue) => React.ReactNode;
  onRemove: (value: TValue) => void;
  placeholder?: string;
  onInputClick: (e: React.MouseEvent<HTMLInputElement>) => void;
  inputValue?: string;
  onInputValueChange?: (value: string) => void;
  onInputSubmit?: () => void;
  onInputBlur?: () => void;
  onInputKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};
export const SelectMultipleContent = <
  TValue extends SelectValueType = SelectValueType,
>({
  mode,
  open,
  disabled,
  selectedValues,
  getTagLabel,
  onRemove,
  placeholder,
  onInputClick,
  inputValue,
  onInputValueChange,
  onInputSubmit,
  onInputBlur,
  onInputKeyDown,
}: SelectMultipleProps<TValue>) => {
  const isTags = mode === "tags";
  const inputRef = React.useRef<HTMLInputElement>(null);
  const focusInput = () => {
    globalThis.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  React.useEffect(() => {
    if (isTags && open) {
      focusInput();
    }
  }, [isTags, open]);

  // Remove tag
  const removeTag = (tag: TValue) => {
    if (disabled) return;
    onRemove(tag);
  };

  // Handle input in tags mode
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      onInputSubmit?.();
    } else if (e.key === "Backspace" && !inputValue) {
      const lastValue = selectedValues.at(-1);
      if (lastValue) {
        removeTag(lastValue);
      }
    }
  };

  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
      {selectedValues.map((tag, index) => (
        <Tag
          key={index}
          className="mr-1 py-0 leading-[22px]"
          onClose={() => removeTag(tag)}
        >
          {getTagLabel?.(tag) ?? tag}
        </Tag>
      ))}
      {isTags && (
        <input
          ref={inputRef}
          disabled={disabled}
          className={cn(
            "pointer-events-auto relative z-10 m-0 h-[22px] min-w-[40px] flex-1 border-none bg-transparent p-0 text-sm outline-none disabled:pointer-events-none",
            selectedValues.length === 0 && inputInlineInsetClassName,
          )}
          value={inputValue ?? ""}
          onChange={(e) => onInputValueChange?.(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation();
            onInputKeyDown?.(e);
            if (!e.defaultPrevented) {
              handleInputKeyDown(e);
            }
          }}
          placeholder={selectedValues.length === 0 ? placeholder : ""}
          onMouseDown={(e) => {
            e.stopPropagation();
            if (disabled) return;
            inputRef.current?.focus();
          }}
          onFocus={() => {
            if (disabled) return;
            focusInput();
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (disabled) return;
            inputRef.current?.focus();
            onInputClick(e);
            focusInput();
          }}
          onBlur={() => {
            if (disabled) return;
            onInputBlur?.();
          }}
        />
      )}
      {!isTags && selectedValues.length === 0 && (
        <span className="text-muted-foreground text-sm">{placeholder}</span>
      )}
    </div>
  );
};
