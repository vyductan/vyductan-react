import type { XOR } from "ts-xor";

import { cn } from "@acme/ui/lib/utils";

import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  Sheet as SheetRoot,
  SheetTitle,
  SheetTrigger,
} from "../../shadcn/sheet";

type ShadcnSheetProps = React.ComponentProps<typeof SheetRoot> & {
  title?: React.ReactNode;
};
type OwnSheetProps = {
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
  placement?: React.ComponentProps<typeof SheetContent>["side"];
};

type SheetProps = XOR<ShadcnSheetProps, OwnSheetProps>;
const Sheet = (props: SheetProps) => {
  const isShadcnSheet = !props.title;
  if (isShadcnSheet) {
    return <SheetRoot {...props} />;
  }

  const {
    title,
    description,
    children,
    trigger,

    classNames,
    placement = "right",
    ...restProps
  } = props;

  return (
    <SheetRoot {...restProps}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent side={placement}>
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
