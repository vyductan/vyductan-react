import { cn } from "@acme/ui";

import type { ComponentPickerOption } from "./types";

export const ComponentPickerMenuItem = ({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: ComponentPickerOption;
}) => {
  return (
    <li
      key={option.key}
      tabIndex={-1}
      className={cn(
        "flex items-center gap-2 rounded-sm p-2",
        isSelected && "bg-gray-200",
      )}
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ref={option.setRefElement}
      role="option"
      aria-selected={isSelected}
      id={"typeahead-item-" + index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      aria-hidden="true"
    >
      {option.icon}
      <span>{option.title}</span>
    </li>
  );
};
