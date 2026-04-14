/* eslint-disable unicorn/no-null -- Lexical APIs and serialized editor fixtures intentionally use null semantics. */
import type { InitialConfigType } from "@lexical/react/LexicalComposer";
import type { EditorState } from "lexical";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";

import type { SizeType } from "../config-provider/size-context";
import type { ImageResolverFn as ImageResolverFunction } from "./context/image-resolver-context";
import type { MentionData } from "./plugins/mentions-plugin";
import { EditorProviders } from "./editor-providers";
import { nodes } from "./nodes/nodes";
import { Plugins } from "./plugins/plugins";
import { WordCountPlugin } from "./plugins/word-count-plugin";
import { editorTheme } from "./themes/editor-theme";

const editorConfig: InitialConfigType = {
  namespace: "Editor",
  theme: editorTheme,
  nodes,
  onError: (error: Error) => {
    console.error(error);
  },
};

const MarkdownPlugins = dynamic(() => import("./plugins/markdown-plugins"), {
  ssr: false,
});

const HtmlPlugins = dynamic(() => import("./plugins/html-plugins"), {
  ssr: false,
});

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
  className?: string;
  contentClassName?: string;
  placeholderClassName?: string;
  autoFocus?: boolean;
  size?: SizeType;
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
  | JsonEditorProperties
  | MarkdownEditorProperties
  | HtmlEditorProperties;

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
  className,
  contentClassName,
  placeholderClassName,
  autoFocus = true,
  size = "middle",
}: EditorProps) {
  const isMarkdownMode = format === "markdown";
  const isHtmlMode = format === "html";

  const rawEditorState =
    isMarkdownMode || isHtmlMode ? undefined : (value ?? defaultValue);
  let initialEditorState: string | undefined;
  if (typeof rawEditorState === "string") {
    if (rawEditorState.trim()) {
      try {
        JSON.parse(rawEditorState);
        initialEditorState = rawEditorState;
      } catch (error) {
        console.error(
          "Editor: invalid JSON in editorState, ignoring value",
          error,
        );
        initialEditorState = undefined;
      }
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
            className={className}
            contentClassName={contentClassName}
            placeholderClassName={placeholderClassName}
            autoFocus={autoFocus}
            size={size}
          />

          {!isMarkdownMode && !isHtmlMode && (
            <OnChangePlugin
              ignoreSelectionChange={true}
              onChange={(editorState) => {
                const jsonString = JSON.stringify(editorState.toJSON());
                onChange?.(jsonString, editorState);
              }}
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
        </div>
      </EditorProviders>
    </LexicalComposer>
  );
}
