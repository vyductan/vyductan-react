import type {
  AccordionMultipleProps,
  AccordionSingleProps,
} from "@radix-ui/react-accordion";

import type {
  AccordionContentProps,
  AccordionRootProps,
  AccordionTriggerProps,
} from "./_components";
import {
  AccordionContent,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
} from "./_components";

type CollapseItemDef = {
  key?: string;
  label: React.ReactNode;
  children: React.ReactNode;
};

type CollapseProps = Omit<
  AccordionRootProps,
  | "type"
  | "collapsible"
  | "value"
  | "defaultValue"
  | "onChange"
  | "onValueChange"
> & {
  activeKey?: string[];
  defaultActiveKey?: string[];
  items: CollapseItemDef[];
  type?: "single" | "multiple";
  triggerProps?: AccordionTriggerProps;
  contentProps?: AccordionContentProps;
  onChange?: (activeKeys: string[]) => void;
};
export const Collapse = ({
  activeKey,
  defaultActiveKey,
  items,
  type = "multiple",
  triggerProps,
  contentProps,
  onChange,
  ...props
}: CollapseProps) => {
  const singleOrMultipleProps =
    type === "single"
      ? ({
          type: "single",
          collapsible: true,
          value: activeKey?.[0],
          defaultValue: defaultActiveKey?.[0],
          onValueChange: (string) => {
            onChange?.([string]);
          },
        } satisfies AccordionSingleProps)
      : ({
          type: "multiple",
          onValueChange: (string) => {
            onChange?.(string);
          },
        } satisfies AccordionMultipleProps);
  return (
    <AccordionRoot {...singleOrMultipleProps} {...props}>
      {items.map((item, index) => {
        const key = item.key ?? index;
        return (
          <AccordionItem key={key} value={String(key)}>
            <AccordionTrigger {...triggerProps}>{item.label}</AccordionTrigger>
            <AccordionContent {...contentProps}>
              {item.children}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </AccordionRoot>
  );
};
