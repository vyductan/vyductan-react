import type { BaseSelection, RangeSelection } from "lexical";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  $getSelectionStyleValueForProperty,
  $patchStyleText,
} from "@lexical/selection";
import { $getSelection, $isRangeSelection, $setSelection } from "lexical";
import { BaselineIcon } from "lucide-react";

import { Button } from "@acme/ui/components/button";
import { ColorPicker } from "@acme/ui/components/color-picker";
import { AggregationColor } from "@acme/ui/components/color-picker/color";

import { ColorPicker } from "@acme/ui/components/color-picker";
import { AggregationColor } from "@acme/ui/components/color-picker/color";

import { useToolbarContext } from "../../context/toolbar-context";
import { useUpdateToolbarHandler } from "../../editor-hooks/use-update-toolbar";

export function FontColorToolbarPlugin() {
  const { activeEditor } = useToolbarContext();
  const selectionRef = useRef<RangeSelection | null>(null);

  const [fontColor, setFontColor] = useState("#000000");

  const $updateToolbar = (selection: BaseSelection) => {
    if ($isRangeSelection(selection)) {
      setFontColor(
        $getSelectionStyleValueForProperty(selection, "color", "#000"),
      );
    }
  };

  useUpdateToolbarHandler($updateToolbar);

  const applyStyleText = useCallback(
    (styles: Record<string, string>, skipHistoryStack?: boolean) => {
      activeEditor.update(
        () => {
          let selection = $getSelection();
          if (!selection && selectionRef.current) {
            $setSelection(selectionRef.current);
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

  const currentColor = useMemo(() => {
    try {
      return new AggregationColor(fontColor);
    } catch {
      return;
    }
  }, [fontColor]);

  const onFontColorSelect = useCallback(
    (color?: AggregationColor) => {
      const nextColor = color?.toHexString();

      if (!nextColor) {
        applyStyleText({ color: "" });
        setFontColor("#000000");
        return;
      }

      setFontColor(nextColor);
      applyStyleText({ color: nextColor });
    },
    [applyStyleText],
  );

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        activeEditor.getEditorState().read(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selectionRef.current = selection.clone();
          }
        });
      }
    },
    [activeEditor],
  );

  return (
    <ColorPicker
      value={currentColor}
      onChange={onFontColorSelect}
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
          className="h-1 w-5 rounded-sm border border-gray-200"
          style={{ backgroundColor: fontColor }}
        />
      </Button>
    </ColorPicker>
  );
}
