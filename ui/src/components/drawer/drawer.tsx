import { Children, isValidElement } from "react";

import { cn } from "@acme/ui/lib/utils";

import { Icon } from "../../icons";
import { Button } from "../button";
import {
  DrawerClose,
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
  closeIcon?: React.ReactNode;
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
  closeIcon,
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
          <DrawerHeader className={cn(classNames?.header)}>
            <div className="flex flex-1 flex-row items-start gap-2">
              {closeIcon === false ? null : (
                <Button variant="text" shape="icon" asChild>
                  <DrawerClose
                    className={cn(
                      // "mt-1 self-start",
                      // "absolute top-4 right-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-gray-100 data-[state=open]:text-gray-500 dark:ring-offset-gray-950 dark:focus:ring-gray-300 dark:data-[state=open]:bg-gray-800 dark:data-[state=open]:text-gray-400",
                      "rounded-xs opacity-70 transition-opacity",
                      "ring-offset-background focus:ring-ring",
                      "hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none",
                      "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                      "data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
                      // "absolute top-4 right-4"
                    )}
                  >
                    {closeIcon ?? (
                      <Icon icon="icon-[lucide--x]" className="size-5" />
                    )}
                    <span className="sr-only">Close</span>
                  </DrawerClose>
                </Button>
              )}
              <div
                data-slot="drawer-header-content"
                className="flex flex-1 flex-col gap-1.5"
              >
                <DrawerTitle
                  className={cn("leading-[32px]", classNames?.title)}
                >
                  {title}
                </DrawerTitle>
                <DrawerDescription
                  className={cn(
                    description ? "" : "hidden",
                    classNames?.description,
                  )}
                >
                  {description}
                </DrawerDescription>
              </div>
              <div data-slot="drawer-header-extra">{extra}</div>
            </div>
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
