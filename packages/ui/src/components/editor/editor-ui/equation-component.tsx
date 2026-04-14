/* eslint-disable unicorn/no-null -- Lexical APIs and serialized editor fixtures intentionally use null semantics. */
/* eslint-disable react-hooks/set-state-in-effect */
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type { NodeKey } from "lexical";
import type { JSX } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import { mergeRegister } from "@lexical/utils";
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  COMMAND_PRIORITY_HIGH,
  KEY_ESCAPE_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { ErrorBoundary } from "react-error-boundary";

import EquationEditor from "../editor-ui/equation-editor";
import KatexRenderer from "../editor-ui/katex-renderer";
import { $isEquationNode } from "../nodes/equation-node";

type EquationComponentProperties = {
  equation: string;
  inline: boolean;
  nodeKey: NodeKey;
};

export default function EquationComponent({
  equation,
  inline,
  nodeKey,
}: EquationComponentProperties): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const isEditable = useLexicalEditable();
  const [equationValue, setEquationValue] = useState(equation);
  const [showEquationEditor, setShowEquationEditor] = useState<boolean>(false);
  const inputReference = useRef(null);

  const onHide = useCallback(
    (restoreSelection?: boolean) => {
      setShowEquationEditor(false);
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isEquationNode(node)) {
          node.setEquation(equationValue);
          if (restoreSelection) {
            node.selectNext(0, 0);
          }
        }
      });
    },
    [editor, equationValue, nodeKey],
  );

  useEffect(() => {
    if (!showEquationEditor && equationValue !== equation) {
      setEquationValue(equation);
    }
  }, [showEquationEditor, equation, equationValue]);

  useEffect(() => {
    if (!isEditable) {
      return;
    }
    return showEquationEditor
      ? mergeRegister(
          editor.registerCommand(
            SELECTION_CHANGE_COMMAND,
            () => {
              const activeElement = document.activeElement;
              const inputElement = inputReference.current;
              if (inputElement !== activeElement) {
                onHide();
              }
              return false;
            },
            COMMAND_PRIORITY_HIGH,
          ),
          editor.registerCommand(
            KEY_ESCAPE_COMMAND,
            () => {
              const activeElement = document.activeElement;
              const inputElement = inputReference.current;
              if (inputElement === activeElement) {
                onHide(true);
                return true;
              }
              return false;
            },
            COMMAND_PRIORITY_HIGH,
          ),
        )
      : editor.registerUpdateListener(({ editorState }) => {
          const isSelected = editorState.read(() => {
            const selection = $getSelection();
            return (
              $isNodeSelection(selection) &&
              selection.has(nodeKey) &&
              selection.getNodes().length === 1
            );
          });
          if (isSelected) {
            setShowEquationEditor(true);
          }
        });
  }, [editor, nodeKey, onHide, showEquationEditor, isEditable]);

  return (
    <>
      {showEquationEditor && isEditable ? (
        <EquationEditor
          equation={equationValue}
          setEquation={setEquationValue}
          inline={inline}
          ref={inputReference}
        />
      ) : (
        <ErrorBoundary
          onError={(e) => editor._onError(e as Error)}
          fallback={null}
        >
          <KatexRenderer
            equation={equationValue}
            inline={inline}
            onDoubleClick={() => {
              if (isEditable) {
                setShowEquationEditor(true);
              }
            }}
          />
        </ErrorBoundary>
      )}
    </>
  );
}
