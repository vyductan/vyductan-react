import type { XOR } from "ts-xor";
import { Children, isValidElement } from "react";

import { cn } from "@acme/ui/lib/utils";

import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetRoot,
  SheetTitle,
  SheetTrigger,
} from "./_components";

type ShadcnSheetProps = React.ComponentProps<typeof SheetRoot>;
type OwnSheetProps = {
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;

  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  trigger?: React.ReactNode;
  footer?: React.ReactNode;
  extra?: React.ReactNode;

  /** Config Drawer Panel className. Use rootClassName if want to config top DOM style */
  className?: string;

  /** Config Drawer Panel classNames */
  classNames?: {
    header?: string;
    title?: string;
    description?: string;
    content?: string;
    footer?: string;
  };
  placement?: React.ComponentProps<typeof SheetContent>["side"];
};

type SheetProps = XOR<ShadcnSheetProps, OwnSheetProps>;
const Sheet = (props: SheetProps) => {
  const isShadcnSheet = Children.toArray(props.children).some(
    (child) => isValidElement(child) && child.type === SheetContent,
  );
  if (isShadcnSheet) {
    return <SheetRoot {...props} />;
  }

  const {
    title,
    description,
    children,
    trigger,
    footer,
    extra,
    className,
    classNames,
    placement = "right",
    onClose,
    onOpenChange,
    ...restProps
  } = props;

  return (
    <SheetRoot
      onOpenChange={(open) => {
        if (!open) onClose?.();
        onOpenChange?.(open);
      }}
      {...restProps}
    >
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent
        side={placement}
        className={cn(className, classNames?.content)}
      >
        <SheetHeader className={cn(classNames?.header)} extra={extra}>
          <SheetTitle className={classNames?.title}>{title}</SheetTitle>
          <SheetDescription
            className={cn(
              description ? "" : "hidden",
              "ml-7",
              classNames?.description,
            )}
          >
            {description}
          </SheetDescription>
        </SheetHeader>

        <div className={cn("flex-1 overflow-auto p-6 py-0")}>{children}</div>

        {footer && (
          <div
            className={cn(
              "bg-muted/10 flex flex-col-reverse border-t p-4 sm:flex-row sm:justify-end sm:space-x-2",
              classNames?.footer,
            )}
          >
            {footer}
          </div>
        )}
      </SheetContent>
    </SheetRoot>
  );
};

export type { SheetProps };
export { Sheet };

export {
  Sheet as SheetRoot,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "../../shadcn/sheet";
