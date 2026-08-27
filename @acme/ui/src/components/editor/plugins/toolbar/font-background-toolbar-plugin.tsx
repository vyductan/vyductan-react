import type { BaseSelection, RangeSelection } from "lexical";
import { useCallback, useRef, useState } from "react";
import {
  $getSelectionStyleValueForProperty,
  $patchStyleText,
} from "@lexical/selection";
import { $getSelection, $isRangeSelection, $setSelection } from "lexical";
import { PaintBucketIcon } from "lucide-react";

import { Button } from "@acme/ui/components/button";

import { useToolbarContext } from "../../context/toolbar-context";
import { useUpdateToolbarHandler } from "../../editor-hooks/use-update-toolbar";
import { ColorSwatchPicker } from "./color-swatch-picker";
import { EDITOR_HIGHLIGHT_COLORS } from "./editor-color-palette";

export function FontBackgroundToolbarPlugin() {
  const { activeEditor } = useToolbarContext();
  const selectionReference = useRef<RangeSelection | null>(null);

  // Empty means no highlight at all, which is not the same as a white fill:
  // a white fill would stay white on a dark page.
  const [bgColor, setBgColor] = useState("");

  const $updateToolbar = (selection: BaseSelection) => {
    if ($isRangeSelection(selection)) {
      setBgColor(
        $getSelectionStyleValueForProperty(selection, "background-color", ""),
      );
    }
  };

  useUpdateToolbarHandler($updateToolbar);

  const applyStyleText = useCallback(
    (styles: Record<string, string>, skipHistoryStack?: boolean) => {
      activeEditor.update(
        () => {
          let selection = $getSelection();
          if (!selection && selectionReference.current) {
            $setSelection(selectionReference.current);
            selection = $getSelection();
          }
          if ($isRangeSelection(selection)) {
            $patchStyleText(selection, styles);
          }
        },
        skipHistoryStack ? { tag: "historic" } : {},
      );
    },
    [activeEditor],
  );

  const onBackgroundColorSelect = useCallback(
    (color: string | undefined) => {
      setBgColor(color ?? "");
      applyStyleText({ "background-color": color ?? "" });
    },
    [applyStyleText],
  );

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        activeEditor.getEditorState().read(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selectionReference.current = selection.clone();
          }
        });
      }
    },
    [activeEditor],
  );

  return (
    <ColorSwatchPicker
      swatches={EDITOR_HIGHLIGHT_COLORS}
      value={bgColor || undefined}
      onSelect={onBackgroundColorSelect}
      onOpenChange={onOpenChange}
      defaultLabel="No highlight"
      renderSwatch={(swatch) => (
        <span
          aria-hidden="true"
          className="size-full rounded-sm"
          style={{ backgroundColor: swatch.value }}
        />
      )}
    >
      <Button
        variant="ghost"
        size="sm"
        className="flex h-8 w-8 flex-col gap-0 p-0"
        title="Highlight Color"
      >
        <PaintBucketIcon className="h-4 w-4" />
        <div
          className="border-border h-1 w-5 rounded-sm border"
          style={{ backgroundColor: bgColor || "transparent" }}
        />
      </Button>
    </ColorSwatchPicker>
  );
}
