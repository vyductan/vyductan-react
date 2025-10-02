import type { BaseSelection } from "lexical";
import { useCallback, useMemo, useState } from "react";
import { Color, ColorPicker } from "@/components/ui/color-picker";
import {
  $getSelectionStyleValueForProperty,
  $patchStyleText,
} from "@lexical/selection";
import { $getSelection, $isRangeSelection } from "lexical";

import { useToolbarContext } from "../../context/toolbar-context";
import { useUpdateToolbarHandler } from "../../editor-hooks/use-update-toolbar";

export function FontColorToolbarPlugin() {
  const { activeEditor } = useToolbarContext();

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
          const selection = $getSelection();
          if (selection !== null) {
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
      return new Color(fontColor);
    } catch {
      return;
    }
  }, [fontColor]);

  const onFontColorSelect = useCallback(
    (color?: Color) => {
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

  return <ColorPicker value={currentColor} onChange={onFontColorSelect} />;
}
