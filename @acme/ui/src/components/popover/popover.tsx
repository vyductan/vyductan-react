import React from "react";
import { useMergedState } from "@rc-component/util";
import { useDebounce } from "ahooks";
import { Popover as PopoverPrimitive } from "radix-ui";

import { cn } from "@acme/ui/lib/utils";

import type { AlignType } from "../../types";
import type { AbstractTooltipProps } from "../tooltip";
import type { PopoverContentProps, PopoverRootProps } from "./_component";
import {
  PopoverAnchor,
  Popover as InternalPopover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./_component";

export type PopoverProps = AbstractTooltipProps &
  PopoverRootProps &
  Omit<PopoverContentProps, "content" | "sideOffset" | "align"> & {
    trigger?: "click" | "hover" | "focus";
    content?: React.ReactNode;

    align?: AlignType;
    title?: React.ReactNode;
    description?: React.ReactNode;

    arrow?: boolean;
  };
export const Popover = (props: PopoverProps) => {
  const [open, setOpen] = useMergedState(false, {
    value: props.open,
    onChange: (value) => props.onOpenChange?.(value),
  });
  const debouncedOpen = useDebounce(open, {
    wait: 100,
  });

  const isShadcnPopover = React.Children.toArray(props.children).some(
    (child) =>
      React.isValidElement(child) &&
      (child.type === PopoverContent || child.type === PopoverTrigger),
  );

  if (isShadcnPopover) {
    return <InternalPopover {...props} />;
  }

  const {
    children,
    trigger = "hover",
    content,
    title,
    description,
    open: _open,
    onOpenChange: _onOpenChange,

    align: domAlign,
    placement,
    className,
    arrow = true,
    ...restProps
  } = props;

  let side: "top" | "right" | "bottom" | "left" = "bottom";
  if (placement?.includes("top")) {
    side = "top";
  } else if (placement?.includes("right")) {
    side = "right";
  } else if (placement?.includes("left")) {
    side = "left";
  }

  let align: "start" | "center" | "end" = "center";
  if (placement?.includes("Top")) {
    align = "start";
  } else if (placement?.includes("Left")) {
    align = "start";
  } else if (placement?.includes("Right")) {
    align = "end";
  }

  const alignOffset = domAlign?.offset?.[0];
  const sideOffset = domAlign?.offset?.[1];

  // In "focus" mode use an Anchor instead of a Trigger: the Anchor only
  // positions the panel and never toggles `open` on click. Opening is driven by
  // focus (below) and closing by the consumer (outside/escape/selection). This
  // avoids the click-toggle fighting a consumer-driven focus-open, which causes
  // the panel to flicker open/closed on the first focus.
  const TriggerComp = trigger === "focus" ? PopoverAnchor : PopoverTrigger;

  return (
    <InternalPopover
      open={trigger === "hover" ? debouncedOpen : open}
      onOpenChange={setOpen}
    >
      <TriggerComp
        asChild
        {...(trigger === "hover"
          ? {
              onMouseOver: () => {
                if (!open) setOpen(true);
              },
              onMouseLeave: () => {
                if (open) setOpen(false);
              },
            }
          : {})}
        {...(trigger === "focus"
          ? {
              onFocus: () => {
                if (!open) setOpen(true);
              },
            }
          : {})}
      >
        {children}
      </TriggerComp>

      <PopoverContent
        side={side}
        {...(sideOffset === undefined ? {} : { sideOffset })}
        align={align}
        {...(alignOffset === undefined ? {} : { alignOffset })}
        className={cn(arrow ? "border-none" : "", "w-auto", className)}
        {...(trigger === "hover"
          ? {
              onMouseOver: () => {
                if (!open) setOpen(true);
              },
              onMouseLeave: () => {
                if (open) setOpen(false);
              },
            }
          : {})}
        {...restProps}
      >
        {arrow && <PopoverPrimitive.Arrow className="fill-white" />}
        {(title || description) && (
          <PopoverHeader>
            {title && <PopoverTitle>{title}</PopoverTitle>}
            {description && (
              <PopoverDescription>{description}</PopoverDescription>
            )}
          </PopoverHeader>
        )}
        {content}
      </PopoverContent>
    </InternalPopover>
  );
};

export { PopoverHeader, PopoverTitle, PopoverDescription } from "./_component";
