import { forwardRef } from "react";

import { clsm } from "..";
import { useField } from "./useField";

const FieldDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { fieldDescriptionId } = useField();

  return (
    <div
      ref={ref}
      id={fieldDescriptionId}
      className={clsm("text-sm text-foreground-muted", className)}
      {...props}
    />
  );
});
FieldDescription.displayName = "FormDescription";

export { FieldDescription };
