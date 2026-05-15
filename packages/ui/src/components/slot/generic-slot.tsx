import { Slot } from "radix-ui";
import type React from "react";

type GenericSlotProperties<P = React.HTMLAttributes<HTMLElement>> =
  Slot.SlotProps & P;
  
const GenericSlot = <P = React.HTMLAttributes<HTMLElement>,>(
  properties: GenericSlotProperties<P>,
) => {
  return <Slot.Root {...properties} />;
};

export type { GenericSlotProperties as GenericSlotProps };
export { GenericSlot };
