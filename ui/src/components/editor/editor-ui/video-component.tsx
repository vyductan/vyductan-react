/**
 * Video Component
 *
 * Component để render video element trong editor
 */

import type { NodeKey } from "lexical";
import { useCallback, useEffect, useRef } from "react";
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

import { $isVideoNode } from "../nodes/video-node";

interface VideoComponentProps {
  src: string;
  altText: string;
  width: "inherit" | number;
  height: "inherit" | number;
  controls: boolean;
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
  nodeKey: NodeKey;
}

export default function VideoComponent({
  src,
  altText: _altText,
  width,
  height,
  controls,
  autoplay,
  loop,
  muted,
  nodeKey,
}: VideoComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const onDelete = useCallback(
    (event: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        event.preventDefault();
        const node = $getNodeByKey(nodeKey);
        if ($isVideoNode(node)) {
          node.remove();
        }
        setSelected(false);
      }
      return false;
    },
    [isSelected, nodeKey, setSelected],
  );

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CLICK_COMMAND,
        (event: MouseEvent) => {
          const videoElement = videoRef.current;
          if (event.target === videoElement) {
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
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [clearSelection, editor, isSelected, setSelected, onDelete]);

  const style =
    width === "inherit" && height === "inherit"
      ? {}
      : {
          height: height === "inherit" ? "auto" : `${height}px`,
          maxWidth: "100%",
          width: width === "inherit" ? "100%" : `${width}px`,
        };

  return (
    <div
      className={`relative inline-block ${isSelected ? "ring-2 ring-blue-500" : ""}`}
    >
      <video
        ref={videoRef}
        src={src}
        controls={controls}
        autoPlay={autoplay}
        loop={loop}
        muted={muted}
        style={style}
        className="max-w-full rounded-lg"
      />
    </div>
  );
}
