import { cn } from "@acme/ui/lib/utils";

type FloatingLabelStatus = "default" | "error";
type FloatingLabelSize = "md" | "sm";

/** control height by size — md matches MUI outlined (56px), sm is compact (48px). */
const floatingControlHeight: Record<FloatingLabelSize, string> = {
  md: "h-14",
  sm: "h-12",
};

/** border + focus + invalid + disabled classes shared by every floating control. */
const floatingBorderClass = cn(
  // `enabled:` gates hover so a disabled control keeps its faded border
  // instead of lighting up primary on hover.
  "border-input enabled:hover:border-primary-500",
  "focus:border-primary-500 focus:ring-primary-500/20 focus:ring-[3px]",
  "aria-invalid:border-error enabled:aria-invalid:hover:border-error aria-invalid:focus:ring-error/20",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

/** label base: colour, notch-mask bg, position anchor. Position/float states are
 * appended per-control (input/textarea use peer CSS, select toggles in JS). */
const floatingLabelBaseClass = cn(
  "text-muted-foreground bg-background pointer-events-none absolute left-2.5 z-10 px-1 text-sm transition-all",
  "max-w-[calc(100%-1rem)] truncate",
);

/** utilities that put the label onto the top border, shrunk. */
const FLOATED = "top-0 -translate-y-1/2 text-xs";

const RequiredMark = () => <span className="text-destructive ml-1">*</span>;

export type { FloatingLabelStatus, FloatingLabelSize };
export {
  floatingControlHeight,
  floatingBorderClass,
  floatingLabelBaseClass,
  FLOATED,
  RequiredMark,
};
