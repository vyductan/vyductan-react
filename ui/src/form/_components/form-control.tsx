import React from "react";

import { GenericSlot } from "../../slot";
import { useFormField } from "../use-field";

const FormControl = React.forwardRef<
  React.ElementRef<typeof GenericSlot>,
  React.ComponentPropsWithoutRef<typeof GenericSlot>
>(({ ...props }, ref: React.Ref<HTMLElement>) => {
  const {
    error,
    fieldId,
    fieldDescriptionId: formDescriptionId,
    fieldMessageId: formMessageId,
  } = useFormField();

  return (
    <GenericSlot
      ref={ref}
      id={fieldId}
      aria-describedby={
        error ? `${formDescriptionId} ${formMessageId}` : `${formDescriptionId}`
      }
      aria-invalid={!!error}
      status={error ? "error" : "default"}
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

export { FormControl };
