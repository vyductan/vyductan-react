"use client";

import type * as React from "react";

import type { Command as CommandRoot } from "@acme/ui/shadcn/command";
import { cn } from "@acme/ui/lib/utils";
import { CommandItem as ShadcnCommandItem } from "@acme/ui/shadcn/command";

import { Icon } from "../../icons";

type CommandRootProps = React.ComponentProps<typeof CommandRoot>;

// Local wrapper to support a `checked` prop for items
type WrappedCommandItemProps = React.ComponentProps<
  typeof ShadcnCommandItem
> & {
  checked?: boolean;
};

function CommandItem({
  className,
  children,
  checked,
  ...props
}: WrappedCommandItemProps) {
  return (
    <ShadcnCommandItem
      data-slot="command-item"
      className={cn(
        "[&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // own hover style
        "hover:bg-accent hover:text-accent-foreground",
        "whitespace-nowrap",
        className,
      )}
      {...props}
    >
      {children}
      <Icon
        icon="icon-[lucide--check]"
        className={cn(
          "ml-auto shrink-0",
          checked ? "opacity-100" : "opacity-0",
        )}
      />
    </ShadcnCommandItem>
  );
}

export type { CommandRootProps };
export { CommandItem };

export {
  Command as CommandRoot,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandSeparator,
  CommandShortcut,
} from "@acme/ui/shadcn/command";
