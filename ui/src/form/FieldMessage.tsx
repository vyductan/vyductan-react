import type { HTMLAttributes } from "react";
import { forwardRef } from "react";

import { clsm } from "@acme/ui";

import { useField } from "./useField";

const FieldMessage = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, fieldMessageId } = useField();
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={fieldMessageId}
      className={clsm("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  );
});
FieldMessage.displayName = "FormMessage";

export { FieldMessage };
