/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type { JSX } from "react";
import { useEffect, useRef } from "react";
import { $createLinkNode } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { DRAG_DROP_PASTE } from "@lexical/rich-text";
import { isMimeType, mediaFileReader, mergeRegister } from "@lexical/utils";
import {
  $createTextNode,
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  COMMAND_PRIORITY_LOW,
  PASTE_COMMAND,
} from "lexical";

import { message } from "../../message/message";
import { useImageResolver } from "../context/image-resolver-context";
import { preloadImage } from "../editor-hooks/use-suspense-image";
import { $createImageNode, $isImageNode } from "../nodes/image-node";
import {
  $insertImageNode,
  INSERT_IMAGE_COMMAND,
} from "../plugins/images-plugin";

const ACCEPTABLE_IMAGE_TYPES = [
  "image/",
  "image/heic",
  "image/heif",
  "image/gif",
  "image/webp",
];

interface DragDropPastePluginProps {
  onImageUpload?: (file: File) => Promise<string>;
}

export function DragDropPastePlugin({
  onImageUpload,
  anchorElem,
}: DragDropPastePluginProps & {
  anchorElem?: HTMLElement;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const resolveImage = useImageResolver();
  const targetLineRef = useRef<HTMLDivElement>(null);
  const targetBlockRef = useRef<HTMLDivElement>(null);
  const targetNodeKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const handleFiles = async (files: File[]) => {
      // If custom upload handler is provided, use it instead of base64
      if (onImageUpload) {
        for (const file of files) {
          if (isMimeType(file, ACCEPTABLE_IMAGE_TYPES)) {
            // 1. Create a local preview
            const reader = new FileReader();
            reader.addEventListener("load", () => {
              if (typeof reader.result === "string") {
                const src = reader.result;

                // 2. Insert image with loading state
                const nodeRef: { current: null | string } = { current: null };
                editor.update(() => {
                  // Get the target node from the ref
                  const targetKey = targetNodeKeyRef.current;
                  if (targetKey) {
                    const targetNode = $getNodeByKey(targetKey);
                    if (targetNode) {
                      // Create image node directly without inserting it
                      const imageNode = $createImageNode({
                        altText: file.name,
                        src,
                        loading: true,
                      });

                      // Insert after the target node
                      targetNode.insertAfter(imageNode);
                      nodeRef.current = imageNode.getKey();
                      return;
                    }
                  }

                  // Fallback to default insertion
                  const node = $insertImageNode({
                    altText: file.name,
                    src,
                    loading: true,
                  });
                  if (node) {
                    nodeRef.current = node.getKey();
                  }
                });

                // Clear the target ref after insertion
                targetNodeKeyRef.current = null;

                const imageKey = nodeRef.current;
                if (imageKey) {
                  const key = imageKey;
                  void (async () => {
                    let uploadedUrl: string | undefined;
                    try {
                      // 3. Upload image
                      uploadedUrl = await onImageUpload(file);

                      // 4. Preload the image to prevent flash/layout shift
                      await preloadImage(uploadedUrl, resolveImage);

                      // 5. Update image with remote URL and turn off loading
                      editor.update(() => {
                        const node = $getNodeByKey(key);
                        if ($isImageNode(node) && uploadedUrl) {
                          node.setSrc(uploadedUrl);
                          node.setLoading(false);
                        }
                      });
                    } catch (error) {
                      console.error("Failed to upload image:", error);

                      // Handle error: Replace with file link
                      editor.update(() => {
                        const node = $getNodeByKey(key);
                        if ($isImageNode(node)) {
                          if (uploadedUrl) {
                            // Upload succeeded, but preload failed (likely not an image). Replace with link.
                            const linkNode = $createLinkNode(uploadedUrl);
                            linkNode.append($createTextNode(file.name));
                            node.replace(linkNode);
                          } else {
                            // Upload failed. Remove the loading image.
                            node.remove();
                            message.error(`Failed to upload ${file.name}`);
                          }
                        }
                      });
                    }
                  })();
                }
              }
            });
            reader.readAsDataURL(file);
          }
        }
      } else {
        // Fallback to base64 for backward compatibility
        const filesResult = await mediaFileReader(
          files,
          [ACCEPTABLE_IMAGE_TYPES].flat(),
        );
        for (const { file, result } of filesResult) {
          if (isMimeType(file, ACCEPTABLE_IMAGE_TYPES)) {
            editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
              altText: file.name,
              src: result,
            });
          }
        }
      }
    };

    return mergeRegister(
      editor.registerCommand(
        DRAG_DROP_PASTE,
        (files) => {
          void handleFiles(files);
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        PASTE_COMMAND,
        (event: ClipboardEvent) => {
          const { clipboardData } = event;
          if (!clipboardData) {
            return false;
          }

          // Check for files directly
          let files = [...clipboardData.files];

          // If no files found directly, check items for image types
          if (files.length === 0) {
            const items = [...clipboardData.items]
              .filter(
                (item) =>
                  item.kind === "file" &&
                  ACCEPTABLE_IMAGE_TYPES.some((type) =>
                    item.type.startsWith(type),
                  ),
              )
              .map((item) => item.getAsFile())
              .filter((file): file is File => file !== null);

            if (items.length > 0) {
              files = items;
            }
          }

          const imageFiles = files.filter(
            (file): file is File =>
              file instanceof File && isMimeType(file, ACCEPTABLE_IMAGE_TYPES),
          );

          if (imageFiles.length > 0) {
            event.preventDefault();
            void handleFiles(imageFiles);
            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, onImageUpload, resolveImage]);

  // Handle Drag & Drop Visual Indicator
  useEffect(() => {
    if (!anchorElem) return;

    const handleDragOver = (event: DragEvent) => {
      if (!event.dataTransfer?.types.includes("Files")) {
        return;
      }
      event.preventDefault(); // Necessary to allow dropping

      const target = event.target as Node | null;
      if (!target) return;

      const targetLine = targetLineRef.current;
      if (targetLine) {
        editor.read(() => {
          // Find the nearest block from the event target
          const node = $getNearestNodeFromDOMNode(target);
          if (node) {
            const element = editor.getElementByKey(node.getKey());
            if (element) {
              const rect = element.getBoundingClientRect();

              const anchorRect = anchorElem.getBoundingClientRect();

              // Store the target node key for insertion
              targetNodeKeyRef.current = node.getKey();

              // Position the line relative to the anchor element (container)
              targetLine.style.top = `${rect.bottom - anchorRect.top}px`;
              targetLine.style.left = `${rect.left - anchorRect.left}px`;
              targetLine.style.width = `${rect.width}px`;
              targetLine.style.opacity = "1";
            }
          }
        });
      }
    };

    const handleDragLeave = (event: DragEvent) => {
      // Only hide if leaving the anchor element bounds
      const relatedTarget = event.relatedTarget as HTMLElement | null;
      if (relatedTarget && anchorElem.contains(relatedTarget)) {
        return;
      }

      if (targetLineRef.current) {
        targetLineRef.current.style.opacity = "0";
      }
      targetNodeKeyRef.current = null;
    };

    const handleDrop = (event: DragEvent) => {
      event.preventDefault();
      if (targetLineRef.current) {
        targetLineRef.current.style.opacity = "0";
      }
      // Note: targetNodeKeyRef is cleared in handleFiles after insertion
      // Actual file handling is done by DRAG_DROP_PASTE command triggered by Lexical
    };

    anchorElem.addEventListener("dragover", handleDragOver);
    anchorElem.addEventListener("dragleave", handleDragLeave);
    anchorElem.addEventListener("drop", handleDrop);

    return () => {
      anchorElem.removeEventListener("dragover", handleDragOver);
      anchorElem.removeEventListener("dragleave", handleDragLeave);
      anchorElem.removeEventListener("drop", handleDrop);
    };
  }, [anchorElem, editor, onImageUpload, resolveImage]);

  return (
    <>
      <div
        ref={targetBlockRef}
        className="bg-primary/10 pointer-events-none absolute top-0 left-0 rounded transition-opacity duration-200"
        style={{ opacity: 0, zIndex: 90 }}
      />
      <div
        ref={targetLineRef}
        className="bg-primary pointer-events-none absolute top-0 left-0 h-1 rounded transition-opacity duration-200"
        style={{ opacity: 0, zIndex: 100 }}
      />
    </>
  );
}
