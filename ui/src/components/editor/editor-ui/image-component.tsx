/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type {
  BaseSelection,
  LexicalCommand,
  LexicalEditor,
  NodeKey,
} from "lexical";
import type { JSX } from "react";
import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalNestedComposer } from "@lexical/react/LexicalNestedComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  $setSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  createCommand,
  DRAGSTART_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";

import {
  clearImageCache,
  useSuspenseImage,
} from "../editor-hooks/use-suspense-image";
import { ContentEditable } from "../editor-ui/content-editable";
import { ImageContextMenu } from "../editor-ui/image-context-menu";
import { ImageResizer } from "../editor-ui/image-resizer";
import { $isImageNode } from "../nodes/image-node";
// import brokenImage from '../images/image-broken.svg';
import { EmojisPlugin } from "../plugins/emojis-plugin";
import { KeywordsPlugin } from "../plugins/keywords-plugin";
import { LinkPlugin } from "../plugins/link-plugin";
import { MentionsPlugin } from "../plugins/mentions-plugin";
import { ImagePreview } from "./image-preview";

export const RIGHT_CLICK_IMAGE_COMMAND: LexicalCommand<MouseEvent> =
  createCommand("RIGHT_CLICK_IMAGE_COMMAND");

function LazyImage({
  altText,
  className,
  imageRef,
  src,
  width,
  height,
  maxWidth: _maxWidth,
  onError,
  onContextMenu,
  onDoubleClick,
}: {
  altText: string;
  className: string | null;
  height: "inherit" | number;
  imageRef: { current: null | HTMLImageElement };
  maxWidth: number;
  src: string;
  width: "inherit" | number;
  onError: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onDoubleClick: (e: React.MouseEvent) => void;
}): JSX.Element {
  const resolvedSrc = useSuspenseImage(src);
  return (
    <picture>
      <img
        className={className ?? undefined}
        src={resolvedSrc}
        alt={altText}
        ref={imageRef}
        style={{
          height: height === "inherit" ? "auto" : height,
          maxWidth: "100%",
          width: width === "inherit" ? "100%" : width,
          objectFit: "contain",
        }}
        onError={onError}
        draggable="false"
        onContextMenu={onContextMenu}
        onDoubleClick={(e) => {
          e.stopPropagation();
          // Prevent other double click handlers
          onDoubleClick(e);
        }}
      />
    </picture>
  );
}

function BrokenImage(): JSX.Element {
  return (
    <div
      className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-100"
      style={{
        height: 200,
        width: 200,
      }}
    >
      <div className="flex flex-col items-center gap-2 p-4 text-center">
        <svg
          className="h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="text-sm text-gray-500">Image failed to load</span>
      </div>
    </div>
  );
}

