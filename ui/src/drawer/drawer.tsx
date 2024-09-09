import type { SheetContentProps, SheetRootProps } from "./_components";
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetRoot,
  SheetTitle,
  // SheetTrigger,
} from "./_components";

type DrawerProps = SheetRootProps & {
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;

  classNames?: {
    header?: string;
    title?: string;
  };
  placement?: SheetContentProps["side"];
  closeIcon?: SheetContentProps["closeIcon"];
};
const Drawer = ({
  title,
  description,
  children,

  classNames,
  placement = "right",
  closeIcon,
  ...props
}: DrawerProps) => {
  return (
    <SheetRoot {...props}>
      {/* <SheetTrigger>Open</SheetTrigger> */}
      <SheetContent side={placement} closeIcon={closeIcon}>
        <SheetHeader className={classNames?.header}>
          <SheetTitle className={classNames?.title}>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <div>{children}</div>
      </SheetContent>
    </SheetRoot>
  );
};

export type { DrawerProps };
export { Drawer };
