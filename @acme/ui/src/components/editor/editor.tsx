import type { InitialConfigType } from "@lexical/react/LexicalComposer";
import type { EditorState } from "lexical";
import type { ReactNode } from "react";
import { lazy, Suspense } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";

import type { SizeType } from "../config-provider/size-context";
import type { ImageResolverFn as ImageResolverFunction } from "./context/image-resolver-context";
import type { MentionData } from "./plugins/mentions-plugin";
import type { ResolvePasteLink } from "./plugins/paste-as-plugin";
import { EditorProviders } from "./editor-providers";
import { nodes } from "./nodes/nodes";
import { Plugins } from "./plugins/plugins";
import { WordCountPlugin } from "./plugins/word-count-plugin";
import { editorTheme } from "./themes/editor-theme";
import { toEditorState } from "./to-editor-state";
import { inlineStyleHtmlImportMap } from "./utils/html-inline-style-import";

const editorConfig: InitialConfigType = {
  namespace: "Editor",
  theme: editorTheme,
  nodes,
  // Without this, opening saved HTML drops every inline color it contained.
  html: { import: inlineStyleHtmlImportMap },
  onError: (error: Error) => {
    console.error(error);
  },
};

const MarkdownPlugins = lazy(() => import("./plugins/markdown-plugins"));

const HtmlPlugins = lazy(() => import("./plugins/html-plugins"));

// Discriminated Union for better type safety
type EditorPropertiesBase = {
  placeholder?: string;
  defaultValue?: string;
  editable?: boolean;
  resolveImage?: ImageResolverFunction;
  onImageUpload?: (file: File) => Promise<string>;
  onStatsChange?: (stats: {
    wordCount: number;
    characterCount: number;
    readingTimeMinutes: number;
  }) => void;
  variant?: "default" | "simple" | "minimal";
  mentionsData?: MentionData[];
  /**
   * Identify a pasted URL, so the editor can offer to insert it as a readable
   * mention instead of a bare URL. Returning null declines the offer, and
   * leaving the prop out turns the whole feature off — the editor has no
   * network access and no knowledge of any host's URL space, so recognising a
   * link is the consumer's job.
   */
  resolvePasteLink?: ResolvePasteLink;
  className?: string;
  contentClassName?: string;
  placeholderClassName?: string;
  /**
   * Take the caret on mount. Opt-in, like the DOM attribute of the same name:
   * an editor placed in a form is one field among several, and focusing itself
   * is a decision only the surrounding screen can make.
   *
   * It is not merely "the first field wins" — Lexical's AutoFocusPlugin calls
   * `editor.focus()` from an effect, which runs after a dialog has focused its
   * own first field and therefore takes the caret off it.
   */
  autoFocus?: boolean;
  size?: SizeType;
  /**
   * Extra Lexical plugins, rendered inside the composer so they can reach the
   * editor through useLexicalComposerContext. The seam exists so behaviour that
   * belongs to one consumer — chat's submit-on-Enter, for instance — stays out of
   * the shared editor.
   */
  children?: ReactNode;
  /**
   * Every change, without serializing the document.
   *
   * `onChange` has to build the whole string on each keystroke, which is O(the
   * document) — on a long note that alone blocked typing for ~200ms per key.
   * Most callers only want the string later (a debounced save), and an
   * EditorState is an immutable snapshot, so it can be held and serialized then
   * instead. Reach for this when you do not need the string on every key.
   */
  onChangeEditorState?: (editorState: EditorState) => void;
};

type JsonEditorProperties = EditorPropertiesBase & {
  format?: "json";
  value?: string;
  onChange?: (jsonString: string, editorState: EditorState) => void;
};

type MarkdownEditorProperties = EditorPropertiesBase & {
  format: "markdown";
  value?: string;
  onChange?: (markdownString: string, editorState: EditorState) => void;
};

type HtmlEditorProperties = EditorPropertiesBase & {
  format: "html";
  value?: string;
  onChange?: (htmlString: string, editorState: EditorState) => void;
};

export type EditorProps =
  JsonEditorProperties | MarkdownEditorProperties | HtmlEditorProperties;

export function Editor({
  value,
  defaultValue,
  onChange,
  placeholder,
  editable = true,
  resolveImage,
  onImageUpload,
  onStatsChange,
  format = "json",
  variant = "default",
  mentionsData,
  resolvePasteLink,
  className,
  contentClassName,
  placeholderClassName,
  autoFocus = false,
  size = "middle",
  children,
  onChangeEditorState,
}: EditorProps) {
  const isMarkdownMode = format === "markdown";
  const isHtmlMode = format === "html";

  const rawEditorState =
    isMarkdownMode || isHtmlMode ? undefined : (value ?? defaultValue);
  let initialEditorState: string | undefined;
  if (typeof rawEditorState === "string") {
    if (rawEditorState.trim()) {
      initialEditorState = toEditorState(rawEditorState);
    } else {
      initialEditorState = undefined;
    }
  } else {
    initialEditorState = rawEditorState;
  }

  return (
    <LexicalComposer
      initialConfig={{
        ...editorConfig,
        editorState: initialEditorState,
        editable,
      }}
    >
      <EditorProviders resolveImage={resolveImage}>
        <div className="relative">
          <Plugins
            placeholder={placeholder}
            editable={editable}
            onImageUpload={onImageUpload}
            variant={variant}
            mentionsData={mentionsData}
            resolvePasteLink={resolvePasteLink}
            className={className}
            contentClassName={contentClassName}
            placeholderClassName={placeholderClassName}
            autoFocus={autoFocus}
            size={size}
          />

          {/*
            Gated on `onChange`: serializing walks the entire document, so it
            only happens when a caller actually asked for the string.
          */}
          {!isMarkdownMode && !isHtmlMode && onChange && (
            <OnChangePlugin
              ignoreSelectionChange={true}
              onChange={(editorState) => {
                const jsonString = JSON.stringify(editorState.toJSON());
                onChange(jsonString, editorState);
              }}
            />
          )}

          {/*
            Its own listener rather than a branch inside the one above, so it
            reports in every format and never becomes an inert prop in markdown
            or html mode.
          */}
          {onChangeEditorState && (
            <OnChangePlugin
              ignoreSelectionChange={true}
              onChange={onChangeEditorState}
            />
          )}

          {isMarkdownMode && (
            <Suspense fallback={null}>
              <MarkdownPlugins
                value={value}
                defaultValue={defaultValue}
                onChange={onChange}
              />
            </Suspense>
          )}

          {isHtmlMode && (
            <Suspense fallback={null}>
              <HtmlPlugins
                value={value}
                defaultValue={defaultValue}
                onChange={onChange}
              />
            </Suspense>
          )}

          {onStatsChange && <WordCountPlugin onStatsChange={onStatsChange} />}

          {children}
        </div>
      </EditorProviders>
    </LexicalComposer>
  );
}
