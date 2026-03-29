import type { SizeType } from "../config-provider/size-context";
import { Editor } from "./editor";

type EditorPreviewBaseProps = {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  variant?: "default" | "simple" | "minimal";
  className?: string;
  contentClassName?: string;
  placeholderClassName?: string;
  autoFocus?: boolean;
  size?: SizeType;
};

type EditorPreviewProps =
  | (EditorPreviewBaseProps & { format?: "json" })
  | (EditorPreviewBaseProps & { format: "markdown" })
  | (EditorPreviewBaseProps & { format: "html" });

export function EditorPreview({ format = "json", ...props }: EditorPreviewProps) {
  if (format === "markdown") {
    return <Editor {...props} format="markdown" editable={false} />;
  }

  if (format === "html") {
    return <Editor {...props} format="html" editable={false} />;
  }

  return <Editor {...props} format="json" editable={false} />;
}

export type { EditorPreviewProps };
