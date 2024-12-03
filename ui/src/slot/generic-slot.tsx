import type { SlotProps } from "@radix-ui/react-slot";
import React from "react";
import { Slot } from "@radix-ui/react-slot";

type GenericSlotProps<P = React.HTMLAttributes<HTMLElement>> = SlotProps & P;
const GenericSlotInner = <P = React.HTMLAttributes<HTMLElement>,>(
  props: GenericSlotProps<P>,
  ref: React.Ref<HTMLElement>,
) => {
  return <Slot ref={ref} {...props} />;
};

const GenericSlot = React.forwardRef(GenericSlotInner) as <
  P = React.HTMLAttributes<HTMLElement>,
>(
  props: GenericSlotProps<P>,
  ref: React.Ref<HTMLElement>,
) => ReturnType<typeof GenericSlotInner>;

export { GenericSlot };
