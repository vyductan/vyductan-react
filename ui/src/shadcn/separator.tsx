"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "@acme/ui/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  )
}

// type SeparatorProps = React.ComponentProps<typeof SeparatorPrimitive.Root>;
// const Separator = ({
//   className,
//   orientation = "horizontal",
//   decorative = true,
//   children,
//   ...props
// }: SeparatorProps) => {
//   const separator = (
//     <SeparatorPrimitive.Root
//       data-slot="separator-root"
//       decorative={decorative}
//       orientation={orientation}
//       className={cn(
//         "bg-border shrink-0",
//         "data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full",
//         "data-[orientation=vertical]:w-px",
//         orientation === "horizontal" && "my-6",
//         orientation === "horizontal" && children && "grow basis-0",
//         "self-stretch",
//         className,
//       )}
//       {...props}
//     />
//   );

//   const Comp = children ? (
//     <div className={cn("flex items-center justify-between gap-2", className)}>
//       {separator}
//       <div className="mb-px">{children}</div>
//       {separator}
//     </div>
//   ) : (
//     separator
//   );
//   return Comp;
// };

// export type { SeparatorProps };
export { Separator };
