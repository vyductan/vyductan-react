import type { SlotProps } from "@radix-ui/react-slot";
import React from "react";
import { Slot } from "@radix-ui/react-slot";

type GenericSlotProps<P = React.HTMLAttributes<HTMLElement>> = SlotProps & P;
const GenericSlot = <P = React.HTMLAttributes<HTMLElement>,>(
  props: GenericSlotProps<P>,
) => {
  return <Slot {...props} />;
};

export type { GenericSlotProps };
export { GenericSlot };
