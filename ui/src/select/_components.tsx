import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";

import type { ValueType } from "../form";
import { cn } from "..";
import { Icon } from "../icons";
import { CheckFilled } from "../icons/check-filled";
import { inputSizeVariants, inputVariants } from "../input";

type SelectRootProps = SelectPrimitive.SelectProps;
const SelectRoot = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

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
const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(
  (
    {
      className,
      children,
      borderless,
      size,
      status,

      allowClear,
      onClear,
      value,

      ...props
    },
    ref,
  ) => {
    return (
      <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
          "group relative",
          inputVariants({ borderless, status }),
          inputSizeVariants({ size }),
          "items-center justify-between",
          "data-[placeholder]:text-muted-foreground",
          "focus:outline-none",
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
              "hover:!opacity-50",
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
          className={cn(
            "flex size-5 items-center justify-center opacity-50 transition-opacity",
            "pl-1",
            allowClear && value && "group-hover:opacity-0",
          )}
        >
          <Icon icon="icon-[mingcute--down-fill]" className="size-4" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
    );
  },
);
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <Icon icon="icon-[mingcute--up-fill]" className="size-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <Icon icon="icon-[mingcute--down-fill]" className="size-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-32 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
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
          "px-[3px] py-1",
          // deduction border left and right: calc(var(--radix-select-trigger-width)-2px)
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[calc(var(--radix-select-trigger-width)-2px)]",
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 text-sm outline-none",
      // "pr-2 pl-8",
      "px-2",
      "focus:bg-background-hover",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    {/* <span className="absolute left-2 flex h-full items-center justify-center"> */}
    {/*   <SelectPrimitive.ItemIndicator asChild> */}
    {/*     <CheckFilled className="size-4" /> */}
    {/*   </SelectPrimitive.ItemIndicator> */}
    {/* </span> */}

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>

    <span className="absolute right-2 flex h-full items-center justify-center">
      <SelectPrimitive.ItemIndicator asChild>
        <CheckFilled className="size-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

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
