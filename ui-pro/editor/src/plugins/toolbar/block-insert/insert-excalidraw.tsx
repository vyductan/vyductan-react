import { FrameIcon } from "lucide-react";

import { SelectItem } from "@acme/ui/select";

import { useToolbarContext } from "../../../context/toolbar-context";
import { INSERT_EXCALIDRAW_COMMAND } from "../../../plugins/excalidraw-plugin";

export function InsertExcalidraw() {
  const { activeEditor } = useToolbarContext();
  return (
    <SelectItem
      value="excalidraw"
      onPointerUp={() =>
        activeEditor.dispatchCommand(INSERT_EXCALIDRAW_COMMAND, undefined)
      }
      className=""
    >
      <div className="flex items-center gap-1">
        <FrameIcon className="size-4" />
        <span>Excalidraw</span>
      </div>
    </SelectItem>
  );
}
