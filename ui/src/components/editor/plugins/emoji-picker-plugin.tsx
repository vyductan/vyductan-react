import type { TextNode } from "lexical";
import { useCallback, useMemo, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { $createTextNode, $getSelection, $isRangeSelection } from "lexical";
import { createPortal } from "react-dom";

import {
  CommandGroup,
  CommandItem,
  CommandList,
  CommandRoot,
} from "@acme/ui/components/command";

import emojiList from "../utils/emoji-list";
import { LexicalTypeaheadMenuPlugin } from "./default/lexical-typeahead-menu-plugin";

class EmojiOption extends MenuOption {
  title: string;
  emoji: string;
  keywords: Array<string>;

  constructor(
    title: string,
    emoji: string,
    options: {
      keywords?: Array<string>;
    },
  ) {
    super(title);
    this.title = title;
    this.emoji = emoji;
    this.keywords = options.keywords ?? [];
  }
}

const MAX_EMOJI_SUGGESTION_COUNT = 10;

export function EmojiPickerPlugin() {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string | null>(null);
  const emojis = emojiList; // Use the static list directly

  const emojiOptions = useMemo(
    () =>
      emojis.map(
        ({ emoji, aliases, tags }) =>
          new EmojiOption(aliases[0] ?? emoji, emoji, {
            keywords: [...aliases, ...tags],
          }),
      ),
    [emojis],
  );

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch(":", {
    minLength: 0,
  });

  const options: Array<EmojiOption> = useMemo(() => {
    return emojiOptions
      .filter((option: EmojiOption) => {
        if (queryString == null) {
          return true;
        }

        const regex = new RegExp(queryString, "i");

        return (
          regex.test(option.title) ||
          option.keywords.some((keyword: string) => regex.test(keyword))
        );
      })
      .slice(0, MAX_EMOJI_SUGGESTION_COUNT);
  }, [emojiOptions, queryString]);

  const onSelectOption = useCallback(
    (
      selectedOption: EmojiOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
    ) => {
      editor.update(() => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          return;
        }

        if (nodeToRemove) {
          nodeToRemove.remove();
        }

        selection.insertNodes([$createTextNode(selectedOption.emoji)]);

        closeMenu();
      });
    },
    [editor],
  );

  return (
    <LexicalTypeaheadMenuPlugin<EmojiOption>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForTriggerMatch}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
      ) => {
        return anchorElementRef.current && options.length > 0
          ? createPortal(
              <div className="fixed w-[200px] rounded-md shadow-md">
                <CommandRoot
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setHighlightedIndex(
                        selectedIndex === null
                          ? options.length - 1
                          : (selectedIndex - 1 + options.length) %
                              options.length,
                      );
                    } else if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setHighlightedIndex(
                        selectedIndex === null
                          ? 0
                          : (selectedIndex + 1) % options.length,
                      );
                    }
                  }}
                >
                  <CommandList>
                    <CommandGroup>
                      {options.map((option, index) => (
                        <CommandItem
                          key={option.key}
                          value={option.title}
                          onSelect={() => {
                            selectOptionAndCleanUp(option);
                          }}
                          className={`flex items-center gap-2 ${
                            selectedIndex === index
                              ? "bg-accent"
                              : "bg-transparent!"
                          }`}
                        >
                          {option.emoji} {option.title}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </CommandRoot>
              </div>,
              anchorElementRef.current,
            )
          : null;
      }}
    />
  );
}
