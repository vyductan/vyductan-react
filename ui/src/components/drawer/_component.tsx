import {
  DrawerClose,
  DrawerContent as ShadcnDrawerContent,
  DrawerHeader as ShadcnDrawerHeader,
} from "@acme/ui/shadcn/drawer";

import { Icon } from "../../icons";
import { cn } from "../../lib/utils";
import { Button } from "../button";

const DrawerContent = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ShadcnDrawerContent>) => {
  return (
    <ShadcnDrawerContent
      className={cn(
        "data-[vaul-drawer-direction=right]:sm:max-w-auto data-[vaul-drawer-direction=right]:w-auto",
        className?.includes("w-")
          ? ""
          : "data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:sm:max-w-sm",
        className,
      )}
      {...props}
    >
      {children}
    </ShadcnDrawerContent>
  );
};

const DrawerHeader = ({
  className,
  children,
  extra,
  ...props
}: React.ComponentProps<typeof ShadcnDrawerHeader> & {
  extra?: React.ReactNode;
}) => {
  return (
    <ShadcnDrawerHeader
      className={cn("flex flex-row items-center border-b p-4", className)}
      {...props}
    >
      <Button size="sm" variant="ghost" shape="icon" asChild>
        <DrawerClose
          className={cn(
            // "absolute top-4 right-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-gray-100 data-[state=open]:text-gray-500 dark:ring-offset-gray-950 dark:focus:ring-gray-300 dark:data-[state=open]:bg-gray-800 dark:data-[state=open]:text-gray-400",
            "rounded-xs opacity-70 transition-opacity",
            "ring-offset-background focus:ring-ring",
            "hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none",
            "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            "data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
            // "absolute top-4 right-4"
          )}
        >
          <Icon icon="icon-[lucide--x]" className="size-5" />
          <span className="sr-only">Close</span>
        </DrawerClose>
      </Button>
      <div className="flex flex-1 flex-col gap-1.5">{children}</div>
      {extra}
    </ShadcnDrawerHeader>
  );
};

// function DrawerHeader({
//     className,
//     children,
//     extra,
//     ...props
//   }: React.ComponentProps<"div"> & {
//     extra?: React.ReactNode;
//   }) {
//     return (
//       <div
//         data-slot="drawer-header"
//         className={cn(
//           "flex p-4",
//           // "flex-col gap-1.5"
//           // own
//           "items-center gap-2 border-b px-6",
//           className,
//         )}
//         {...props}
//       >

//       </div>
//     );
//   }

export { DrawerContent, DrawerHeader };
