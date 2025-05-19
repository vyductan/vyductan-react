import React from "react";

import { cn } from "@acme/ui/lib/utils";
import { FormItem as ShadFormItem } from "@acme/ui/shadcn/form";

import { FormItemContext } from "../context";

function FormItem({
  className,
  layout,
  ...props
}: React.ComponentProps<typeof ShadFormItem> & {
  layout?: "horizontal" | "vertical";
  error?: string;
}) {
  const id = React.useId();

  // check child has form-message component
  const hasFormMessage = React.Children.toArray(props.children).some(
    (child) =>
      React.isValidElement(child) &&
      typeof child.type === "string" &&
      child.type === "FormMessage",
  );

  return (
    <FormItemContext.Provider value={{ id }}>
      <ShadFormItem
        className={cn(
          layout === "horizontal" ? "flex" : "",
          hasFormMessage ? "" : "mb-6",
          className,
        )}
        {...props}
      />
    </FormItemContext.Provider>
  );
}

export { FormItem };
