/**
 * Video Plugin
 * 
 * Plugin để upload và insert video files vào Lexical editor
 * Hỗ trợ:
 * - Upload video file (MP4, WebM, etc.)
 * - Insert video từ URL
 */

import type { LexicalCommand, LexicalEditor } from "lexical";
import type { JSX } from "react";
import { useEffect, useRef, useState } from "react";
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
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $insertNodeToNearestRoot, $wrapNodeInElement } from "@lexical/utils";
import {
  $createParagraphNode,
  $getSelection,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
} from "lexical";

import type { VideoPayload } from "../nodes/video-node";
import { $createVideoNode, VideoNode } from "../nodes/video-node";

export type InsertVideoPayload = Readonly<VideoPayload>;

export const INSERT_VIDEO_COMMAND: LexicalCommand<InsertVideoPayload> =
  createCommand("INSERT_VIDEO_COMMAND");

export function InsertVideoUriDialogBody({
  onClick,
}: {
  onClick: (payload: InsertVideoPayload) => void;
}) {
  const [src, setSrc] = useState("");
  const [altText, setAltText] = useState("");

  const isDisabled = src === "";

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="video-url">Video URL</Label>
        <Input
          id="video-url"
          placeholder="i.e. https://example.com/video.mp4"
          onChange={(e) => setSrc(e.target.value)}
          value={src}
          data-test-id="video-modal-url-input"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="alt-text">Alt Text</Label>
        <Input
          id="alt-text"
          placeholder="Video description"
          onChange={(e) => setAltText(e.target.value)}
          value={altText}
          data-test-id="video-modal-alt-text-input"
        />
      </div>
      <DialogFooter>
        <Button
          type="submit"
          disabled={isDisabled}
          onClick={() => onClick({ altText: altText || "Video", src })}
          data-test-id="video-modal-confirm-btn"
        >
          Confirm
        </Button>
      </DialogFooter>
    </div>
  );
}

export function InsertVideoUploadedDialogBody({
  onClick,
}: {
  onClick: (payload: InsertVideoPayload) => void;
}) {
  const [src, setSrc] = useState("");
  const [altText, setAltText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
    if (!validTypes.some((type) => file.type.startsWith(type.split("/")[0]!))) {
      alert("Please select a valid video file (MP4, WebM, OGG, etc.)");
      return;
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      alert("Video file size must be less than 100MB");
      return;
    }

    // Read file as data URL
    const reader = new FileReader();
    reader.addEventListener("load", (event) => {
      const result = event.target?.result as string;
      setSrc(result);
      setAltText(file.name);
    });
    reader.readAsDataURL(file);
  };

  const isDisabled = src === "";

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="video-upload">Upload Video</Label>
        <Input
          id="video-upload"
          type="file"
          accept="video/*"
          ref={fileInputRef}
          onChange={handleFileUpload}
          data-test-id="video-modal-upload-input"
        />
        <p className="text-xs text-gray-500">
          Supported formats: MP4, WebM, OGG (Max 100MB)
        </p>
      </div>
      {src && (
        <div className="grid gap-2">
          <Label htmlFor="alt-text-upload">Alt Text</Label>
          <Input
            id="alt-text-upload"
            placeholder="Video description"
            onChange={(e) => setAltText(e.target.value)}
            value={altText}
            data-test-id="video-modal-alt-text-upload-input"
          />
        </div>
      )}
      <DialogFooter>
        <Button
          type="submit"
          disabled={isDisabled}
          onClick={() => onClick({ altText: altText || "Video", src })}
          data-test-id="video-modal-confirm-upload-btn"
        >
          Confirm
        </Button>
      </DialogFooter>
    </div>
  );
}

export function InsertVideoDialog({
  activeEditor,
  onClose,
}: {
  activeEditor: LexicalEditor;
  onClose: () => void;
}): JSX.Element {
  const handleClick = (payload: InsertVideoPayload) => {
    activeEditor.dispatchCommand(INSERT_VIDEO_COMMAND, payload);
    onClose();
  };

  return (
    <TabsRoot defaultValue="upload" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="upload">Upload</TabsTrigger>
        <TabsTrigger value="url">URL</TabsTrigger>
      </TabsList>
      <TabsContent value="upload">
        <InsertVideoUploadedDialogBody onClick={handleClick} />
      </TabsContent>
      <TabsContent value="url">
        <InsertVideoUriDialogBody onClick={handleClick} />
      </TabsContent>
    </TabsRoot>
  );
}

export function VideoPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([VideoNode])) {
      throw new Error("VideoPlugin: VideoNode not registered on editor");
    }

    return editor.registerCommand<InsertVideoPayload>(
      INSERT_VIDEO_COMMAND,
      (payload) => {
        const videoNode = $createVideoNode(payload);
        $insertNodes([videoNode]);
        if ($isRootOrShadowRoot(videoNode.getParentOrThrow())) {
          $wrapNodeInElement(videoNode, $createParagraphNode).selectEnd();
        }

        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return null;
}

