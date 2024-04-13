import type * as LabelPrimitive from "@radix-ui/react-label";
import * as React from "react";

import { clsm } from "@acme/ui";

import { Label } from "../label";
import { useField } from "./useField";

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, fieldId } = useField();

  return (
    <Label
      ref={ref}
      className={clsm(error && "text-destructive", className)}
      htmlFor={fieldId}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

export { FormLabel };
