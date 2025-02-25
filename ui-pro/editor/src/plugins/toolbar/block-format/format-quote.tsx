import { $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $getSelection } from "lexical";

import { SelectItem } from "@acme/ui/select";

import { useToolbarContext } from "../../../context/toolbar-context";
import { blockTypeToBlockName } from "../../../plugins/toolbar/block-format/block-format-data";

const BLOCK_FORMAT_VALUE = "quote";

export function FormatQuote() {
  const { activeEditor, blockType } = useToolbarContext();

  const formatQuote = () => {
    if (blockType !== "quote") {
      activeEditor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createQuoteNode());
      });
    }
  };

  return (
    <SelectItem value="quote" onPointerDown={formatQuote}>
      <div className="flex items-center gap-1 font-normal">
        {blockTypeToBlockName[BLOCK_FORMAT_VALUE]?.icon}
        {blockTypeToBlockName[BLOCK_FORMAT_VALUE]?.label}
      </div>
    </SelectItem>
  );
}
