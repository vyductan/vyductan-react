import type { ReactNode } from "react";
import { useState } from "react";

import { ColorPicker } from "@acme/ui/components/color-picker";

import { useEditorColorPalette } from "../../context/color-palette-context";
import { ColorSwatchPicker } from "./color-swatch-picker";
import {
  NOTION_HIGHLIGHT_COLORS,
  NOTION_TEXT_COLORS,
} from "./editor-color-palette";

/**
 * The fixed toolbar's color choice, in the editor's palette: Notion's
 * swatches, or a free picker with a hex field. `undefined` is no color —
 * the page's own text color, or no highlight.
 */
export function EditorColorChooser({
  kind,
  value,
  onSelect,
  onOpenChange,
  children,
}: {
  kind: "text" | "highlight";
  value: string;
  onSelect: (color: string | undefined) => void;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  const palette = useEditorColorPalette();
  // While the free picker is open it shows its own last color, not the
  // toolbar's reading of the selection: that came back a step behind, or
  // normalized (`#123` as `#112233`), and replaced the hex being typed.
  const [own, setOwn] = useState<string | null>(null);

  if (palette === "free") {
    return (
      <ColorPicker
        value={(own ?? value) || undefined}
        format="hex"
        allowClear
        onOpenChange={(open) => {
          setOwn(open ? value : null);
          onOpenChange(open);
        }}
        onChange={(_color, hex) => {
          setOwn(hex ?? "");
          onSelect(hex || undefined);
        }}
      >
        {children}
      </ColorPicker>
    );
  }

  return (
    <ColorSwatchPicker
      swatches={kind === "text" ? NOTION_TEXT_COLORS : NOTION_HIGHLIGHT_COLORS}
      value={value || undefined}
      onSelect={onSelect}
      onOpenChange={onOpenChange}
      defaultLabel={kind === "text" ? "Default" : "No highlight"}
      renderSwatch={(swatch) =>
        kind === "text" ? (
          <span style={{ color: swatch.value }}>A</span>
        ) : (
          <span
            aria-hidden="true"
            className="size-full rounded-sm"
            style={{ backgroundColor: swatch.value }}
          />
        )
      }
    >
      {children}
    </ColorSwatchPicker>
  );
}
