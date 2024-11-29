import type { SheetContentProps, SheetRootProps } from "./_components";
import { cn } from "..";
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetRoot,
  SheetTitle,
  SheetTrigger,
} from "./_components";

type DrawerProps = SheetRootProps & {
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  trigger?: React.ReactNode;

  classNames?: {
    header?: string;
    title?: string;
    description?: string;
    content?: string;
  };
  placement?: SheetContentProps["side"];
  closeIcon?: SheetContentProps["closeIcon"];
};
const Drawer = ({
  title,
  description,
  children,
  trigger,

  classNames,
  placement = "right",
  closeIcon,
  ...props
}: DrawerProps) => {
  return (
    <SheetRoot {...props}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent side={placement} closeIcon={closeIcon}>
        <SheetHeader className={cn("p-6 pb-0", classNames?.header)}>
          <SheetTitle className={classNames?.title}>{title}</SheetTitle>
          <SheetDescription
            className={cn(description ? "" : "hidden", classNames?.description)}
          >
            {description}
          </SheetDescription>
        </SheetHeader>

        <div className={cn("p-6", classNames?.content)}>{children}</div>
      </SheetContent>
    </SheetRoot>
  );
};

export type { DrawerProps };
export { Drawer };
