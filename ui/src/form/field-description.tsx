import { forwardRef } from "react";

import { cn } from "..";
import { useField } from "./use-field";

const FieldDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { fieldDescriptionId } = useField();

  return (
    <div
      ref={ref}
      id={fieldDescriptionId}
      className={cn("text-sm text-foreground-muted", className)}
      {...props}
    />
  );
});
FieldDescription.displayName = "FormDescription";

export { FieldDescription, FieldDescription as FormDescription };
