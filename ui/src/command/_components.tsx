"use client";

import type { DialogProps } from "@radix-ui/react-dialog";
import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";

import { cn } from "@acme/ui";

import type { ValueType } from "../form";
import type { Option } from "../select/types";
import { Icon } from "../icons";
import { CheckFilled } from "../icons/check-filled";
import { Dialog, DialogContent } from "../modal/_components";

type CommandRootProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive>;
const CommandRoot = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  CommandRootProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex size-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
      className,
    )}
    {...props}
  />
));
CommandRoot.displayName = CommandPrimitive.displayName;

type CommandDialogProps = DialogProps;
const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <CommandRoot className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:size-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:size-5">
          {children}
        </CommandRoot>
      </DialogContent>
    </Dialog>
  );
};

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <Icon
      icon="icon-[lucide--search]"
      className="mr-2 size-4 shrink-0 opacity-50"
    />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  </div>
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
));

CommandList.displayName = CommandPrimitive.List.displayName;

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
const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm"
    {...props}
  />
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className,
    )}
    {...props}
  />
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 h-px bg-border", className)}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

type CommandItemProps<T extends ValueType = ValueType> =
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> & {
    checked: boolean;
    optionRender?: {
      checked?: boolean;
      icon?: (option: Option<T>) => React.ReactNode;
      label?: (option: Option<T>) => React.ReactNode;
    };
  };
const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  CommandItemProps
>(({ className, children, optionRender, checked, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
      // "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
      // "aria-selected:bg-accent aria-selected:text-accent-foreground",
      "hover:bg-background-hover",
      // "data-[selected='true']:bg-background-hover",
      "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
      className,
    )}
    {...props}
  >
    {/* {(!optionRender || optionRender.checked) && ( */}
    {/*   <CheckFilled */}
    {/*     className={cn( */}
    {/*       "mr-2 size-4 shrink-0", */}
    {/*       checked ? "opacity-100" : "opacity-0", */}
    {/*     )} */}
    {/*   /> */}
    {/* )} */}

    {children}

    {(!optionRender || optionRender.checked) && (
      <CheckFilled
        className={cn(
          "ml-auto size-4 shrink-0",
          checked ? "opacity-100" : "opacity-0",
        )}
      />
    )}
  </CommandPrimitive.Item>
));

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
};
CommandShortcut.displayName = "CommandShortcut";

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