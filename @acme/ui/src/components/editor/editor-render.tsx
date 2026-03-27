import { cn } from "@acme/ui/lib/utils";

import type { LexicalEditorContent } from "./types";
import { normalizeEditorContent } from "./render/normalize-editor-content";
import { renderRootNodes } from "./render/render-node";

type EditorRenderProps = {
  className?: string;
  value: string | LexicalEditorContent;
};

export function EditorRender({ className, value }: EditorRenderProps) {
  const content = normalizeEditorContent(value);

  if (!content) {
    return null;
  }

  return <div className={cn(className)}>{renderRootNodes(content.root.children)}</div>;
}

export type { EditorRenderProps };
