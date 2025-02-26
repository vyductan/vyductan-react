import type { EditorState, LexicalEditor } from "lexical";
import { OnChangePlugin as LexicalOnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";

import { setNodePlaceholderFromSelection } from "../utils/set-node-placeholder-from-selection";

type Props = {
  onChange?: (
    editorState: EditorState,
    editor: LexicalEditor,
    tags: Set<string>,
  ) => void;
};
export const OnChangePlugin = ({ onChange }: Props) => {
  // const [editor] = useLexicalComposerContext();
  // useEffect(() => {
  //   return editor.registerUpdateListener((l) => {
  //     console.log("xxxxxx");
  //     // console.log("DATA", listener.editorState.toJSON());
  //     setNodePlaceholderFromSelection(editor);
  //   });
  // }, [editor]);

  return (
    <LexicalOnChangePlugin
      onChange={(editorState, editor, tags) => {
        onChange?.(editorState, editor, tags);

        setNodePlaceholderFromSelection(editor);
      }}
    />
  );
};
