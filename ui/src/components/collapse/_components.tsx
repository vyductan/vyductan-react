"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";

import { cn } from "@acme/ui/lib/utils";

import { Icon } from "../../icons";

type AccordionRootProps = React.ComponentProps<typeof AccordionPrimitive.Root>;
function AccordionRoot({ ...props }: AccordionRootProps) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b last:border-b-0", className)}
      {...props}
    />
  );
}

type AccordionTriggerProps = React.ComponentProps<
  typeof AccordionPrimitive.Trigger
> & {
  expandIconPosition?: "start" | "end";
};
function AccordionTrigger({
  className,
  children,

  expandIconPosition = "end",
  ...props
}: AccordionTriggerProps) {
  const expandIcon = (
    <Icon
      icon="icon-[lucide--chevron-down]"
      className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200"
    />
  );
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none",
          "hover:underline",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "disabled:pointer-events-none disabled:opacity-50",
          "[&[data-state=open]>svg]:rotate-180",

          // Own
          "[&[data-state=open]>span[role='img']]:rotate-180",
          expandIconPosition === "start" && "justify-start gap-3",
          className,
        )}
        {...props}
      >
        {expandIconPosition === "start" && expandIcon}
        {children}
        {expandIconPosition === "end" && expandIcon}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

type AccordionContentProps = React.ComponentProps<
  typeof AccordionPrimitive.Content
>;
function AccordionContent({
  className,
  children,
  ...props
}: AccordionContentProps) {
  // const Comp = as ?? "div";
  {
    /* <Comp className={cn(className)}>{children}</Comp> */
  }
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      // asChild
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export type {
  AccordionRootProps,
  AccordionContentProps,
  AccordionTriggerProps,
};
export { AccordionRoot, AccordionItem, AccordionTrigger, AccordionContent };
