import { Children, isValidElement } from "react";

import { cn } from "@acme/ui/lib/utils";

import {
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
} from "./_components";

type ShadcnDrawerProps = React.ComponentProps<typeof DrawerRoot>;
type DrawerProps = ShadcnDrawerProps & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  extra?: React.ReactNode;
  trigger?: React.ReactNode;
  footer?: React.ReactNode;

  className?: string;
  classNames?: {
    header?: string;
    title?: string;
    description?: string;
    content?: string;
    footer?: string;
  };
  placement?: ShadcnDrawerProps["direction"];
  /**
   * Width of the Drawer dialog. Number is treated as px.
   */
  width?: string | number;
  // closeIcon?: DrawerContentProps["closeIcon"];
};
const Drawer = ({
  title,
  description,
  children,
  extra,
  trigger,
  footer,
  className,
  classNames,
  placement = "right",
  width,
  // closeIcon,
  ...props
}: DrawerProps) => {
  const isShadcnDrawer = Children.toArray(children).some(
    (child) => isValidElement(child) && child.type === DrawerContent,
  );
  if (isShadcnDrawer)
    return (
      <DrawerRoot direction={placement} {...props}>
        {children}
      </DrawerRoot>
    );

  const contentStyle =
    width === undefined
      ? undefined
      : { width: typeof width === "number" ? `${width}px` : width };

  return (
    <DrawerRoot direction={placement} handleOnly {...props}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent className={cn(className)} style={contentStyle}>
        <div className="flex flex-1 flex-col overflow-hidden">
          <DrawerHeader className={cn(classNames?.header)} extra={extra}>
            <DrawerTitle className={classNames?.title}>{title}</DrawerTitle>
            <DrawerDescription
              className={cn(
                description ? "" : "hidden",
                classNames?.description,
              )}
            >
              {description}
            </DrawerDescription>
          </DrawerHeader>

          <div className={cn("flex-1 overflow-auto p-6", classNames?.content)}>
            {children}
          </div>

          {footer && (
            <DrawerFooter className={classNames?.footer}>{footer}</DrawerFooter>
          )}
        </div>
      </DrawerContent>
    </DrawerRoot>
  );
};

export type { DrawerProps };
export { Drawer };
