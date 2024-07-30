import type { SlotProps } from "@radix-ui/react-slot";
import { Slot } from "@radix-ui/react-slot";

export const GenericSlot = <P = React.HTMLAttributes<HTMLElement>,>(
  props: SlotProps & P,
) => {
  return <Slot {...props} />;
};
