import type { SizeType } from "../config-provider/size-context";
import { Editor } from "./editor";

type EditorPreviewBaseProperties = {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  variant?: "default" | "simple" | "minimal";
  className?: string;
  classNames?: {
    content?: string;
    placeholder?: string;
  };
  autoFocus?: boolean;
  size?: SizeType;
};

type EditorPreviewProperties =
  | (EditorPreviewBaseProperties & { format?: "json" })
  | (EditorPreviewBaseProperties & { format: "markdown" })
  | (EditorPreviewBaseProperties & { format: "html" });

export function EditorPreview({
  format = "json",
  ...properties
}: EditorPreviewProperties) {
  if (format === "markdown") {
    return <Editor {...properties} format="markdown" editable={false} />;
  }

  if (format === "html") {
    return <Editor {...properties} format="html" editable={false} />;
  }

  return <Editor {...properties} format="json" editable={false} />;
}

export type { EditorPreviewProperties as EditorPreviewProps };
