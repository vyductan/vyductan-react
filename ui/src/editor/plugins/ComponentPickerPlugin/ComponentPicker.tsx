import type { TextNode } from "lexical";
import { useCallback, useMemo, useState } from "react";
import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import * as ReactDOM from "react-dom";

import type { ComponentPickerOption } from "./types";
import { useModal } from "../../../modal";
import { ComponentPickerMenuItem } from "./ComponentPickerMenuItem";
import { getBaseOptions } from "./options";

export default function ComponentPickerMenuPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [modal, showModal] = useModal();
  const [queryString, setQueryString] = useState<string | null>(null);

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
  });

  const options = useMemo(() => {
    const baseOptions = getBaseOptions(editor, showModal);

    if (!queryString) {
      return baseOptions;
    }

    const regex = new RegExp(queryString, "i");

    return ( 
      // ...getDynamicOptions(editor, queryString),
      baseOptions.filter(
        (option) =>
          regex.test(option.title) ||
          option.keywords.some((keyword) => regex.test(keyword)),
      )
    );
  }, [editor, queryString, showModal]);

  const onSelectOption = useCallback(
    (
      selectedOption: ComponentPickerOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
      matchingString: string,
    ) => {
      editor.update(() => {
        nodeToRemove?.remove();
        selectedOption.onSelect(matchingString);
        closeMenu();
      });
    },
    [editor],
  );

  return (
    <>
      {modal}
      <LexicalTypeaheadMenuPlugin<ComponentPickerOption>
        onQueryChange={setQueryString}
        onSelectOption={onSelectOption}
        triggerFn={checkForTriggerMatch}
        options={options}
        menuRenderFn={(
          anchorElementRef,
          { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
        ) =>
          anchorElementRef.current && options.length > 0
            ? ReactDOM.createPortal(
                <div className="min-w-48 rounded-sm border border-border p-1">
                  <ul>
                    {options.map((option, index: number) => (
                      <ComponentPickerMenuItem
                        index={index}
                        isSelected={selectedIndex === index}
                        onClick={() => {
                          setHighlightedIndex(index);
                          selectOptionAndCleanUp(option);
                        }}
                        onMouseEnter={() => {
                          setHighlightedIndex(index);
                        }}
                        key={option.key}
                        option={option}
                      />
                    ))}
                  </ul>
                </div>,
                anchorElementRef.current,
              )
            : null
        }
      />
    </>
  );
}
