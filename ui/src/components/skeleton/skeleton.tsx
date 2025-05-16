import { Slot } from "@radix-ui/react-slot";

import { cn } from "@acme/ui/lib/utils";
import { Skeleton as SkeletonShadcn } from "@acme/ui/shadcn/skeleton";

function Skeleton({
  className,
  asChild,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
}) {
  const SkeletonComp = asChild ? Slot : SkeletonShadcn;
  return <SkeletonComp className={cn("h-4 w-full", className)} {...props} />;
}

export { Skeleton };
