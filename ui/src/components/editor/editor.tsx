import type { InitialConfigType } from "@lexical/react/LexicalComposer";
import type { EditorState } from "lexical";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";

import type { SizeType } from "../config-provider/size-context";
import type { ImageResolverFn } from "./context/image-resolver-context";
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

const MarkdownPlugins = dynamic(
  () => import("./plugins/markdown-plugins").then((mod) => mod.MarkdownPlugins),
  { ssr: false },
);

// Discriminated Union for better type safety
type EditorPropsBase = {
  placeholder?: string;
  defaultValue?: string;
  editable?: boolean;
  resolveImage?: ImageResolverFn;
  onImageUpload?: (file: File) => Promise<string>;
  onStatsChange?: (stats: {
    wordCount: number;
    characterCount: number;
    readingTimeMinutes: number;
  }) => void;
  variant?: "default" | "simple";
  mentionsData?: MentionData[];
  className?: string;
  contentClassName?: string;
  placeholderClassName?: string;
  autoFocus?: boolean;
  size?: SizeType;
};

type JsonEditorProps = EditorPropsBase & {
  mode?: "json";
  value?: string;
  onChange?: (jsonString: string, editorState: EditorState) => void;
};

type MarkdownEditorProps = EditorPropsBase & {
  mode: "markdown";
  value?: string;
  onChange?: (markdownString: string, editorState: EditorState) => void;
};

export type EditorProps = JsonEditorProps | MarkdownEditorProps;

export function Editor({
  value,
  defaultValue,
  onChange,
  placeholder,
  editable = true,
  resolveImage,
  onImageUpload,
  onStatsChange,
  mode = "json",
  variant = "default",
  mentionsData,
  className,
  contentClassName,
  placeholderClassName,
  autoFocus = true,
  size = "middle",
}: EditorProps) {
  const isMarkdownMode = mode === "markdown";

  return (
    <LexicalComposer
      initialConfig={{
        ...editorConfig,
        editorState: isMarkdownMode ? undefined : (value ?? defaultValue),
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

          {!isMarkdownMode && (
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

          {onStatsChange && <WordCountPlugin onStatsChange={onStatsChange} />}
        </div>
      </EditorProviders>
    </LexicalComposer>
  );
}
