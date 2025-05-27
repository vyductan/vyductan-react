import React, { useEffect, useRef } from "react";
import { useComposeRef } from "@rc-component/util";

import { cn } from "@acme/ui/lib/utils";
import { FormItem as ShadFormItem } from "@acme/ui/shadcn/form";

function FormItem({
  ref: __ref,
  className,
  layout,
  children,
  ...props
}: React.ComponentProps<typeof ShadFormItem> & {
  layout?: "horizontal" | "vertical";
  error?: string;
}) {
  const internalRef = useRef<HTMLDivElement>(null);
  const composedRef = useComposeRef<HTMLDivElement | null>(
    internalRef,
    ...(__ref ? [__ref] : []),
  );
  // get child id (from shadcn FormItem id)
  const id = internalRef.current?.id;

  // check child has form-message component
  // const divChild = React.Children.toArray(children).find(
  //   (child) =>
  //     React.isValidElement<{ "data-slot": string; children: React.ReactNode }>(
  //       child,
  //     ) && child.props["data-slot"] === "form-item-control",
  // );

  // const hasFormMessage =
  //   divChild &&
  //   React.isValidElement<{ children: React.ReactNode }>(divChild) &&
  //   React.Children.toArray(divChild.props.children).some((child) => {
  //     if (React.isValidElement<{ children?: React.ReactNode }>(child)) {
  //       const type =
  //         typeof child.type === "string" ? child.type : child.type.name;
  //       // console.log("child", child, index, child);
  //       if (type === "FormMessage") {
  //         console.log(
  //           "child - form message",
  //           child,
  //           React.Children.toArray(child.props.children),
  //         );
  //       }
  //       return type === "FormMessage" && !!child.props.children;
  //     }
  //     return false;
  //   });

  const [hasFormMessage, setHasFormMessage] = React.useState(false);
  useEffect(() => {
    const formMessageElement = document.querySelector(
      `#${id}-form-item-message`,
    );
    if (formMessageElement) {
      setHasFormMessage(true);
    }
  }, [children, id]);

  return (
    <ShadFormItem
      className={cn(
        "flex", // to set form-item-control height fit with content
        layout === "horizontal" ? "flex-row" : "flex-col",
        // hasFormMessage ? "" : "mb-6",
        "mb-6",
        className,
      )}
      ref={composedRef}
      {...props}
    >
      {children}
      {hasFormMessage && <div className="-mb-6" />}
    </ShadFormItem>
  );
  // return (
  //   <FormItemContext.Provider value={{ id }}>
  //     <ShadFormItem
  //       className={cn(
  //         "flex", // to set form-item-control height fit with content
  //         layout === "horizontal" ? "flex-row" : "flex-col",
  //         // hasFormMessage ? "" : "mb-6",
  //         "mb-6",
  //         className,
  //       )}
  //       ref={ref}
  //       {...props}
  //     >
  //       {children}
  //       {hasFormMessage && <div className="-mb-6" />}
  //     </ShadFormItem>
  //   </FormItemContext.Provider>
  // );
}

export { FormItem };
