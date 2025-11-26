"use client";

/**
 * Find & Replace Plugin
 * 
 * Tính năng tìm kiếm và thay thế text trong Lexical editor
 * - Keyboard shortcut: Cmd/Ctrl+F (Find), Cmd/Ctrl+H (Replace)
 * - Highlight tất cả matches
 * - Navigate giữa các matches (Next/Previous)
 * - Replace one hoặc Replace all
 */

import { useState, useEffect, useCallback } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  KEY_MODIFIER_COMMAND,
  COMMAND_PRIORITY_LOW,
} from "lexical";
import { mergeRegister } from "@lexical/utils";
import { SearchIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FindReplacePluginProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function FindReplacePlugin({
  isOpen: controlledIsOpen,
  onOpenChange: controlledOnOpenChange,
}: FindReplacePluginProps = {}) {
  const [editor] = useLexicalComposerContext();
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [matches, setMatches] = useState<Array<{ key: string; offset: number }>>(
    [],
  );

  const actualIsOpen = controlledIsOpen ?? isOpen;
  const actualOnOpenChange = controlledOnOpenChange ?? setIsOpen;

  // Find all matches
  const findMatches = useCallback(() => {
    if (!searchText.trim()) {
      setMatches([]);
      setMatchCount(0);
      setCurrentMatchIndex(0);
      return;
    }

    editor.getEditorState().read(() => {
      const root = $getRoot();
      const allMatches: Array<{ key: string; offset: number }> = [];
      const searchLower = searchText.toLowerCase();

      function traverse(node: any) {
        if ($isTextNode(node)) {
          const text = node.getTextContent();
          const textLower = text.toLowerCase();
          let index = 0;

          while ((index = textLower.indexOf(searchLower, index)) !== -1) {
            allMatches.push({
              key: node.getKey(),
              offset: index,
            });
            index += searchLower.length;
          }
        }

        const children = node.getChildren();
        for (const child of children) {
          traverse(child);
        }
      }

      traverse(root);
      setMatches(allMatches);
      setMatchCount(allMatches.length);
      setCurrentMatchIndex(0);
    });
  }, [editor, searchText]);

  // Navigate to match
  const navigateToMatch = useCallback(
    (direction: "next" | "prev") => {
      if (matches.length === 0) return;

      let newIndex = currentMatchIndex;
      if (direction === "next") {
        newIndex = (currentMatchIndex + 1) % matches.length;
      } else {
        newIndex =
          currentMatchIndex === 0 ? matches.length - 1 : currentMatchIndex - 1;
      }

      setCurrentMatchIndex(newIndex);

      editor.update(() => {
        const match = matches[newIndex];
        if (!match) return;

        const node = editor.getEditorState()._nodeMap.get(match.key);
        if (node && $isTextNode(node)) {
          const selection = node.select(match.offset, match.offset + searchText.length);
          selection?.scrollIntoView();
        }
      });
    },
    [editor, matches, currentMatchIndex, searchText],
  );

  // Replace current match
  const replaceCurrent = useCallback(() => {
    if (matches.length === 0 || currentMatchIndex >= matches.length) return;

    editor.update(() => {
      const match = matches[currentMatchIndex];
      if (!match) return;

      const node = editor.getEditorState()._nodeMap.get(match.key);
      if (node && $isTextNode(node)) {
        const text = node.getTextContent();
        const newText =
          text.slice(0, match.offset) +
          replaceText +
          text.slice(match.offset + searchText.length);
        node.setTextContent(newText);
      }

      // Remove replaced match and update indices
      const newMatches = matches.filter((_, i) => i !== currentMatchIndex);
      setMatches(newMatches);
      setMatchCount(newMatches.length);
      if (currentMatchIndex >= newMatches.length) {
        setCurrentMatchIndex(Math.max(0, newMatches.length - 1));
      }
    });
  }, [editor, matches, currentMatchIndex, searchText, replaceText]);

  // Replace all matches
  const replaceAll = useCallback(() => {
    if (matches.length === 0) return;

    editor.update(() => {
      // Process in reverse to maintain offsets
      const sortedMatches = [...matches].sort(
        (a, b) => (b.key === a.key ? b.offset - a.offset : 0),
      );

      for (const match of sortedMatches) {
        const node = editor.getEditorState()._nodeMap.get(match.key);
        if (node && $isTextNode(node)) {
          const text = node.getTextContent();
          const newText =
            text.slice(0, match.offset) +
            replaceText +
            text.slice(match.offset + searchText.length);
          node.setTextContent(newText);
        }
      }

      setMatches([]);
      setMatchCount(0);
      setCurrentMatchIndex(0);
    });
  }, [editor, matches, searchText, replaceText]);

  // Keyboard shortcuts
  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        KEY_MODIFIER_COMMAND,
        (payload) => {
          const event = payload as KeyboardEvent;
          if ((event.metaKey || event.ctrlKey) && event.key === "f") {
            event.preventDefault();
            actualOnOpenChange(true);
            return true;
          }
          if ((event.metaKey || event.ctrlKey) && event.key === "h") {
            event.preventDefault();
            actualOnOpenChange(true);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, actualOnOpenChange]);

  // Find matches when search text changes
  useEffect(() => {
    if (actualIsOpen) {
      findMatches();
    }
  }, [actualIsOpen, findMatches]);

  return (
    <Dialog open={actualIsOpen} onOpenChange={actualOnOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Find & Replace</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Find</Label>
            <div className="flex gap-2">
              <Input
                id="search"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setTimeout(findMatches, 100);
                }}
                placeholder="Search..."
                autoFocus
              />
              {matchCount > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <span>
                    {currentMatchIndex + 1} / {matchCount}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateToMatch("prev")}
                  >
                    ↑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateToMatch("next")}
                  >
                    ↓
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="replace">Replace</Label>
            <Input
              id="replace"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Replace with..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => actualOnOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={replaceCurrent}
              disabled={matches.length === 0}
            >
              Replace
            </Button>
            <Button
              variant="outline"
              onClick={replaceAll}
              disabled={matches.length === 0}
            >
              Replace All
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

