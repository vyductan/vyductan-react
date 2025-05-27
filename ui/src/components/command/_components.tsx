"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";

import { cn } from "@acme/ui/lib/utils";

import type { ValueType } from "../form";
import type { Option } from "../select/types";
import { Icon } from "../../icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../modal/_components";

type CommandRootProps = React.ComponentProps<typeof CommandPrimitive>;
function CommandRoot({ className, ...props }: CommandRootProps) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "bg-popover text-popover-foreground flex size-full flex-col overflow-hidden rounded-md",
        className,
      )}
      {...props}
    />
  );
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string;
  description?: string;
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent className="overflow-hidden p-0">
        <CommandRoot
          className={cn(
            "[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium",
            "**:data-[slot=command-input-wrapper]:h-12",
            "[&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0",
            "[&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5",
            "[&_[cmdk-input]]:h-12",
            "[&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3",
            "[&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5",
          )}
        >
          {children}
        </CommandRoot>
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className={cn(
        "flex items-center gap-2 border-b px-3",
        // before
        // h-9
      )}
    >
      <Icon
        icon="icon-[lucide--search]"
        className={cn(
          "size-4 shrink-0 opacity-50",
          // before
          // "mr-2"
        )}
      />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden",
          "placeholder:text-muted-foreground",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto",
        className,
      )}
      {...props}
    />
  );
}

// fix: https://github.com/pacocoursey/cmdk/issues/149#issuecomment-1606206982
// Command.tsx: add line {options.length > 0 && (
// const CommandEmpty = React.forwardRef<
//   React.ElementRef<typeof CommandPrimitive.Empty>,
//   React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
// >((props, ref) => {
//   const render = useCommandState((state) => state.filtered.count === 0);
//   if (!render) return <></>;
//
//   return (
//     <div
//       ref={ref}
//       className="py-6 text-center text-sm"
//       cmdk-empty=""
//       role="presentation"
//       {...props}
//     />
//   );
// });
function CommandEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="py-6 text-center text-sm"
      {...props}
    />
  );
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "text-foreground overflow-hidden p-1",
        "[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
        className,
      )}
      {...props}
    />
  );
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("bg-border -mx-1 h-px", className)}
      {...props}
    />
  );
}

type CommandItemProps<T extends ValueType = ValueType> = React.ComponentProps<
  typeof CommandPrimitive.Item
> & {
  checked?: boolean;
  optionRender?: {
    checked?: boolean;
    icon?: (option: Option<T>) => React.ReactNode;
    label?: (option: Option<T>) => React.ReactNode;
  };
};
function CommandItem({
  className,
  children,
  optionRender,
  checked,
  ...props
}: CommandItemProps) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "[&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground", // do not keep bg-accent when move mouse out of item | moved to own

        // own
        "hover:bg-accent hover:text-accent-foreground",
        "whitespace-nowrap",
        className,
      )}
      {...props}
    >
      {children}

      {(!optionRender || optionRender.checked) && (
        <Icon
          icon="icon-[lucide--check]"
          className={cn(
            "ml-auto shrink-0",
            checked ? "opacity-100" : "opacity-0",
          )}
        />
      )}
    </CommandPrimitive.Item>
  );
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

export type { CommandRootProps };
export {
  CommandRoot,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
