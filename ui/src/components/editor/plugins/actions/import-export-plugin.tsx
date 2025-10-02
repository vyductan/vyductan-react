import { Button } from "@/components/ui/button";
import {
  TooltipContent,
  TooltipRoot,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { exportFile, importFile } from "@lexical/file";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { DownloadIcon, UploadIcon } from "lucide-react";

export function ImportExportPlugin() {
  const [editor] = useLexicalComposerContext();
  return (
    <>
      <TooltipRoot>
        <TooltipTrigger asChild>
          <Button
            variant="text"
            onClick={() => importFile(editor)}
            title="Import"
            aria-label="Import editor state from JSON"
            size={"sm"}
            className="p-2"
          >
            <UploadIcon className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Import Content</TooltipContent>
      </TooltipRoot>

      <TooltipRoot>
        <TooltipTrigger asChild>
          <Button
            variant="text"
            onClick={() =>
              exportFile(editor, {
                fileName: `Playground ${new Date().toISOString()}`,
                source: "Playground",
              })
            }
            title="Export"
            aria-label="Export editor state to JSON"
            size={"sm"}
            className="p-2"
          >
            <DownloadIcon className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Export Content</TooltipContent>
      </TooltipRoot>
    </>
  );
}
