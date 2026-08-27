import type { ReactNode } from "react";

import { Popover } from "@acme/ui/components/popover";
import { cn } from "@acme/ui/lib/utils";

import type { EditorColorSwatch } from "./editor-color-palette";

type ColorSwatchPickerProperties = {
  swatches: EditorColorSwatch[];
  /** The value currently applied to the selection, if any. */
  value?: string;
  onSelect: (value: string | undefined) => void;
  onOpenChange?: (open: boolean) => void;
  /** Rendered inside each swatch button — a letter for text, a block for fills. */
  renderSwatch: (swatch: EditorColorSwatch) => ReactNode;
  defaultLabel: string;
  children: ReactNode;
};

/**
 * A palette-only picker. Deliberately offers no hex field and no gradient area:
 * the editor's color set is closed so that arbitrary values — `#000000` above
 * all — never reach stored documents. See editor-color-palette.ts.
 */
export function ColorSwatchPicker({
  swatches,
  value,
  onSelect,
  onOpenChange,
  renderSwatch,
  defaultLabel,
  children,
}: ColorSwatchPickerProperties) {
  return (
    <Popover
      trigger="click"
      placement="bottomLeft"
      onOpenChange={onOpenChange}
      className="w-auto p-2"
      content={
        <div className="space-y-2">
          <button
            type="button"
            className={cn(
              "hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1 text-left text-sm",
              !value && "bg-accent",
            )}
            onClick={() => onSelect(undefined)}
          >
            {defaultLabel}
          </button>

          <div className="grid grid-cols-6 gap-1">
            {swatches.map((swatch) => (
              <button
                key={swatch.name}
                type="button"
                aria-label={swatch.name}
                title={swatch.name}
                className={cn(
                  "border-border flex size-7 items-center justify-center rounded-sm border text-sm font-semibold transition-transform hover:scale-110",
                  value === swatch.value && "ring-primary ring-2",
                )}
                onClick={() => onSelect(swatch.value)}
              >
                {renderSwatch(swatch)}
              </button>
            ))}
          </div>
        </div>
      }
    >
      {children}
    </Popover>
  );
}
