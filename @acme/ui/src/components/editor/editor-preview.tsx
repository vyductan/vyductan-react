import type { EditorProps } from "./editor";
import { Editor } from "./editor";

type EditorPreviewProps = Omit<EditorProps, "editable" | "format" | "onChange">;

export function EditorPreview(props: EditorPreviewProps) {
  return <Editor {...props} editable={false} format="json" />;
}

export type { EditorPreviewProps };
