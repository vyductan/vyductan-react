import type { DrawerRootProps } from "./_components";
import { cn } from "..";
import {
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
} from "./_components";

type DrawerProps = DrawerRootProps & {
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
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
  trigger,

  className,
  classNames,
  placement = "right",
  // closeIcon,
  ...props
}: DrawerProps) => {
  const placementClassName =
    placement === "right"
      ? cn(
          "inset-y-0 left-auto right-0 mt-0 h-svh w-[378px] overflow-hidden rounded-none",
        )
      : "";
  return (
    <DrawerRoot direction={placement} {...props}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent className={cn(placementClassName, className)}>
        <DrawerHeader className={cn("border-b p-6", classNames?.header)}>
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
