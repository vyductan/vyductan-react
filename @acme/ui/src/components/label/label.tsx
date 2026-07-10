import { Slot } from "radix-ui";

import { cn } from "../../lib/utils";
import type { Label as ShadLabel } from "../../shadcn/label";

// Base classes mirror ../../shadcn/label but with select-none -> select-text so
// double-click selects the label text. Keep in sync if the shadcn CLI updates
// that file. gap-0 overrides the shadcn gap-2 default for this wrapper.
const labelClassName =
  "flex items-center gap-0 text-sm leading-none font-medium select-text group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50";

const Label = ({
  className,
  children,
  required,
  colon,
  asChild,
  ...properties
}: React.ComponentProps<typeof ShadLabel> & {
  required?: boolean;
  colon?: boolean;
}) => {
  // Slot.Root (not Radix ShadLabel) so asChild merges props onto the consumer's
  // element without Radix's onMouseDown block on double-click text selection.
  if (asChild) {
    return (
      <Slot.Root
        data-slot="label"
        className={cn(labelClassName, className)}
        {...properties}
      >
        {children}
      </Slot.Root>
    );
  }
  // Native <label> instead of Radix ShadLabel: Radix blocks double-click text
  // selection via onMouseDown preventDefault (detail > 1). Native allows it.
  return (
    <label
      data-slot="label"
      className={cn(labelClassName, className)}
      {...properties}
    >
      {children}
      {colon && ":"}
      {required && <span className="ml-1 text-red-600">*</span>}
    </label>
  );
};

export { Label };
