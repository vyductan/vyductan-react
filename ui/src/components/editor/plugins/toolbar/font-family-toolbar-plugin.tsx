import type { BaseSelection } from "lexical";
import { useCallback, useState } from "react";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
} from "@/components/ui/select";
import {
  $getSelectionStyleValueForProperty,
  $patchStyleText,
} from "@lexical/selection";
import { $getSelection, $isRangeSelection } from "lexical";
import { TypeIcon } from "lucide-react";

import { useToolbarContext } from "../../context/toolbar-context";
import { useUpdateToolbarHandler } from "../../editor-hooks/use-update-toolbar";

const FONT_FAMILY_OPTIONS = [
  "System Default",
  "Inter",
  "Roboto",
  "Arial",
  "Verdana",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Trebuchet MS",
];

// Map display names to actual font-family values
const FONT_FAMILY_MAP: Record<string, string> = {
  "System Default":
    'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  Inter: '"Inter", ui-sans-serif, system-ui, sans-serif',
  Roboto: '"Roboto", ui-sans-serif, system-ui, sans-serif',
  Arial: "Arial, sans-serif",
  Verdana: "Verdana, sans-serif",
  Georgia: "Georgia, serif",
  "Times New Roman": '"Times New Roman", serif',
  "Courier New": '"Courier New", monospace',
  "Trebuchet MS": '"Trebuchet MS", sans-serif',
};

const DEFAULT_FONT = "System Default";

export function FontFamilyToolbarPlugin() {
  const style = "font-family";
  const [fontFamily, setFontFamily] = useState(DEFAULT_FONT);

  const { activeEditor } = useToolbarContext();

  const $updateToolbar = (selection: BaseSelection) => {
    if ($isRangeSelection(selection)) {
      const currentFont = $getSelectionStyleValueForProperty(
        selection,
        "font-family",
        FONT_FAMILY_MAP[DEFAULT_FONT],
      );
      // Find matching display name
      const displayName =
        Object.entries(FONT_FAMILY_MAP).find(
          ([, value]) => value === currentFont,
        )?.[0] ?? DEFAULT_FONT;
      setFontFamily(displayName);
    }
  };

  useUpdateToolbarHandler($updateToolbar);

  const handleClick = useCallback(
    (option: string) => {
      activeEditor.update(() => {
        const selection = $getSelection();
        if (selection !== null) {
          const fontValue = FONT_FAMILY_MAP[option] ?? FONT_FAMILY_MAP[DEFAULT_FONT];
          $patchStyleText(selection, {
            [style]: fontValue,
          });
        }
      });
    },
    [activeEditor, style],
  );

  const buttonAriaLabel = "Formatting options for font family";

  return (
    <SelectRoot
      value={fontFamily}
      onValueChange={(value) => {
        setFontFamily(value);
        handleClick(value);
      }}
      aria-label={buttonAriaLabel}
    >
      <SelectTrigger className="h-8 w-min gap-1">
        <TypeIcon className="size-4" />
        <span>{fontFamily}</span>
      </SelectTrigger>
      <SelectContent>
        {FONT_FAMILY_OPTIONS.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
}
