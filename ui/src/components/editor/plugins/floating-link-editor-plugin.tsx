/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type { BaseSelection, LexicalEditor } from "lexical";
import type { Dispatch, JSX } from "react";
import type * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  $createLinkNode,
  $isAutoLinkNode,
  $isLinkNode,
  TOGGLE_LINK_COMMAND,
} from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  $createTextNode,
  $getSelection,
  $isLineBreakNode,
  $isRangeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  KEY_ESCAPE_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { Check, Pencil, Trash, X } from "lucide-react";
import { createPortal } from "react-dom";

import { Button } from "@acme/ui/components/button";
import { Input } from "@acme/ui/components/input";

import { useFloatingLinkContext } from "../context/floating-link-context";
import { getSelectedNode } from "../utils/get-selected-node";
import { setFloatingElemPositionForLinkEditor } from "../utils/set-floating-elem-position-for-link-editor";
import { sanitizeUrl } from "../utils/url";

function FloatingLinkEditor({
  editor,
  isLink,
  setIsLink,
  anchorElem,
  isLinkEditMode,
  setIsLinkEditMode,
}: {
  editor: LexicalEditor;
  isLink: boolean;
  setIsLink: Dispatch<boolean>;
  anchorElem: HTMLElement;
  isLinkEditMode: boolean;
  setIsLinkEditMode: Dispatch<boolean>;
}): JSX.Element {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [editedLinkUrl, setEditedLinkUrl] = useState("https://");
  const [lastSelection, setLastSelection] = useState<BaseSelection | null>(
    null,
  );
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [shouldShow, setShouldShow] = useState(false);

  const $updateLinkEditor = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const linkParent = $findMatchingParent(node, $isLinkNode);

      if (linkParent) {
        const url = linkParent.getURL();
        setLinkUrl(url);
        if (isLinkEditMode && editedLinkUrl === "https://") {
          setEditedLinkUrl(url);
        }
      } else if ($isLinkNode(node)) {
        const url = node.getURL();
        setLinkUrl(url);
        if (isLinkEditMode && editedLinkUrl === "https://") {
          setEditedLinkUrl(url);
        }
      } else {
        setLinkUrl("");
      }
    }
    const editorElem = editorRef.current;
    const nativeSelection = globalThis.getSelection();

    if (editorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();

    // If in link edit mode, always show the editor
    if (isLinkEditMode) {
      const selection = $getSelection();
      let domRect: DOMRect | undefined;

      if ($isRangeSelection(selection) && nativeSelection) {
        // Try to get position from selection
        domRect =
          nativeSelection.focusNode?.parentElement?.getBoundingClientRect();
        if (domRect) {
          domRect.y += 40;
        }
      }

      // If no valid selection position, position at cursor or center of editor
      if (!domRect && rootElement) {
        const rootRect = rootElement.getBoundingClientRect();
        // Try to get cursor position from native selection
        if (nativeSelection && nativeSelection.rangeCount > 0) {
          const range = nativeSelection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          if (rect.width > 0 || rect.height > 0) {
            domRect = new DOMRect(rect.left, rect.top + 30, 300, 40);
          }
        }

        // Fallback to center of editor
        domRect ??= new DOMRect(
          rootRect.left + rootRect.width / 2 - 200,
          rootRect.top + Math.min(100, rootRect.height / 4),
          400,
          40,
        );
      }

      if (domRect && rootElement) {
        setFloatingElemPositionForLinkEditor(domRect, editorElem, anchorElem);
      }

      if ($isRangeSelection(selection)) {
        setLastSelection(selection);
      }
      return true;
    }

    // Check if we should show the link editor
    const hasLinkSelection =
      selection !== null &&
      nativeSelection !== null &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode) &&
      editor.isEditable() &&
      isLink;

    if (hasLinkSelection) {
      // Show with a small delay to avoid flickering
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }

      showTimeoutRef.current = setTimeout(() => {
        const domRect: DOMRect | undefined =
          nativeSelection.focusNode?.parentElement?.getBoundingClientRect();
        if (domRect) {
          domRect.y += 40;
          setFloatingElemPositionForLinkEditor(domRect, editorElem, anchorElem);
          setShouldShow(true);
        }
        setLastSelection(selection);
      }, 150); // Small delay to avoid showing on quick selections
    } else {
      // Hide editor when not in edit mode and no link selected
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }

      // Hide with a small delay to allow moving mouse to editor
      if (!hideTimeoutRef.current && shouldShow) {
        hideTimeoutRef.current = setTimeout(() => {
          if (rootElement) {
            setFloatingElemPositionForLinkEditor(null, editorElem, anchorElem);
          }
          setShouldShow(false);
          setLastSelection(null);
          setIsLinkEditMode(false);
          setLinkUrl("");
          hideTimeoutRef.current = null;
        }, 200); // Delay to allow mouse movement to editor
      } else if (!shouldShow) {
        // Immediately hide if already hidden
        if (rootElement) {
          setFloatingElemPositionForLinkEditor(null, editorElem, anchorElem);
        }
        setLastSelection(null);
        setIsLinkEditMode(false);
        setLinkUrl("");
      }
    }

    return true;
  }, [
    anchorElem,
    editor,
    setIsLinkEditMode,
    isLinkEditMode,
    editedLinkUrl,
    isLink,
    shouldShow,
  ]);

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;

    const update = () => {
      editor.getEditorState().read(() => {
        $updateLinkEditor();
      });
    };

    window.addEventListener("resize", update);

    if (scrollerElem) {
      scrollerElem.addEventListener("scroll", update);
    }

    return () => {
      window.removeEventListener("resize", update);

      if (scrollerElem) {
        scrollerElem.removeEventListener("scroll", update);
      }
      // Cleanup timeouts
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [anchorElem.parentElement, editor, $updateLinkEditor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateLinkEditor();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateLinkEditor();
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          if (isLink) {
            setIsLink(false);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH,
      ),
    );
  }, [editor, $updateLinkEditor, setIsLink, isLink]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      $updateLinkEditor();
    });
  }, [editor, $updateLinkEditor]);

  useEffect(() => {
    if (isLinkEditMode && inputRef.current) {
      // Small delay to ensure the element is visible before focusing
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isLinkEditMode, editedLinkUrl]);

  const monitorInputInteraction = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleLinkSubmission();
    } else if (event.key === "Escape") {
      event.preventDefault();
      setIsLinkEditMode(false);
    }
  };

  const handleLinkSubmission = () => {
    const editorElem = editorRef.current;
    const rootElement = editor.getRootElement();

    if (editedLinkUrl === "" || editedLinkUrl === "https://") {
      // If URL is empty or default, just cancel
      setIsLinkEditMode(false);
      setEditedLinkUrl("https://");
      // Force hide the editor
      if (editorElem && rootElement) {
        setFloatingElemPositionForLinkEditor(null, editorElem, anchorElem);
      }
      return;
    }

    const sanitizedUrl = sanitizeUrl(editedLinkUrl);
    if (!sanitizedUrl) {
      setIsLinkEditMode(false);
      setEditedLinkUrl("https://");
      // Force hide the editor
      if (editorElem && rootElement) {
        setFloatingElemPositionForLinkEditor(null, editorElem, anchorElem);
      }
      return;
    }

    // Use lastSelection if available, otherwise get current selection
    const selectionToUse = lastSelection ?? $getSelection();

    if (selectionToUse && $isRangeSelection(selectionToUse)) {
      // Apply link to selected text
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizedUrl);
      editor.update(() => {
        const parent = getSelectedNode(selectionToUse).getParent();
        if ($isAutoLinkNode(parent)) {
          const linkNode = $createLinkNode(parent.getURL(), {
            rel: parent.__rel,
            target: parent.__target,
            title: parent.__title,
          });
          parent.replace(linkNode, true);
        }
      });
    } else {
      // No selection, insert link with URL as text
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const linkNode = $createLinkNode(sanitizedUrl);
          const textNode = $createTextNode(editedLinkUrl);
          linkNode.append(textNode);
          selection.insertNodes([linkNode]);
        }
      });
    }

    setEditedLinkUrl("https://");
    setIsLinkEditMode(false);
    setLastSelection(null);
    setShouldShow(false);

    // Cleanup timeouts
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    // Force hide the editor after submission
    setTimeout(() => {
      const currentEditorElem = editorRef.current;
      const currentRootElement = editor.getRootElement();
      if (currentEditorElem && currentRootElement) {
        setFloatingElemPositionForLinkEditor(
          null,
          currentEditorElem,
          anchorElem,
        );
      }
    }, 100);
  };
  // Show editor only when in edit mode or when link is selected and should show
  const isVisible = isLinkEditMode || (isLink && shouldShow);

  if (!isLinkEditMode && !isLink) {
    return <div ref={editorRef} className="hidden" />;
  }

  return (
    <div
      ref={editorRef}
      className="absolute top-0 left-0 z-50 w-full max-w-sm rounded-md border border-gray-200 bg-white shadow-lg transition-opacity duration-200"
      style={{
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
      }}
      onMouseEnter={() => {
        // Keep editor visible when hovering over it
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
      }}
      onMouseLeave={() => {
        // Hide when mouse leaves editor (if not in edit mode)
        if (!isLinkEditMode && shouldShow) {
          hideTimeoutRef.current = setTimeout(() => {
            const editorElem = editorRef.current;
            const rootElement = editor.getRootElement();
            if (rootElement && editorElem) {
              setFloatingElemPositionForLinkEditor(
                null,
                editorElem,
                anchorElem,
              );
            }
            setShouldShow(false);
            setIsLink(false);
            setLinkUrl("");
            hideTimeoutRef.current = null;
          }, 200);
        }
      }}
    >
      {isLinkEditMode ? (
        // Show input field when in edit mode (creating or editing link)
        <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white p-2 shadow-sm">
          <Input
            ref={inputRef}
            value={editedLinkUrl}
            onChange={(event) => setEditedLinkUrl(event.target.value)}
            onKeyDown={monitorInputInteraction}
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Enter URL"
            autoFocus
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsLinkEditMode(false);
              setIsLink(false);
              setEditedLinkUrl("https://");
              setLastSelection(null);
              setShouldShow(false);
              // Cleanup timeouts
              if (showTimeoutRef.current) {
                clearTimeout(showTimeoutRef.current);
                showTimeoutRef.current = null;
              }
              if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = null;
              }
              // Force hide the editor
              const editorElem = editorRef.current;
              const rootElement = editor.getRootElement();
              if (editorElem && rootElement) {
                setFloatingElemPositionForLinkEditor(
                  null,
                  editorElem,
                  anchorElem,
                );
              }
            }}
            className="h-8 w-8 shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            onClick={handleLinkSubmission}
            className="h-8 w-8 shrink-0"
          >
            <Check className="h-4 w-4" />
          </Button>
        </div>
      ) : isLink ? (
        // Show link URL with edit/delete buttons when link is selected
        <div className="flex items-center justify-between gap-2 rounded-md border border-gray-200 bg-white p-2 shadow-sm">
          <a
            href={sanitizeUrl(linkUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 overflow-hidden text-sm text-ellipsis whitespace-nowrap text-blue-600 hover:text-blue-700 hover:underline"
            onClick={(e) => {
              // Prevent editor from losing focus when clicking link
              e.stopPropagation();
            }}
          >
            {linkUrl}
          </a>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                // Get current link URL before setting edit mode
                editor.getEditorState().read(() => {
                  const selection = $getSelection();
                  if ($isRangeSelection(selection)) {
                    const node = getSelectedNode(selection);
                    const linkParent = $findMatchingParent(node, $isLinkNode);
                    if (linkParent) {
                      setEditedLinkUrl(linkParent.getURL());
                    } else if ($isLinkNode(node)) {
                      setEditedLinkUrl(node.getURL());
                    } else {
                      setEditedLinkUrl(linkUrl || "https://");
                    }
                  } else {
                    setEditedLinkUrl(linkUrl || "https://");
                  }
                });
                setIsLinkEditMode(true);
              }}
              className="h-8 w-8"
              title="Edit link"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
                setIsLink(false);
              }}
              className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
              title="Remove link"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function useFloatingLinkEditorToolbar(
  editor: LexicalEditor,
  anchorElem: HTMLDivElement | null,
  isLinkEditMode: boolean,
  setIsLinkEditMode: Dispatch<boolean>,
): JSX.Element | null {
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLink, setIsLink] = useState(false);

  useEffect(() => {
    function $updateToolbar() {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const focusNode = getSelectedNode(selection);
        const focusLinkNode = $findMatchingParent(focusNode, $isLinkNode);
        const focusAutoLinkNode = $findMatchingParent(
          focusNode,
          $isAutoLinkNode,
        );
        if ((focusLinkNode ?? focusAutoLinkNode) == null) {
          setIsLink(false);
          return;
        }
        const badNode = selection
          .getNodes()
          .filter((node) => !$isLineBreakNode(node))
          .find((node) => {
            const linkNode = $findMatchingParent(node, $isLinkNode);
            const autoLinkNode = $findMatchingParent(node, $isAutoLinkNode);
            return (
              (focusLinkNode && !focusLinkNode.is(linkNode)) ||
              (linkNode && !linkNode.is(focusLinkNode)) ||
              (focusAutoLinkNode && !focusAutoLinkNode.is(autoLinkNode)) ||
              (autoLinkNode &&
                (!autoLinkNode.is(focusAutoLinkNode) ||
                  autoLinkNode.getIsUnlinked()))
            );
          });

        if (badNode) {
          setIsLink(false);
        } else {
          setIsLink(true);
        }
      }
    }
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, newEditor) => {
          $updateToolbar();
          setActiveEditor(newEditor);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        CLICK_COMMAND,
        (payload) => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const node = getSelectedNode(selection);
            const linkNode = $findMatchingParent(node, $isLinkNode);
            if ($isLinkNode(linkNode) && (payload.metaKey || payload.ctrlKey)) {
              window.open(linkNode.getURL(), "_blank");
              return true;
            }
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor]);

  if (!anchorElem) {
    return null;
  }

  return createPortal(
    <FloatingLinkEditor
      editor={activeEditor}
      isLink={isLink}
      anchorElem={anchorElem}
      setIsLink={setIsLink}
      isLinkEditMode={isLinkEditMode}
      setIsLinkEditMode={setIsLinkEditMode}
    />,
    anchorElem,
  );
}

export function FloatingLinkEditorPlugin({
  anchorElem,
}: {
  anchorElem: HTMLDivElement | null;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const { isLinkEditMode, setIsLinkEditMode } = useFloatingLinkContext();

  return useFloatingLinkEditorToolbar(
    editor,
    anchorElem,
    isLinkEditMode,
    setIsLinkEditMode,
  );
}
