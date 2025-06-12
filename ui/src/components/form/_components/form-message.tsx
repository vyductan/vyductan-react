"use client";

import { tv } from "tailwind-variants";

import { cn } from "@acme/ui/lib/utils";
import { FormMessage as ShadFormMessage } from "@acme/ui/shadcn/form";

const validateStatusVariants = tv({
  base: "",
  variants: {
    validateStatus: {
      default: "text-gray-500",
      success: "text-green-500",
      warning: "text-yellow-500",
      error: "text-red-500",
      validating: "text-blue-500",
    },
  },
});
function FormMessage({
  className,
  validateStatus,
  ...props
}: React.ComponentProps<typeof ShadFormMessage> & {
  validateStatus?: "success" | "warning" | "error" | "validating" | "default";
}) {
  return (
    <ShadFormMessage
      className={cn(
        "mb-1",
        validateStatusVariants({ validateStatus }),
        className,
      )}
      {...props}
    />
  );
}
export { FormMessage, FormMessage as FieldMessage };
