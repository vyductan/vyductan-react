/**
 * File Attachment Plugin
 *
 * Plugin để upload và attach files (PDF, DOCX, XLSX, etc.) vào Lexical editor
 * Hỗ trợ:
 * - Upload file từ máy tính
 * - Insert file từ URL
 */

import type { LexicalCommand, LexicalEditor } from "lexical";
import type { JSX } from "react";
import { useEffect, useRef, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement } from "@lexical/utils";
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
} from "lexical";

import { Button } from "@acme/ui/components/button";
import { Input } from "@acme/ui/components/input";
import { Label } from "@acme/ui/components/label";
import { DialogFooter } from "@acme/ui/components/modal";
import {
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from "@acme/ui/components/tabs";

import type { FileAttachmentPayload } from "../nodes/file-attachment-node";
import {
  $createFileAttachmentNode,
  FileAttachmentNode,
} from "../nodes/file-attachment-node";

export type InsertFileAttachmentPayload = Readonly<FileAttachmentPayload>;

export const INSERT_FILE_ATTACHMENT_COMMAND: LexicalCommand<InsertFileAttachmentPayload> =
  createCommand("INSERT_FILE_ATTACHMENT_COMMAND");

export function InsertFileAttachmentUriDialogBody({
  onClick,
}: {
  onClick: (payload: FileAttachmentPayload) => void;
}) {
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [description, setDescription] = useState("");

  const isDisabled = fileUrl === "" || fileName === "";

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="file-url">File URL</Label>
        <Input
          id="file-url"
          placeholder="i.e. https://example.com/document.pdf"
          onChange={(e) => setFileUrl(e.target.value)}
          value={fileUrl}
          data-test-id="file-attachment-modal-url-input"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="file-name">File Name</Label>
        <Input
          id="file-name"
          placeholder="document.pdf"
          onChange={(e) => setFileName(e.target.value)}
          value={fileName}
          data-test-id="file-attachment-modal-name-input"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="file-description">Description (Optional)</Label>
        <Input
          id="file-description"
          placeholder="File description"
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          data-test-id="file-attachment-modal-description-input"
        />
      </div>
      <DialogFooter>
        <Button
          type="submit"
          disabled={isDisabled}
          onClick={() =>
            onClick({
              fileName,
              fileUrl,
              description: description || undefined,
            })
          }
          data-test-id="file-attachment-modal-confirm-btn"
        >
          Confirm
        </Button>
      </DialogFooter>
    </div>
  );
}

export function InsertFileAttachmentUploadedDialogBody({
  onClick,
  onFileUpload,
}: {
  onClick: (payload: FileAttachmentPayload) => void;
  onFileUpload?: (file: File) => Promise<string>;
}) {
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileSize, setFileSize] = useState<number | undefined>();
  const [mimeType, setMimeType] = useState<string | undefined>();
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      alert("File size must be less than 50MB");
      return;
    }

    setIsUploading(true);

    try {
      if (onFileUpload) {
        // Upload to Supabase
        const uploadedUrl = await onFileUpload(file);
        setFileUrl(uploadedUrl);
        setFileName(file.name);
        setFileSize(file.size);
        setMimeType(file.type);
      } else {
        // Fallback: Read file as data URL
        const reader = new FileReader();
        reader.addEventListener("load", (event) => {
          const result = event.target?.result as string;
          setFileUrl(result);
          setFileName(file.name);
          setFileSize(file.size);
          setMimeType(file.type);
        });
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error("Failed to upload file:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const isDisabled = fileUrl === "" || fileName === "";

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="file-upload">Upload File</Label>
        <Input
          id="file-upload"
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          disabled={isUploading}
          data-test-id="file-attachment-modal-upload-input"
        />
        <p className="text-xs text-gray-500">
          {isUploading
            ? "Uploading file..."
            : "Supported: PDF, DOCX, XLSX, PPTX, ZIP, etc. (Max 50MB)"}
        </p>
      </div>
      {fileUrl && (
        <>
          <div className="grid gap-2">
            <Label htmlFor="file-name-upload">File Name</Label>
            <Input
              id="file-name-upload"
              placeholder="File name"
              onChange={(e) => setFileName(e.target.value)}
              value={fileName}
              data-test-id="file-attachment-modal-name-upload-input"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="file-description-upload">
              Description (Optional)
            </Label>
            <Input
              id="file-description-upload"
              placeholder="File description"
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              data-test-id="file-attachment-modal-description-upload-input"
            />
          </div>
        </>
      )}
      <DialogFooter>
        <Button
          type="submit"
          disabled={isDisabled || isUploading}
          onClick={() =>
            onClick({
              fileName,
              fileUrl,
              fileSize,
              mimeType,
              description: description || undefined,
            })
          }
          data-test-id="file-attachment-modal-confirm-upload-btn"
        >
          {isUploading ? "Uploading..." : "Confirm"}
        </Button>
      </DialogFooter>
    </div>
  );
}

export function InsertFileAttachmentDialog({
  activeEditor,
  onClose,
  onFileUpload,
}: {
  activeEditor: LexicalEditor;
  onClose: () => void;
  onFileUpload?: (file: File) => Promise<string>;
}): JSX.Element {
  const handleClick = (payload: FileAttachmentPayload) => {
    activeEditor.dispatchCommand(INSERT_FILE_ATTACHMENT_COMMAND, payload);
    onClose();
  };

  return (
    <TabsRoot defaultValue="upload" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="upload">Upload</TabsTrigger>
        <TabsTrigger value="url">URL</TabsTrigger>
      </TabsList>
      <TabsContent value="upload">
        <InsertFileAttachmentUploadedDialogBody
          onClick={handleClick}
          onFileUpload={onFileUpload}
        />
      </TabsContent>
      <TabsContent value="url">
        <InsertFileAttachmentUriDialogBody onClick={handleClick} />
      </TabsContent>
    </TabsRoot>
  );
}

export function FileAttachmentPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([FileAttachmentNode])) {
      throw new Error(
        "FileAttachmentPlugin: FileAttachmentNode not registered on editor",
      );
    }

    return editor.registerCommand<InsertFileAttachmentPayload>(
      INSERT_FILE_ATTACHMENT_COMMAND,
      (payload) => {
        const fileAttachmentNode = $createFileAttachmentNode(payload);
        $insertNodes([fileAttachmentNode]);
        if ($isRootOrShadowRoot(fileAttachmentNode.getParentOrThrow())) {
          $wrapNodeInElement(
            fileAttachmentNode,
            $createParagraphNode,
          ).selectEnd();
        }

        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return null;
}
