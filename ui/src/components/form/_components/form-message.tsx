"use client";

import { cn } from "@acme/ui/lib/utils";
import { FormMessage as ShadFormMessage } from "@acme/ui/shadcn/form";

function FormMessage({
  className,
  ...props
}: React.ComponentProps<typeof ShadFormMessage>) {
  return <ShadFormMessage className={cn("mb-1", className)} {...props} />;
}
export { FormMessage, FormMessage as FieldMessage };
