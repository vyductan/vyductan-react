import { Children, isValidElement } from "react";

import { cn } from "@acme/ui/lib/utils";

import type { DrawerRootProps } from "../../shadcn/drawer";
import {
  DrawerContent,
  DrawerDescription,
  Drawer as DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
} from "../../shadcn/drawer";
import { DrawerHeader } from "./_component";

type DrawerProps = DrawerRootProps & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  extra?: React.ReactNode;
  trigger?: React.ReactNode;

  className?: string;
  classNames?: {
    header?: string;
    title?: string;
    description?: string;
    content?: string;
  };
  placement?: DrawerRootProps["direction"];
  // closeIcon?: DrawerContentProps["closeIcon"];
};
const Drawer = ({
  title,
  description,
  children,
  extra,
  trigger,

  className,
  classNames,
  placement = "right",
  // closeIcon,
  ...props
}: DrawerProps) => {
  const isShadcn = Children.toArray(children).some((child) => {
    if (isValidElement(child)) {
      const type =
        typeof child.type === "string" ? child.type : child.type.name;
      return type === "DrawerContent";
    }
    return false;
  });
  if (isShadcn)
    return (
      <DrawerRoot direction={placement} {...props}>
        {children}
      </DrawerRoot>
    );

  return (
    <DrawerRoot direction={placement} {...props}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent className={cn(className)}>
        <DrawerHeader className={cn(classNames?.header)} extra={extra}>
          <DrawerTitle className={classNames?.title}>{title}</DrawerTitle>
          <DrawerDescription
            className={cn(description ? "" : "hidden", classNames?.description)}
          >
            {description}
          </DrawerDescription>
        </DrawerHeader>

        <div className={cn("overflow-auto p-6", classNames?.content)}>
          {children}
        </div>
      </DrawerContent>
    </DrawerRoot>
  );
};

export type { DrawerProps };
export { Drawer };
