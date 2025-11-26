/**
 * File Attachment Component
 * 
 * Component để render file attachment card trong editor
 */

import type { NodeKey } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
} from "lexical";
import { useEffect } from "react";
import {
  DownloadIcon,
  FileIcon,
  FileTextIcon,
  ImageIcon,
  PresentationIcon,
  SheetIcon,
  ArchiveIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { $isFileAttachmentNode } from "../nodes/file-attachment-node";

interface FileAttachmentComponentProps {
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  description?: string;
  nodeKey: NodeKey;
}

function getFileIcon(mimeType?: string): JSX.Element {
  if (!mimeType) {
    return <FileIcon className="size-5" />;
  }

  if (mimeType.startsWith("image/")) {
    return <ImageIcon className="size-5" />;
  }
  if (mimeType.includes("pdf")) {
    return <FileTextIcon className="size-5" />;
  }
  if (
    mimeType.includes("word") ||
    mimeType.includes("document") ||
    mimeType.includes("docx") ||
    mimeType.includes("doc")
  ) {
    return <FileTextIcon className="size-5" />;
  }
  if (
    mimeType.includes("excel") ||
    mimeType.includes("spreadsheet") ||
    mimeType.includes("xlsx") ||
    mimeType.includes("xls")
  ) {
    return <SheetIcon className="size-5" />;
  }
  if (
    mimeType.includes("powerpoint") ||
    mimeType.includes("presentation") ||
    mimeType.includes("pptx") ||
    mimeType.includes("ppt")
  ) {
    return <PresentationIcon className="size-5" />;
  }
  if (mimeType.includes("zip") || mimeType.includes("archive")) {
    return <ArchiveIcon className="size-5" />;
  }

  return <FileIcon className="size-5" />;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileAttachmentComponent({
  fileName,
  fileUrl,
  fileSize,
  mimeType,
  description,
  nodeKey,
}: FileAttachmentComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);

  const onDelete = (event: KeyboardEvent) => {
    if (isSelected && $isNodeSelection($getSelection())) {
      event.preventDefault();
      const node = $getNodeByKey(nodeKey);
      if ($isFileAttachmentNode(node)) {
        node.remove();
      }
      setSelected(false);
    }
    return false;
  };

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CLICK_COMMAND,
        (event: MouseEvent) => {
          const target = event.target as HTMLElement;
          // Don't select if clicking on download button
          if (target.closest("button")) {
            return false;
          }
          if (target.closest('[data-lexical-file-attachment]')) {
            if (event.shiftKey) {
              setSelected(!isSelected);
            } else {
              clearSelection();
              setSelected(true);
            }
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(KEY_DELETE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [clearSelection, editor, isSelected, setSelected]);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      data-lexical-file-attachment
      className={`my-2 flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-colors ${
        isSelected ? "ring-2 ring-blue-500" : "hover:bg-gray-50"
      }`}
    >
      <div className="flex-shrink-0 text-gray-400">
        {getFileIcon(mimeType)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-gray-900">{fileName}</div>
        {description && (
          <div className="mt-1 text-sm text-gray-500">{description}</div>
        )}
        {fileSize && (
          <div className="mt-1 text-xs text-gray-400">
            {formatFileSize(fileSize)}
          </div>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        className="flex-shrink-0"
      >
        <DownloadIcon className="size-4" />
        <span className="ml-1">Download</span>
      </Button>
    </div>
  );
}

