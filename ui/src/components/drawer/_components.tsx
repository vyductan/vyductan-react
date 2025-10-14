import { Content } from "vaul";

import type { DrawerContent as ShadcnDrawerContent } from "@acme/ui/shadcn/drawer";
import {
  DrawerOverlay,
  DrawerPortal,
  DrawerHeader as ShadcnDrawerHeader,
} from "@acme/ui/shadcn/drawer";

import { cn } from "../../lib/utils";

// const DrawerContent = ({
//   className,
//   children,
//   ...props
// }: React.ComponentProps<typeof ShadcnDrawerContent>) => {
//   return (
//     <ShadcnDrawerContent
//       className={cn(
//         "flex flex-col [&>div]:flex-1",
//         "!touch-auto !select-text",
//         "data-[vaul-drawer-direction=right]:w-[inheri",
//         "data-[vaul-drawer-direction=right]:sm:max-w-auto",
//         className,
//       )}
//       {...props}
//     >
//       {children}
//     </ShadcnDrawerContent>
//   );
// };

function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ShadcnDrawerContent>) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <Content
        data-slot="drawer-content"
        className={cn(
          "w-[378px]",
          "group/drawer-content bg-background fixed z-50 flex h-auto flex-col",
          "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b",
          "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
          "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:border-l",
          // data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:sm:max-w-sm
          "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm",

          //
          // "flex flex-col [&>div]:flex-1",
          "!touch-auto !select-text",
          className,
        )}
        {...props}
      >
        <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        {children}
      </Content>
    </DrawerPortal>
  );
}

const DrawerHeader = ({
  className,
  ...props
}: React.ComponentProps<typeof ShadcnDrawerHeader>) => {
  return (
    <ShadcnDrawerHeader
      className={cn("flex flex-row items-center border-b p-4", className)}
      {...props}
    />
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

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      "bg-muted/10 border-t p-4",
      className,
    )}
    {...props}
  />
);
DrawerFooter.displayName = "DrawerFooter";

export { DrawerContent, DrawerHeader, DrawerFooter };
export {
  Drawer as DrawerRoot,
  DrawerDescription,
  DrawerOverlay,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
  DrawerPortal,
} from "../../shadcn/drawer";
