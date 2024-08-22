import type { LexicalEditor } from "lexical";
import { $createCodeNode } from "@lexical/code";
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
// import { INSERT_TABLE_COMMAND } from "@lexical/table";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
} from "lexical";

import type { useModal } from "../../../modal";
import { Icon } from "../../../icons";
import { InsertImage } from "../ImagesPlugin/InsertImage";
import { ComponentPickerOption } from "./types";

// function getDynamicOptions(editor: LexicalEditor, queryString: string) {
//   const options: Array<ComponentPickerOption> = [];
//
//   if (queryString == null) {
//     return options;
//   }
//
//   const tableMatch = queryString.match(/^([1-9]\d?)(?:x([1-9]\d?)?)?$/);
//
//   if (tableMatch !== null) {
//     const rows = tableMatch[1];
//     const colOptions = tableMatch[2]
//       ? [tableMatch[2]]
//       : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(String);
//
//     options.push(
//       ...colOptions.map(
//         (columns) =>
//           new ComponentPickerOption(`${rows}x${columns} Table`, {
//             icon: <Icon icon="radix-icons:table" />,
//             keywords: ["table"],
//             onSelect: () => {
//               rows &&
//                 editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns, rows });
//             },
//           }),
//       ),
//     );
//   }
//
//   return options;
// }

type ShowModal = ReturnType<typeof useModal>[1];

export function getBaseOptions(
  editor: LexicalEditor,
  showModal: ShowModal,
): ComponentPickerOption[] {
  return [
    new ComponentPickerOption("Text", {
      icon: <Icon icon="ph:text-aa-bold" />,
      keywords: ["normal", "paragraph", "p", "text"],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createParagraphNode());
          }
        }),
    }),
    ...([1, 2, 3] as const).map(
      (n) =>
        new ComponentPickerOption(`Heading ${n}`, {
          icon: (
            <Icon
              icon={
                n === 1
                  ? "gravity-ui:heading-1"
                  : (n === 2
                    ? "gravity-ui:heading-2"
                    : "gravity-ui:heading-3")
              }
            />
          ),
          keywords: ["heading", "header", `h${n}`],
          onSelect: () =>
            editor.update(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createHeadingNode(`h${n}`));
              }
            }),
        }),
    ),
    // new ComponentPickerOption("Table", {
    //   icon: <i className="icon table" />,
    //   keywords: ["table", "grid", "spreadsheet", "rows", "columns"],
    //   onSelect: () =>
    //     showModal("Insert Table", (onClose) => (
    //       <InsertTableDialog activeEditor={editor} onClose={onClose} />
    //     )),
    // }),
    new ComponentPickerOption("Numbered List", {
      icon: <Icon icon="mynaui:list-number" />,
      keywords: ["numbered list", "ordered list", "ol"],
      onSelect: () =>
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, void 0),
    }),
    new ComponentPickerOption("Bulleted List", {
      icon: <Icon icon="mynaui:list" />,
      keywords: ["bulleted list", "unordered list", "ul"],
      onSelect: () =>
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, void 0),
    }),
    new ComponentPickerOption("Check List", {
      icon: <Icon icon="mynaui:list-check" />,
      keywords: ["check list", "todo list"],
      onSelect: () => editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, void 0),
    }),
    new ComponentPickerOption("Quote", {
      icon: <Icon icon="pajamas:quote" />,
      keywords: ["block quote"],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createQuoteNode());
          }
        }),
    }),
    new ComponentPickerOption("Code", {
      icon: <Icon icon="ant-design:code-outlined" />,
      keywords: ["javascript", "python", "js", "codeblock"],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();

          if ($isRangeSelection(selection)) {
            if (selection.isCollapsed()) {
              $setBlocksType(selection, () => $createCodeNode());
            } else {
              // Will this ever happen?
              const textContent = selection.getTextContent();
              const codeNode = $createCodeNode();
              selection.insertNodes([codeNode]);
              selection.insertRawText(textContent);
            }
          }
        }),
    }),
    // new ComponentPickerOption("Divider", {
    //   icon: <i className="icon horizontal-rule" />,
    //   keywords: ["horizontal rule", "divider", "hr"],
    //   onSelect: () =>
    //     editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined),
    // }),
    // new ComponentPickerOption("Page Break", {
    //   icon: <i className="icon page-break" />,
    //   keywords: ["page break", "divider"],
    //   onSelect: () => editor.dispatchCommand(INSERT_PAGE_BREAK, undefined),
    // }),
    // new ComponentPickerOption("Excalidraw", {
    //   icon: <i className="icon diagram-2" />,
    //   keywords: ["excalidraw", "diagram", "drawing"],
    //   onSelect: () =>
    //     editor.dispatchCommand(INSERT_EXCALIDRAW_COMMAND, undefined),
    // }),
    // new ComponentPickerOption("Poll", {
    //   icon: <i className="icon poll" />,
    //   keywords: ["poll", "vote"],
    //   onSelect: () =>
    //     showModal("Insert Poll", (onClose) => (
    //       <InsertPollDialog activeEditor={editor} onClose={onClose} />
    //     )),
    // }),
    // ...EmbedConfigs.map(
    //   (embedConfig) =>
    //     new ComponentPickerOption(`Embed ${embedConfig.contentName}`, {
    //       icon: embedConfig.icon,
    //       keywords: [...embedConfig.keywords, "embed"],
    //       onSelect: () =>
    //         editor.dispatchCommand(INSERT_EMBED_COMMAND, embedConfig.type),
    //     }),
    // ),
    // new ComponentPickerOption("Equation", {
    //   icon: <i className="icon equation" />,
    //   keywords: ["equation", "latex", "math"],
    //   onSelect: () =>
    //     showModal("Insert Equation", (onClose) => (
    //       <InsertEquationDialog activeEditor={editor} onClose={onClose} />
    //     )),
    // }),
    // new ComponentPickerOption("GIF", {
    //   icon: <i className="icon gif" />,
    //   keywords: ["gif", "animate", "image", "file"],
    //   onSelect: () =>
    //     editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
    //       altText: "Cat typing on a laptop",
    //       src: catTypingGif,
    //     }),
    // }),
    new ComponentPickerOption("Image", {
      icon: <Icon icon="mi:image" />,
      keywords: ["image", "photo", "picture", "file"],
      onSelect: () =>
        showModal({
          title: "Insert Image",
          content: (onCancel) => (
            <InsertImage activeEditor={editor} onCancel={onCancel} />
          ),
          // onCancel: onClose
        }),
    }),
    // new ComponentPickerOption("Collapsible", {
    //   icon: <i className="icon caret-right" />,
    //   keywords: ["collapse", "collapsible", "toggle"],
    //   onSelect: () =>
    //     editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined),
    // }),
    // new ComponentPickerOption("Columns Layout", {
    //   icon: <i className="icon columns" />,
    //   keywords: ["columns", "layout", "grid"],
    //   onSelect: () =>
    //     showModal("Insert Columns Layout", (onClose) => (
    //       <InsertLayoutDialog activeEditor={editor} onClose={onClose} />
    //     )),
    // }),
    // ...(["left", "center", "right", "justify"] as const).map(
    //   (alignment) =>
    //     new ComponentPickerOption(`Align ${alignment}`, {
    //       icon: <i className={`icon ${alignment}-align`} />,
    //       keywords: ["align", "justify", alignment],
    //       onSelect: () =>
    //         editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment),
    //     }),
    // ),
  ];
}
