import { SelectItem } from "@/components/ui/select";
import { $setBlocksType } from "@lexical/selection";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
} from "lexical";

import { useToolbarContext } from "../../../context/toolbar-context";
import { blockTypeToBlockName } from "../../../plugins/toolbar/block-format/block-format-data";

const BLOCK_FORMAT_VALUE = "paragraph";

export function FormatParagraph() {
  const { activeEditor, formatHandledRef } = useToolbarContext();

  const formatParagraph = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    formatHandledRef.current = true;
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  return (
    <SelectItem value={BLOCK_FORMAT_VALUE} onSelect={formatParagraph}>
      <div className="flex items-center gap-1 font-normal">
        {blockTypeToBlockName[BLOCK_FORMAT_VALUE]?.icon}
        {blockTypeToBlockName[BLOCK_FORMAT_VALUE]?.label}
      </div>
    </SelectItem>
  );
}
