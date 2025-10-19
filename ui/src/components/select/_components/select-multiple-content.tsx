import { useState } from "react";

import type { SelectValueType } from "../types";
import { Tag } from "../../tag";

type SelectMultipleProps<TValue extends SelectValueType = SelectValueType> = {
  mode: "multiple" | "tags";
  selectedValues: TValue[];
  // onChange: (values: TValue[]) => void

  onAdd: (value: TValue) => void;
  onRemove: (value: TValue) => void;

  placeholder?: string;

  onInputClick: (e: React.MouseEvent<HTMLInputElement>) => void;
};
export const SelectMultipleContent = <
  TValue extends SelectValueType = SelectValueType,
>({
  mode,
  selectedValues,
  onAdd,
  onRemove,
  placeholder,

  onInputClick,
}: SelectMultipleProps<TValue>) => {
  const [inputValue, setInputValue] = useState("");

  const isTags = mode === "tags";

  // Add custom tag in tags mode
  const addTag = (tag: TValue) => {
    if (!tag || selectedValues.includes(tag)) return;
    // const newValues = [...value, tag];
    // onChange(newValues);
    setInputValue("");
    onAdd(tag);
  };

  // Remove tag
  const removeTag = (tag: TValue) => {
    onRemove(tag);
  };

  // Handle input in tags mode
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = inputValue.trim();
      if (tag) addTag(tag as TValue);
    } else if (e.key === "Backspace" && !inputValue) {
      const lastValue = selectedValues.at(-1);
      if (lastValue) {
        removeTag(lastValue);
      }
    }
  };

  return (
    <div className="flex flex-wrap">
      {selectedValues.map((tag, index) => (
        <Tag
          key={index}
          className="mr-1 py-0 leading-[22px]"
          onClose={() => removeTag(tag)}
        >
          {tag}
        </Tag>
      ))}
      {isTags && (
        <input
          className="m-0 min-w-[40px] border-none bg-transparent p-0 text-xs outline-none"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder={selectedValues.length === 0 ? placeholder : ""}
          onClick={(e) => {
            e.stopPropagation();
            onInputClick(e);
          }}
        />
      )}
      {!isTags && selectedValues.length === 0 && (
        <span className="text-muted-foreground text-sm">{placeholder}</span>
      )}
    </div>
  );
};
