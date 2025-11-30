import type { HeadingTagType } from "@lexical/rich-text";
import { SelectItem } from "@acme/ui/components/select";
import { $createHeadingNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $getSelection } from "lexical";

import { useToolbarContext } from "../../../context/toolbar-context";
import { blockTypeToBlockName } from "../../../plugins/toolbar/block-format/block-format-data";

export function FormatHeading({ levels = [] }: { levels: HeadingTagType[] }) {
  const { activeEditor, blockType, formatHandledRef } = useToolbarContext();

  const formatHeading = (headingSize: HeadingTagType) => (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    formatHandledRef.current = true;
    if (blockType !== headingSize) {
      activeEditor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createHeadingNode(headingSize));
      });
    }
  };

  return levels.map((level) => (
    <SelectItem
      key={level}
      value={level}
      onSelect={formatHeading(level)}
    >
      <div className="flex items-center gap-1 font-normal">
        {blockTypeToBlockName[level]?.icon}
        {blockTypeToBlockName[level]?.label}
      </div>
    </SelectItem>
  ));
}
