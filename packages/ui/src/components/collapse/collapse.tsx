import { Accordion } from "radix-ui";

import type {
  AccordionContentProps as AccordionContentProperties,
  AccordionRootProps as AccordionRootProperties,
  AccordionTriggerProps as AccordionTriggerProperties,
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

  className?: string;
  classNames?: {
    header?: string;
    body?: string;
  };
};

type CollapseProperties = Omit<
  AccordionRootProperties,
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
  triggerProps?: AccordionTriggerProperties;
  contentProps?: AccordionContentProperties;
  onChange?: (activeKeys: string[]) => void;

  // antd
  expandIconPosition?: "start" | "end";
};
export const Collapse = ({
  activeKey,
  defaultActiveKey,
  items,
  type = "multiple",
  onChange,

  expandIconPosition,
  ...properties
}: CollapseProperties) => {
  const singleOrMultipleProperties =
    type === "single"
      ? ({
          type: "single",
          collapsible: true,
          value: activeKey?.[0],
          defaultValue: defaultActiveKey?.[0],
          onValueChange: (string) => {
            onChange?.([string]);
          },
        } satisfies Accordion.AccordionSingleProps)
      : ({
          type: "multiple",
          onValueChange: (string) => {
            onChange?.(string);
          },
        } satisfies Accordion.AccordionMultipleProps);
  return (
    <AccordionRoot {...singleOrMultipleProperties} {...properties}>
      {items.map((item, index) => {
        const key = item.key ?? index;
        return (
          <AccordionItem
            key={key}
            value={String(key)}
            className={item.className}
          >
            <AccordionTrigger
              expandIconPosition={expandIconPosition}
              className={item.classNames?.header}
            >
              {item.label}
            </AccordionTrigger>
            <AccordionContent className={item.classNames?.body}>
              {item.children}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </AccordionRoot>
  );
};
