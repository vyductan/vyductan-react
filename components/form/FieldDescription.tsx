import { forwardRef } from "react";

import { clsm } from "@vyductan/utils";

import { useField } from "./useField";

const FieldDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { fieldDescriptionId } = useField();

  return (
    <p
      ref={ref}
      id={fieldDescriptionId}
      className={clsm("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});
FieldDescription.displayName = "FormDescription";

export { FieldDescription };
