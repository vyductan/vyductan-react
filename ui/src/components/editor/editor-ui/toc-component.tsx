/**
 * Table of Contents Component
 * 
 * Component để render TOC với links đến headings
 */

import type { LexicalEditor, NodeKey } from "lexical";
import { useEffect, useState } from "react";
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
  $getRoot,
} from "lexical";
import { $isHeadingNode, HeadingNode } from "@lexical/rich-text";
import { ListIcon } from "lucide-react";

import { $isTOCNode } from "../nodes/toc-node";

interface TOCComponentProps {
  headings?: Array<{
    id: string;
    text: string;
    level: number;
  }>;
  nodeKey: NodeKey;
  editor: LexicalEditor;
}

function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function extractHeadings(editor: LexicalEditor): Array<{
  id: string;
  text: string;
  level: number;
}> {
  const headings: Array<{ id: string; text: string; level: number }> = [];
  const editorState = editor.getEditorState();

  editorState.read(() => {
    const root = $getRoot();
    const children = root.getChildren();

    for (const child of children) {
      if ($isHeadingNode(child)) {
        const text = child.getTextContent();
        const tag = child.getTag();
        const level = Number.parseInt(tag.replace("h", ""), 10);
        const id = generateHeadingId(text);

        if (text.trim()) {
          headings.push({ id, text, level });
        }
      }

      // Recursively check children (for nested structures)
      function traverse(node: LexicalNode) {
        const children = node.getChildren();
        for (const child of children) {
          if ($isHeadingNode(child)) {
            const text = child.getTextContent();
            const tag = child.getTag();
            const level = Number.parseInt(tag.replace("h", ""), 10);
            const id = generateHeadingId(text);

            if (text.trim()) {
              headings.push({ id, text, level });
            }
          }
          traverse(child);
        }
      }

      traverse(child);
    }
  });

  return headings;
}

export default function TOCComponent({
  headings: initialHeadings,
  nodeKey,
  editor: externalEditor,
}: TOCComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const [headings, setHeadings] = useState(
    initialHeadings || extractHeadings(externalEditor),
  );

  // Update headings when editor content changes
  useEffect(() => {
    return editor.registerUpdateListener(() => {
      const newHeadings = extractHeadings(editor);
      setHeadings(newHeadings);

      // Update the node's headings
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isTOCNode(node)) {
          node.setHeadings(newHeadings);
        }
      });
    });
  }, [editor, nodeKey]);

  const onDelete = (event: KeyboardEvent) => {
    if (isSelected && $isNodeSelection($getSelection())) {
      event.preventDefault();
      const node = $getNodeByKey(nodeKey);
      if ($isTOCNode(node)) {
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
          if (target.closest('[data-lexical-toc-component]')) {
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

  const handleHeadingClick = (id: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    // Scroll to heading
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (headings.length === 0) {
    return (
      <div
        data-lexical-toc-component
        className={`my-4 rounded-lg border border-gray-200 bg-gray-50 p-4 ${
          isSelected ? "ring-2 ring-blue-500" : ""
        }`}
      >
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ListIcon className="size-4" />
          <span>No headings found. Add headings to generate table of contents.</span>
        </div>
      </div>
    );
  }

  const getIndentClass = (level: number) => {
    switch (level) {
      case 1:
        return "pl-0 font-semibold";
      case 2:
        return "pl-4";
      case 3:
        return "pl-8 text-sm";
      case 4:
        return "pl-12 text-sm";
      default:
        return "pl-0";
    }
  };

  return (
    <div
      data-lexical-toc-component
      className={`my-4 rounded-lg border border-gray-200 bg-white p-4 ${
        isSelected ? "ring-2 ring-blue-500" : ""
      }`}
    >
      <div className="mb-3 flex items-center gap-2 border-b border-gray-200 pb-2">
        <ListIcon className="size-4 text-gray-600" />
        <h3 className="text-sm font-semibold text-gray-900">Table of Contents</h3>
      </div>
      <nav className="space-y-1">
        {headings.map((heading, index) => (
          <a
            key={`${heading.id}-${index}`}
            href={`#${heading.id}`}
            onClick={(e) => handleHeadingClick(heading.id, e)}
            className={`block text-sm text-gray-700 hover:text-blue-600 hover:underline ${getIndentClass(heading.level)}`}
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </div>
  );
}

