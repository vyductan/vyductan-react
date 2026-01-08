import type { BaseSelection } from "lexical";
import { useCallback, useMemo, useState } from "react";
import {
  $getSelectionStyleValueForProperty,
  $patchStyleText,
} from "@lexical/selection";
import { $getSelection, $isRangeSelection } from "lexical";

import { ColorPicker } from "@acme/ui/components/color-picker";
import { AggregationColor } from "@acme/ui/components/color-picker/color";

import { useToolbarContext } from "../../context/toolbar-context";
import { useUpdateToolbarHandler } from "../../editor-hooks/use-update-toolbar";

export function FontBackgroundToolbarPlugin() {
  const { activeEditor } = useToolbarContext();

  const [bgColor, setBgColor] = useState("#ffffff");

  const $updateToolbar = (selection: BaseSelection) => {
    if ($isRangeSelection(selection)) {
      setBgColor(
        $getSelectionStyleValueForProperty(
          selection,
          "background-color",
          "#fff",
        ),
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
      return new AggregationColor(bgColor);
    } catch {
      return;
    }
  }, [bgColor]);

  const onFontColorSelect = useCallback(
    (color?: AggregationColor) => {
      const nextColor = color?.toHexString();

      if (!nextColor) {
        applyStyleText({ color: "" });
        setBgColor("#000000");
        return;
      }

      setBgColor(nextColor);
      applyStyleText({ color: nextColor });
    },
    [applyStyleText],
  );

  return <ColorPicker value={currentColor} onChange={onFontColorSelect} />;
}
