import { SelectItem } from "@acme/ui/components/select";
import { INSERT_ORDERED_LIST_COMMAND } from "@lexical/list";
import { $setBlocksType } from "@lexical/selection";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
} from "lexical";

import { useToolbarContext } from "../../../context/toolbar-context";
import { blockTypeToBlockName } from "../../../plugins/toolbar/block-format/block-format-data";

const BLOCK_FORMAT_VALUE = "number";

export function FormatNumberedList() {
  const { activeEditor, blockType, formatHandledRef } = useToolbarContext();

  const formatParagraph = () => {
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const formatNumberedList = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    formatHandledRef.current = true;
    if (blockType === "number") {
      formatParagraph();
    } else {
      activeEditor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, void 0);
    }
  };

  return (
    <SelectItem value={BLOCK_FORMAT_VALUE} onSelect={formatNumberedList}>
      <div className="flex items-center gap-1 font-normal">
        {blockTypeToBlockName[BLOCK_FORMAT_VALUE]?.icon}
        {blockTypeToBlockName[BLOCK_FORMAT_VALUE]?.label}
      </div>
    </SelectItem>
  );
}
