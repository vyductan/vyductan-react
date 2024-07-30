"use client";

import type { InitialConfigType } from "@lexical/react/LexicalComposer";
import type { EditorState, LexicalEditor } from "lexical";
import type { Ref } from "react";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode } from "@lexical/rich-text";

import { clsm } from "@acme/ui";

import { ImageNode } from "./nodes/ImageNode";
import { AutoLinkPlugin } from "./plugins/AutoLinkPlugin";
import ComponentPickerMenuPlugin from "./plugins/ComponentPickerPlugin/ComponentPicker";
import { DraggableBlockPlugin } from "./plugins/DraggableBlockPlugin";
import { HistoryPlugin } from "./plugins/history";
import { ImagesPlugin } from "./plugins/ImagesPlugin";
import { LinkPlugin } from "./plugins/LinkPlugin";
import { OnChangePlugin } from "./plugins/OnChangePlugin";

export type EditorProps = {
  value?: string;
  onChange?: (
    editorState: EditorState,
    editor: LexicalEditor,
    tags: Set<string>,
  ) => void;
};
const EditorInternal = (
  { value, onChange }: EditorProps,
  ref: Ref<HTMLDivElement>,
) => {
  const editorRef = useRef<LexicalEditor | null>(null);
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      // console.log("sssss", $getRoot().isEmpty());
      if (editorRef.current) {
        // clear if value is null or empty string
        if (!value) {
          // editorRef.current.update(() => {
          //   $getRoot().clear();
          // });
        }
        if (
          value &&
          value !== JSON.stringify(editorRef.current.getEditorState())
        ) {
          editorRef.current.setEditorState(
            editorRef.current.parseEditorState(value),
          );
        }
      }
    });
  }, [value]);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    setFloatingAnchorElem(_floatingAnchorElem);
  };
  const CustomContentEditable = useMemo(() => {
    return (
      <div>
        <div className="relative" ref={onRef}>
          <ContentEditable
            className={clsm(
              "relative border-0 px-7 py-2 outline-0",
              "flex flex-col",
              "text-base",
              // "[&>*]:py-[3px]",
            )}
          />
        </div>
      </div>
    );
  }, []);
  const CustomPlaceholder = useMemo(() => {
    return (
      <div
        style={{
          position: "absolute",
          top: 30,
          left: 30,
        }}
        className="text-placeholder"
      >
        Enter some text...
      </div>
    );
  }, []);

  const initialConfig: InitialConfigType = {
    namespace: "Editor",
    nodes: [AutoLinkNode, HeadingNode, ImageNode, LinkNode],
    editable: true,
    // editorState: value
    //   ? (editor) => {
    //       console.log("editor", editor);
    //       editor.setEditorState(editor.parseEditorState(value));
    //     }
    //   : undefined,
    theme: {
      text: {
        bold: "text-bold",
        italic: "text-italic",
        underline: "text-underline",
        code: "text-code",
        highlight: "text-highlight",
        strikethrough: "text-strikethrough",
        subscript: "text-subscript",
        superscript: "text-superscript",
      },
      heading: {
        // Flowbite examples: https://flowbite.com/docs/typography/headings/#heading-one-h1
        h1: "text-5xl font-extrabold dark:text-white",
        h2: "text-4xl font-bold dark:text-white",
        h3: "text-3xl font-bold dark:text-white",
        h4: "text-2xl font-bold dark:text-white",
        h5: "text-xl font-bold dark:text-white",
      },
      paragraph: "text-base",
    },
    onError: (error, editor) => {
      console.log("error", error, editor);
    },
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div
        className="relative p-6 [&:has(br):not(:has(span))::before]:absolute"
        ref={ref}
      >
        <RichTextPlugin
          contentEditable={CustomContentEditable}
          placeholder={CustomPlaceholder}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <EditorRefPlugin editorRef={editorRef} />
        <OnChangePlugin onChange={onChange} />
        <HistoryPlugin />
        <DraggableBlockPlugin anchorElem={floatingAnchorElem} />

        <AutoLinkPlugin />
        <ComponentPickerMenuPlugin />
        <ImagesPlugin />
        <LinkPlugin />

        {/* {floatingAnchorElem ? ( */}
        {/*   <> */}
        {/*     <DraggableBlockPlugin anchorElem={floatingAnchorElem} /> */}
        {/*   </> */}
        {/* ) : ( */}
        {/*   "" */}
        {/* )} */}
      </div>
    </LexicalComposer>
  );
};

export const Editor = forwardRef(EditorInternal);
