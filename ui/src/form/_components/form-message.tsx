"use client";

import { cn } from "../..";
import { useFormField } from "../hooks/use-form-field";

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error.message ?? "") : props.children;

  if (!body) {
    return <></>;
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn(
        "text-destructive text-sm font-medium",
        // own
        "mb-1",
        className,
      )}
      {...props}
    >
      {body}
    </p>
  );
}
export { FormMessage, FormMessage as FieldMessage };
