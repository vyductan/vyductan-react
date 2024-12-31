"use client";

import type { InitialConfigType } from "@lexical/react/LexicalComposer";
import type { EditorState, LexicalEditor } from "lexical";
import type { Ref } from "react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode } from "@lexical/rich-text";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";

import { cn } from "@acme/ui";

import { ImageNode } from "./nodes/image-node";
import { AutoLinkPlugin } from "./plugins/auto-link-plugin";
import ComponentPickerMenuPlugin from "./plugins/component-picker-plugin/component-picker";
import { DraggableBlockPlugin } from "./plugins/draggable-block-plugin";
import { HistoryPlugin } from "./plugins/history";
import { ImagesPlugin } from "./plugins/images-plugin";
import { LinkPlugin } from "./plugins/link-plugin";
import { OnChangePlugin } from "./plugins/on-change-plugin";

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
  const [floatingAnchorElement, setFloatingAnchorElement] = useState<
    HTMLDivElement | undefined
  >();

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

  const onRef = (_floatingAnchorElement: HTMLDivElement) => {
    setFloatingAnchorElement(_floatingAnchorElement);
  };
  // const CustomContentEditable = useMemo(() => {
  //   return (
  //     <div>
  //       <div className="relative" ref={onRef}>
  //         <ContentEditable
  //           placeholder={placeholder}
  //           // placeholder="Type / for commands..."
  //           className={cn(
  //             "my-px flex px-0.5 py-0.5",
  //             "outline-0",
  //             // "relative border-0 px-7 py-2 outline-0",
  //             // "flex flex-col",
  //             // "text-base",
  //             // "[&>*]:py-[3px]",
  //           )}
  //         />
  //       </div>
  //     </div>
  //   );
  // }, []);
  // const CustomPlaceholder = useMemo(() => {
  //   return (
  //     <div
  //       style={{
  //         position: "absolute",
  //         top: 30,
  //         left: 30,
  //       }}
  //       className="text-placeholder"
  //     >
  //       Press '/' for commands...
  //     </div>
  //   );
  // }, []);

  const initialConfig: InitialConfigType = {
    namespace: "Editor",
    nodes: [AutoLinkNode, HeadingNode, ImageNode, LinkNode],
    editable: true,
    editorState: () => {
      const root = $getRoot();
      const paragraph = $createParagraphNode();
      paragraph.append($createTextNode(""));
      root.append(paragraph);
    },
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
      paragraph: "",
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
          contentEditable={
            <div>
              <div className="relative" ref={onRef}>
                <ContentEditable
                  aria-placeholder="Write something or press '/' for commands..."
                  placeholder={
                    <div
                      className="absolute left-0.5 top-0.5 text-placeholder"
                      onClick={() => editorRef.current?.focus()}
                    >
                      Write something or press '/' for commands...
                    </div>
                  }
                  // class="text-base [&:has(br):not(:has(span))::before]:absolute [&:has(br):not(:has(span))::before]:text-placeholder [&:has(br):not(:has(span))::before]:content-[attr(data-placeholder)]"
                  className={cn(
                    "relative flex flex-col",
                    "my-px p-0.5 outline-0",
                    // "text-base [&:has(br):not(:has(span))::before]:absolute [&:has(br):not(:has(span))::before]:text-placeholder [&:has(br):not(:has(span))::before]:content-[attr(data-placeholder)]",
                    // "outline-0",
                    // "relative border-0 px-7 py-2 outline-0",
                    // "flex flex-col",
                    // "text-base",
                    // "[&>*]:py-[3px]",
                  )}
                />
              </div>
            </div>
          }
          // placeholder={CustomPlaceholder}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <EditorRefPlugin editorRef={editorRef} />
        <OnChangePlugin onChange={onChange} />
        <HistoryPlugin />
        <DraggableBlockPlugin anchorElem={floatingAnchorElement} />

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
