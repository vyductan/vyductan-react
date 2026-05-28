import {
  SheetContent as ShadcnSheetContent,
  SheetHeader as ShadcnSheetHeader,
  SheetTitle as ShadcnSheetTitle,
  SheetClose,
} from "@acme/ui/shadcn/sheet";

import { Icon } from "../../icons";
import { cn } from "../../lib/utils";
import { Button } from "../button";

type SheetContentProperties = React.ComponentProps<typeof ShadcnSheetContent>;
export const SheetContent = ({
  className,
  ...properties
}: SheetContentProperties) => {
  return (
    <ShadcnSheetContent
      className={cn("sm:max-w-svw [&>button>svg]:hidden", className)}
      {...properties}
    />
  );
};

type SheetHeaderProperties = React.ComponentProps<typeof ShadcnSheetHeader> & {
  extra?: React.ReactNode;
};
export const SheetHeader = ({
  className,
  children,
  extra,
  ...properties
}: SheetHeaderProperties) => {
  return (
    <ShadcnSheetHeader
      className={cn(
        "flex flex-row justify-between border-b px-6 py-4",
        className,
      )}
      {...properties}
    >
      {children}
      {extra}
    </ShadcnSheetHeader>
  );
};

type SheetTitleProperties = React.ComponentProps<typeof ShadcnSheetTitle>;
const SheetTitle = ({
  children,
  className,
  ...properties
}: SheetTitleProperties) => {
  return (
    <div data-slot="sheet-header-title" className="flex items-center">
      <SheetClose
        className={cn(
          // "absolute top-4 right-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-gray-100 data-[state=open]:text-gray-500 dark:ring-offset-gray-950 dark:focus:ring-gray-300 dark:data-[state=open]:bg-gray-800 dark:data-[state=open]:text-gray-400",
          "rounded-xs opacity-70 transition-opacity",
          "ring-offset-background focus:ring-ring",
          "hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          "data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
          // "absolute top-4 right-4"
        )}
        asChild
      >
        <Button
          size="small"
          variant="text"
          shape="icon"
          icon={<Icon icon="icon-[lucide--x]" className="size-5" />}
          className="mr-2"
        >
          <span className="sr-only">Close</span>
        </Button>
      </SheetClose>
      <ShadcnSheetTitle className={className} {...properties}>
        {children}
      </ShadcnSheetTitle>
    </div>
  );
};

export { SheetTitle };
export {
  SheetDescription,
  Sheet as SheetRoot,
  SheetTrigger,
} from "@acme/ui/shadcn/sheet";
