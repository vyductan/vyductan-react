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
import { PaintBucketIcon } from "lucide-react";

import { Button } from "@acme/ui/components/button";

import { useEditorColorPalette } from "../../context/color-palette-context";
import { useToolbarContext } from "../../context/toolbar-context";
import { useUpdateToolbarHandler } from "../../editor-hooks/use-update-toolbar";
import { EditorColorChooser } from "./editor-color-chooser";

export function FontBackgroundToolbarPlugin() {
  const { activeEditor } = useToolbarContext();
  const palette = useEditorColorPalette();
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
    <EditorColorChooser
      kind="highlight"
      value={bgColor}
      onSelect={onBackgroundColorSelect}
      onOpenChange={onOpenChange}
    >
      <Button
        variant="ghost"
        size="sm"
        className="flex h-8 w-8 flex-col gap-0 p-0"
        title="Highlight Color"
      >
        <PaintBucketIcon className="h-4 w-4" />
        <div
          className="h-1 w-5 rounded-sm border border-border"
          style={{ backgroundColor: bgColor || "transparent" }}
        />
      </Button>
    </EditorColorChooser>
  );
}