class ImageErrorBoundary extends React.Component<
  {
    children: JSX.Element;
    fallback: JSX.Element;
    onError?: (error: unknown) => void;
  },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default function ImageComponent({
  src,
  altText,
  nodeKey,
  width,
  height,
  maxWidth,
  resizable,
  showCaption,
  caption,
  captionsEnabled,
  loading,
}: {
  altText: string;
  caption: LexicalEditor;
  height: "inherit" | number;
  maxWidth: number;
  nodeKey: NodeKey;
  resizable: boolean;
  showCaption: boolean;
  src: string;
  width: "inherit" | number;
  captionsEnabled: boolean;
  loading?: boolean;
}): JSX.Element {
  const imageRef = useRef<null | HTMLImageElement>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [editor] = useLexicalComposerContext();
  const [selection, setSelection] = useState<BaseSelection | null>(null);
  const activeEditorRef = useRef<LexicalEditor | null>(null);
  const [isLoadError, setIsLoadError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
  } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const isEditable = useLexicalEditable();

  const $onDelete = useCallback(
    (payload: KeyboardEvent) => {
      const deleteSelection = $getSelection();
      if (isSelected && $isNodeSelection(deleteSelection)) {
        const event: KeyboardEvent = payload;
        event.preventDefault();
        editor.update(() => {
          for (const node of deleteSelection.getNodes()) {
            if ($isImageNode(node)) {
              node.remove();
            }
          }
        });
      }
      return false;
    },
    [editor, isSelected],
  );

  const $onEnter = useCallback(
    (event: KeyboardEvent) => {
      const latestSelection = $getSelection();
      const buttonElem = buttonRef.current;
      if (
        isSelected &&
        $isNodeSelection(latestSelection) &&
        latestSelection.getNodes().length === 1
      ) {
        if (showCaption) {
          // Move focus into nested editor
          $setSelection(null);
          event.preventDefault();
          caption.focus();
          return true;
        } else if (
          buttonElem !== null &&
          buttonElem !== document.activeElement
        ) {
          event.preventDefault();
          buttonElem.focus();
          return true;
        }
      }
      return false;
    },
    [caption, isSelected, showCaption],
  );

  const $onEscape = useCallback(
    (event: KeyboardEvent) => {
      if (
        activeEditorRef.current === caption ||
        buttonRef.current === event.target
      ) {
        $setSelection(null);
        editor.update(() => {
          setSelected(true);
          const parentRootElement = editor.getRootElement();
          if (parentRootElement !== null) {
            parentRootElement.focus();
          }
        });
        return true;
      }
      return false;
    },
    [caption, editor, setSelected],
  );

  const onClick = useCallback(
    (payload: MouseEvent) => {
      const event = payload;

      if (isResizing) {
        return true;
      }
      if (event.target === imageRef.current) {
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
    [isResizing, isSelected, setSelected, clearSelection],
  );

  const onRightClick = useCallback(
    (
      event: React.MouseEvent<HTMLDivElement> | React.MouseEvent<Element>,
    ): void => {
      event.preventDefault();
      setContextMenu({
        isOpen: true,
        position: { x: event.clientX, y: event.clientY },
      });
    },
    [],
  );

  // Attach contextmenu event listener to prevent default browser menu

  useEffect(() => {
    let isMounted = true;
    // const rootElement = editor.getRootElement();
    const unregister = mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        if (isMounted) {
          setSelection(editorState.read(() => $getSelection()));
        }
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_, activeEditor) => {
          activeEditorRef.current = activeEditor;
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        onClick,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand<MouseEvent>(
        RIGHT_CLICK_IMAGE_COMMAND,
        onClick,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        DRAGSTART_COMMAND,
        (event) => {
          if (event.target === imageRef.current) {
            // TODO This is just a temporary workaround for FF to behave like other browsers.
            // Ideally, this handles drag & drop too (and all browsers).
            event.preventDefault();
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        $onDelete,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        $onDelete,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(KEY_ENTER_COMMAND, $onEnter, COMMAND_PRIORITY_LOW),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        $onEscape,
        COMMAND_PRIORITY_LOW,
      ),
    );

    return () => {
      isMounted = false;
      unregister();
    };
  }, [
    clearSelection,
    editor,
    isResizing,
    isSelected,
    nodeKey,
    $onDelete,
    $onEnter,
    $onEscape,
    onClick,
    onRightClick,
    setSelected,
  ]);

  const setShowCaption = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        node.setShowCaption(true);
      }
    });
  }, [editor, nodeKey]);

  const onResizeEnd = (
    nextWidth: "inherit" | number,
    nextHeight: "inherit" | number,
  ) => {
    // Delay hiding the resize bars for click case
    setTimeout(() => {
      setIsResizing(false);
    }, 200);

    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        node.setWidthAndHeight(nextWidth, nextHeight);
      }
    });
  };

  const onResizeStart = () => {
    setIsResizing(true);
  };

  // Context menu handlers
  const handleReplace = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.addEventListener("change", (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // TODO: Upload new image and replace node's src
        // This requires access to the onImageUpload callback
        // For now, just create a local URL
        const reader = new FileReader();
        reader.addEventListener("load", (event) => {
          const newSrc = event.target?.result as string;
          editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if ($isImageNode(node)) {
              node.setSrc(newSrc);
            }
          });
        });
        reader.readAsDataURL(file);
      }
    });
    input.click();
  }, [editor, nodeKey]);

  const handleCopy = useCallback(async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
    } catch (error) {
      console.error("Failed to copy image:", error);
    }
  }, [src]);

  const handleDownload = useCallback(() => {
    const link = document.createElement("a");
    link.href = src;
    link.download = altText || "image";
    link.click();
  }, [src, altText]);

  const handleCaptionToggle = useCallback(() => {
    setShowCaption();
  }, [setShowCaption]);

  const handleDelete = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        node.remove();
      }
    });
  }, [editor, nodeKey]);

  const handleImageError = useCallback(() => {
    if (retryCount < 1) {
      clearImageCache(src);

      setRetryCount((prev) => prev + 1);
    } else {
      setIsLoadError(true);
    }
  }, [retryCount, src]);

  const draggable = isSelected && $isNodeSelection(selection) && !isResizing;
  const isFocused = (isSelected || isResizing) && isEditable;
  return (
    <Suspense
      fallback={
        <div
          className="relative overflow-hidden rounded-lg"
          style={{
            width: width === "inherit" ? "100%" : width,
            height: height === "inherit" ? 200 : height,
            maxWidth,
            background: "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)",
          }}
        >
          {/* Icon in center */}
          <div className="absolute inset-0 flex animate-pulse items-center justify-center">
            <svg
              className="h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      }
    >
      <>
        <div
          className="relative inline-block select-none"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div
            draggable={draggable}
            className="w-full max-w-full overflow-hidden"
          >
            {isLoadError ? (
              <BrokenImage />
            ) : (
              <div className="relative">
                {loading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                    <div className="flex flex-col items-center gap-2 rounded-lg bg-white/90 p-3 shadow-lg">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                      <span className="text-xs font-medium text-gray-700">
                        Uploading...
                      </span>
                    </div>
                  </div>
                )}
                <ImageErrorBoundary
                  key={`${src}-${retryCount}`}
                  onError={handleImageError}
                  fallback={<BrokenImage />}
                >
                  <LazyImage
                    className={`h-auto w-full max-w-full cursor-default object-contain ${
                      loading ? "opacity-90" : ""
                    } ${
                      isFocused
                        ? `${$isNodeSelection(selection) ? "draggable cursor-grab active:cursor-grabbing" : ""} focused ring-primary ring-2 ring-offset-2`
                        : null
                    }`}
                    src={src}
                    altText={altText}
                    imageRef={imageRef}
                    width={width}
                    height={height}
                    maxWidth={maxWidth}
                    onError={() => setIsLoadError(true)}
                    onContextMenu={onRightClick}
                    onDoubleClick={() => setIsPreviewOpen(true)}
                  />
                </ImageErrorBoundary>
              </div>
            )}
          </div>

          {showCaption && (
            <div className="image-caption-container absolute right-0 bottom-1 left-0 m-0 block min-w-[100px] overflow-hidden border-t bg-white/90 p-0">
              <LexicalNestedComposer initialEditor={caption}>
                <AutoFocusPlugin />
                <MentionsPlugin />
                <LinkPlugin />
                <EmojisPlugin />
                <HashtagPlugin />
                <KeywordsPlugin />
                <HistoryPlugin />
                <RichTextPlugin
                  contentEditable={
                    <ContentEditable
                      className="ImageNode__contentEditable user-select-text word-break-break-word caret-primary relative block min-h-5 w-[calc(100%-20px)] cursor-text resize-none border-0 p-2.5 text-sm whitespace-pre-wrap outline-none"
                      placeholderClassName="ImageNode__placeholder text-sm text-muted-foreground overflow-hidden absolute top-2.5 left-2.5 pointer-events-none text-ellipsis user-select-none whitespace-nowrap inline-block"
                      placeholder="Enter a caption..."
                    />
                  }
                  ErrorBoundary={LexicalErrorBoundary}
                />
              </LexicalNestedComposer>
            </div>
          )}
          {resizable && isEditable && (isFocused || isHovering) && (
            <ImageResizer
              showCaption={showCaption}
              setShowCaption={setShowCaption}
              editor={editor}
              buttonRef={buttonRef}
              imageRef={imageRef}
              maxWidth={maxWidth}
              onResizeStart={onResizeStart}
              onResizeEnd={onResizeEnd}
              captionsEnabled={!isLoadError && captionsEnabled}
            />
          )}
        </div>
        {isPreviewOpen && (
          <ImagePreview
            src={src}
            altText={altText}
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
          />
        )}
      </>

      {/* Image Context Menu */}
      {contextMenu && (
        <ImageContextMenu
          isOpen={contextMenu.isOpen}
          position={contextMenu.position}
          onReplace={handleReplace}
          onCopy={handleCopy}
          onDownload={handleDownload}
          onCaption={handleCaptionToggle}
          onDelete={handleDelete}
          onClose={() => setContextMenu(null)}
        />
      )}
    </Suspense>
  );
}
