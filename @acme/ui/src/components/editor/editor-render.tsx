import { cn } from "@acme/ui/lib/utils";
import { Suspense, use } from "react";

import type { LexicalEditorContent } from "./types";
import { normalizeEditorContent } from "./render/normalize-editor-content";
import {
  resolveEditorRenderContentSync,
  resolveServerHtmlEditorRenderContent,
  type EditorRenderInputFormat,
} from "./render/resolve-editor-render-content";
import { renderRootNodes } from "./render/render-node";

type EditorRenderProps = {
  className?: string;
  format?: EditorRenderInputFormat;
  value: string | LexicalEditorContent;
};

type EditorRenderResolvedProps = {
  className?: string;
  value: LexicalEditorContent | string | null;
};

function EditorRenderResolved({ className, value }: EditorRenderResolvedProps) {
  const content = value ? normalizeEditorContent(value) : null;

  if (!content) {
    return null;
  }

  return <div className={cn(className)}>{renderRootNodes(content.root.children)}</div>;
}

type EditorRenderServerHtmlProps = {
  className?: string;
  value: string;
};

function EditorRenderServerHtml({ className, value }: EditorRenderServerHtmlProps) {
  const content = use(resolveServerHtmlEditorRenderContent(value));

  return <EditorRenderResolved className={className} value={content} />;
}

export function EditorRender({ className, format = "json", value }: EditorRenderProps) {
  if (format === "html" && typeof value === "string" && typeof DOMParser !== "function") {
    return (
      <Suspense fallback={null}>
        <EditorRenderServerHtml className={className} value={value} />
      </Suspense>
    );
  }

  return (
    <EditorRenderResolved
      className={className}
      value={resolveEditorRenderContentSync(value, format)}
    />
  );
}

export type { EditorRenderProps };
