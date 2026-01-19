import { INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list";
import { $setBlocksType } from "@lexical/selection";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
} from "lexical";

import { SelectItem } from "@acme/ui/components/select";

import { useToolbarContext } from "../../../context/toolbar-context";
import { blockTypeToBlockName } from "../../../plugins/toolbar/block-format/block-format-data";

const BLOCK_FORMAT_VALUE = "bullet";

export function FormatBulletedList() {
  const { activeEditor, blockType, formatHandledRef } = useToolbarContext();

  const formatParagraph = () => {
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const formatBulletedList = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Mark that format is being handled by onSelect
    formatHandledRef.current = true;
    if (blockType === "number") {
      formatParagraph();
    } else {
      activeEditor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, void 0);
    }
  };

  return (
    <SelectItem value={BLOCK_FORMAT_VALUE} onSelect={formatBulletedList}>
      <div className="flex items-center gap-1 font-normal">
        {blockTypeToBlockName[BLOCK_FORMAT_VALUE]?.icon}
        {blockTypeToBlockName[BLOCK_FORMAT_VALUE]?.label}
      </div>
    </SelectItem>
  );
}
