import type { ComponentProps } from "react";

import { cn } from "@acme/ui/lib/utils";
import { Item as ShadcnItem } from "@acme/ui/shadcn/item";

type ShadcnItemProps = ComponentProps<typeof ShadcnItem>;

/**
 * `xs` ships in shadcn's new `registry/bases/*` generation but not in the
 * `new-york` style we install from, so it is added here instead of in
 * `shadcn/item.tsx` (kept pristine for `shadcn add --overwrite`).
 * Classes mirror upstream: https://ui.shadcn.com/docs/components/item
 */
type ItemProps = Omit<ShadcnItemProps, "size"> & {
  size?: NonNullable<ShadcnItemProps["size"]> | "xs";
};

const xsItemClassName = cn(
  "gap-2 px-2.5 py-2 in-data-[slot=dropdown-menu-content]:p-0",
  // upstream applies these via `group-data-[size=xs]/item:` on the child slots
  "[&_[data-slot=item-content]]:gap-0",
  "[&_[data-slot=item-description]]:text-xs",
);

const Item = ({ size = "default", className, ...props }: ItemProps) => {
  if (size !== "xs") {
    return <ShadcnItem size={size} className={className} {...props} />;
  }
  return (
    <ShadcnItem
      {...props}
      // `null` skips cva's size variant entirely, so no `gap-4 p-4` to override
      size={null}
      data-size="xs"
      className={cn(xsItemClassName, className)}
    />
  );
};

export type { ItemProps };
export { Item };
export {
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@acme/ui/shadcn/item";
