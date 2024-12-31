import type { LexicalEditor } from "lexical";
import type { JSX } from "react";
import { useEffect, useRef } from "react";

import type { InsertImagePayload } from "./types";
import { Tabs } from "../../../tabs";
import { INSERT_IMAGE_COMMAND } from "./constants";
import { Uploader } from "./uploader";

export const InsertImage = ({
  activeEditor,
  onCancel,
}: {
  activeEditor: LexicalEditor;
  onCancel: () => void;
}): JSX.Element => {
  const hasModifier = useRef(false);

  useEffect(() => {
    hasModifier.current = false;
    const handler = (e: KeyboardEvent) => {
      hasModifier.current = e.altKey;
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [activeEditor]);

  const onChoiceImage = (payload: InsertImagePayload) => {
    activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
    onCancel();
  };

  return (
    <>
      <Tabs
        items={[
          {
            key: "upload",
            label: "Upload",
            children: <Uploader onUploadSuccess={onChoiceImage} />,
          },
          {
            key: "embed",
            label: "Embed Link",
            children: "Embed Link",
          },
          {
            key: "unsplash",
            label: "Unsplash",
            children: "Unsplash Image",
          },
        ]}
        // onChange={(activeKey) => setMode(activeKey}
      />
    </>
  );
};
