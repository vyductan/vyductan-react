/* eslint-disable unicorn/no-null -- Lexical APIs and serialized editor fixtures intentionally use null semantics. */
import { Suspense, use } from "react";

import { cn } from "@acme/ui/lib/utils";

import type { EditorRenderInputFormat } from "./render/resolve-editor-render-content";
import type { LexicalEditorContent } from "./types";
import { normalizeEditorContent } from "./render/normalize-editor-content";
import { renderRootNodes } from "./render/render-node";
import {
  resolveEditorRenderContentSync,
  resolveServerHtmlEditorRenderContent,
} from "./render/resolve-editor-render-content";

type EditorRenderProperties = {
  className?: string;
  format?: EditorRenderInputFormat;
  value: string | LexicalEditorContent;
};

type EditorRenderResolvedProperties = {
  className?: string;
  value: LexicalEditorContent | string | null;
};

function EditorRenderResolved({ className, value }: EditorRenderResolvedProperties) {
  const content = value ? normalizeEditorContent(value) : null;

  if (!content) {
    return null;
  }

  return (
    <div className={cn(className)}>
      {renderRootNodes(content.root.children)}
    </div>
  );
}

type EditorRenderServerHtmlProperties = {
  className?: string;
  value: string;
};

function EditorRenderServerHtml({
  className,
  value,
}: EditorRenderServerHtmlProperties) {
  const content = use(resolveServerHtmlEditorRenderContent(value));

  return <EditorRenderResolved className={className} value={content} />;
}

export function EditorRender({
  className,
  format = "json",
  value,
}: EditorRenderProperties) {
  if (
    format === "html" &&
    typeof value === "string" &&
    typeof DOMParser !== "function"
  ) {
    return (
      <Suspense>
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

export type { EditorRenderProperties as EditorRenderProps };
