"use client";

import * as React from "react";

import { cn } from "@acme/ui/lib/utils";
import { FormLabel as ShadFormLabel } from "@acme/ui/shadcn/form";

import type { FormLayout } from "../types";
import { Label } from "../../label";

const FormLabel = ({
  className,
  layout = "vertical",
  required,
  children,
  asChild,
  ...props
}: React.ComponentProps<typeof ShadFormLabel> & {
  layout?: FormLayout;
  required?: boolean;
}) => {
  return (
    <ShadFormLabel
      className={cn(
        // layout === "vertical" ? "pb-2" : "",
        layout === "horizontal" ? "h-control w-6/24" : "",
        className,
      )}
      asChild
      {...props}
    >
      <Label required={required} asChild={asChild}>
        {children}
      </Label>
    </ShadFormLabel>
  );
};

export { FormLabel as FieldLabel, FormLabel };
