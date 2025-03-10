import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";

import type { ValueType } from "../form";
import { cn } from "..";
import { Icon } from "../icons";
import { inputSizeVariants, inputVariants } from "../input";

type SelectRootProps = React.ComponentProps<typeof SelectPrimitive.Root>;
function SelectRoot({ ...props }: SelectRootProps) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

type SelectTriggerProps = Omit<
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
  "value"
> &
  VariantProps<typeof inputVariants> &
  VariantProps<typeof inputSizeVariants> & {
    allowClear?: boolean | undefined;
    onClear?: () => void;
    /* For clear */
    value?: ValueType | undefined;
  };

const SelectTrigger = ({
  className,
  children,
  borderless,
  size,
  status,

  allowClear,
  onClear,
  value,

  ...props
}: SelectTriggerProps) => {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // own
        "group relative",
        inputVariants({ borderless, status }),
        // "items-center justify-between",
        inputSizeVariants({ size }),
        // "data-placeholder:text-muted-foreground",
        // "focus:outline-hidden",

        // own not used
        // "focus:ring-2 focus:ring-ring focus:ring-offset-2",
        // "disabled:text-placeholder disabled:cursor-not-allowed disabled:pointer-events-none",
        // "[&>span]:line-clamp-1", ???  disabled for middle arrow
        className,
      )}
      {...props}
    >
      {children}
      {allowClear && (
        <button
          className={cn(
            "z-10",
            "absolute right-[11px]",
            "flex size-5 items-center justify-center transition-opacity",
            "opacity-0",
            "hover:opacity-50!",
            value && "group-hover:opacity-30",
          )}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClear?.();
          }}
        >
          <Icon
            icon="icon-[ant-design--close-circle-filled]"
            className="pointer-events-none size-3.5"
          />
        </button>
      )}
      <SelectPrimitive.Icon
        // asChild
        className={cn(
          "flex size-5 items-center justify-center opacity-50 transition-opacity",
          "pl-1",
          allowClear && value && "group-hover:opacity-0",
        )}
      >
        <Icon icon="icon-[lucide--chevron-down]" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
};

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border shadow-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            // "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1",

            // own
            "px-[3px] py-1",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn(
        "py-1.5 text-sm font-medium",
        // own
        "pr-2 pl-8",
        className,
      )}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 text-sm outline-hidden select-none",
        // "pr-8 pl-2"
        "focus:bg-accent focus:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "[&_svg:not([class*='text-'])]:text-muted-foreground",
        "*:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",

        // own
        "px-2",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "absolute right-2 flex items-center justify-center",
          // size-3.5

          // own
          "h-full",
        )}
      >
        <SelectPrimitive.ItemIndicator>
          <Icon icon="icon-[lucide--check]" className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <Icon icon="icon-[lucide--chevron-up]" className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <Icon icon="icon-[lucide--chevron-down]" className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export type { SelectRootProps };
export {
  SelectRoot,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
