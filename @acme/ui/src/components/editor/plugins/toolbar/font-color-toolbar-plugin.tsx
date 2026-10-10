import type { BaseSelection, RangeSelection } from "lexical";
import { useCallback, useRef, useState } from "react";
import {
  $getSelectionStyleValueForProperty,
  $patchStyleText,
} from "@lexical/selection";
import {
  $getSelection,
  $isRangeSelection,
  $setSelection,
  SKIP_DOM_SELECTION_TAG,
} from "lexical";
import { BaselineIcon } from "lucide-react";

import { Button } from "@acme/ui/components/button";

import { useEditorColorPalette } from "../../context/color-palette-context";
import { useToolbarContext } from "../../context/toolbar-context";
import { useUpdateToolbarHandler } from "../../editor-hooks/use-update-toolbar";
import { EditorColorChooser } from "./editor-color-chooser";

export function FontColorToolbarPlugin() {
  const { activeEditor } = useToolbarContext();
  const palette = useEditorColorPalette();
  const selectionReference = useRef<RangeSelection | null>(null);

  // Empty means "inherit the page color" rather than any particular color, so
  // untouched text keeps following the theme instead of being pinned to black.
  const [fontColor, setFontColor] = useState("");

  const $updateToolbar = (selection: BaseSelection) => {
    if ($isRangeSelection(selection)) {
      setFontColor($getSelectionStyleValueForProperty(selection, "color", ""));
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
        {
          tag: [
            ...(skipHistoryStack ? ["historic"] : []),
            // The free picker keeps the focus while a color is typed or
            // dragged: putting the editor's selection back in the DOM took
            // it, and the rest of a hex code was typed over the text.
            ...(palette === "free" ? [SKIP_DOM_SELECTION_TAG] : []),
          ],
        },
      );
    },
    [activeEditor, palette],
  );

  const onFontColorSelect = useCallback(
    (color: string | undefined) => {
      setFontColor(color ?? "");
      applyStyleText({ color: color ?? "" });
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
    <EditorColorChooser
      kind="text"
      value={fontColor}
      onSelect={onFontColorSelect}
      onOpenChange={onOpenChange}
    >
      <Button
        variant="ghost"
        size="sm"
        className="flex h-8 w-8 flex-col gap-0 p-0"
        title="Text Color"
      >
        <BaselineIcon className="h-4 w-4" />
        <div
          className="h-1 w-5 rounded-sm border border-border"
          style={{ backgroundColor: fontColor || "transparent" }}
        />
      </Button>
    </EditorColorChooser>
  );
}
