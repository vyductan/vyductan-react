/* eslint-disable @typescript-eslint/no-non-null-assertion */
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type {
  EmbedConfig,
  EmbedMatchResult,
} from "@lexical/react/LexicalAutoEmbedPlugin";
import type { LexicalEditor } from "lexical";
import type { JSX } from "react";
import { useMemo, useState } from "react";
import { Button } from "@acme/ui/components/button";
import {
  CommandGroup,
  CommandItem,
  CommandList,
  CommandRoot,
} from "@acme/ui/components/command";
import { Input } from "@acme/ui/components/input";
import { DialogFooter } from "@acme/ui/components/modal";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@acme/ui/components/popover";
import {
  AutoEmbedOption,
  LexicalAutoEmbedPlugin,
  URL_MATCHER,
} from "@lexical/react/LexicalAutoEmbedPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { PopoverPortal } from "@radix-ui/react-popover";
import {
  FigmaIcon,
  InstagramIcon,
  YoutubeIcon,
  TwitterIcon,
  MusicIcon,
} from "lucide-react";

import { useEditorModal } from "../../editor-hooks/use-modal";
import { INSERT_FIGMA_COMMAND } from "../../plugins/embeds/figma-plugin";
import { INSERT_INSTAGRAM_COMMAND } from "../../plugins/embeds/instagram-plugin";
import { INSERT_TIKTOK_COMMAND } from "../../plugins/embeds/tiktok-plugin";
import { INSERT_TWITTER_COMMAND } from "../../plugins/embeds/twitter-plugin";
import { INSERT_YOUTUBE_COMMAND } from "../../plugins/embeds/youtube-plugin";

interface PlaygroundEmbedConfig extends EmbedConfig {
  // Human readable name of the embeded content e.g. Tweet or Google Map.
  contentName: string;

  // Icon for display.
  icon?: JSX.Element;

  // An example of a matching url https://twitter.com/jack/status/20
  exampleUrl: string;

  // For extra searching.
  keywords: Array<string>;

  // Embed a Figma Project.
  description?: string;
}

export const YoutubeEmbedConfig: PlaygroundEmbedConfig = {
  contentName: "Youtube Video",

  exampleUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",

  // Icon for display.
  icon: <YoutubeIcon className="size-4" />,

  insertNode: (editor: LexicalEditor, result: EmbedMatchResult) => {
    editor.dispatchCommand(INSERT_YOUTUBE_COMMAND, result.id);
  },

  keywords: ["youtube", "video"],

  // Determine if a given URL is a match and return url data.
  parseUrl: async (url: string) => {
    const match =
      /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/.exec(url);

    const id = match ? (match[2]?.length === 11 ? match[2] : null) : null;

    if (id != null) {
      return {
        id,
        url,
      };
    }

    return null;
  },

  type: "youtube-video",
};

export const FigmaEmbedConfig: PlaygroundEmbedConfig = {
  contentName: "Figma Document",

  exampleUrl: "https://www.figma.com/file/LKQ4FJ4bTnCSjedbRpk931/Sample-File",

  icon: <FigmaIcon className="size-4" />,

  insertNode: (editor: LexicalEditor, result: EmbedMatchResult) => {
    editor.dispatchCommand(INSERT_FIGMA_COMMAND, result.id);
  },

  keywords: ["figma", "figma.com", "mock-up"],

  // Determine if a given URL is a match and return url data.
  parseUrl: (text: string) => {
    const match =
      /https:\/\/([\w.-]+\.)?figma.com\/(file|proto)\/([0-9a-zA-Z]{22,128})(?:\/.*)?$/.exec(
        text,
      );

    if (match != null) {
      return {
        id: match[3]!,
        url: match[0],
      };
    }

    return null;
  },

  type: "figma",
};

export const TwitterEmbedConfig: PlaygroundEmbedConfig = {
  contentName: "Twitter Tweet",
  exampleUrl: "https://twitter.com/elonmusk/status/1234567890",
  icon: <TwitterIcon className="size-4" />,
  insertNode: (editor: LexicalEditor, result: EmbedMatchResult) => {
    editor.dispatchCommand(INSERT_TWITTER_COMMAND, result.id);
  },
  keywords: ["twitter", "tweet", "x.com"],
  parseUrl: async (url: string) => {
    // Match: https://twitter.com/username/status/1234567890
    // or: https://x.com/username/status/1234567890
    const match =
      /(?:twitter\.com|x\.com)\/(?:\w+\/)?status\/(\d+)/.exec(url);

    if (match && match[1]) {
      return {
        id: match[1],
        url,
      };
    }

    return null;
  },
  type: "twitter-tweet",
};

export const InstagramEmbedConfig: PlaygroundEmbedConfig = {
  contentName: "Instagram Post",
  exampleUrl: "https://www.instagram.com/p/ABC123/",
  icon: <InstagramIcon className="size-4" />,
  insertNode: (editor: LexicalEditor, result: EmbedMatchResult) => {
    editor.dispatchCommand(INSERT_INSTAGRAM_COMMAND, result.id);
  },
  keywords: ["instagram", "ig", "post"],
  parseUrl: async (url: string) => {
    // Match: https://www.instagram.com/p/ABC123/
    const match = /instagram\.com\/p\/([A-Za-z0-9_-]+)/.exec(url);

    if (match && match[1]) {
      return {
        id: match[1],
        url,
      };
    }

    return null;
  },
  type: "instagram-post",
};

export const TikTokEmbedConfig: PlaygroundEmbedConfig = {
  contentName: "TikTok Video",
  exampleUrl: "https://www.tiktok.com/@username/video/1234567890",
  icon: <MusicIcon className="size-4" />,
  insertNode: (editor: LexicalEditor, result: EmbedMatchResult) => {
    editor.dispatchCommand(INSERT_TIKTOK_COMMAND, {
      videoId: result.id,
      username: (result as any).username,
    });
  },
  keywords: ["tiktok", "video", "short"],
  parseUrl: async (url: string) => {
    // Match: https://www.tiktok.com/@username/video/1234567890
    const match = /tiktok\.com\/@(\w+)\/video\/(\d+)/.exec(url);

    if (match && match[2]) {
      return {
        id: match[2],
        url,
        username: match[1],
      };
    }

    return null;
  },
  type: "tiktok-video",
};

export const EmbedConfigs = [
  YoutubeEmbedConfig,
  FigmaEmbedConfig,
  TwitterEmbedConfig,
  InstagramEmbedConfig,
  TikTokEmbedConfig,
];

const debounce = (callback: (text: string) => void, delay: number) => {
  let timeoutId: number;
  return (text: string) => {
    globalThis.clearTimeout(timeoutId);
    timeoutId = globalThis.setTimeout(() => {
      callback(text);
    }, delay) as unknown as number;
  };
};

export function AutoEmbedDialog({
  embedConfig,
  onClose,
}: {
  embedConfig: PlaygroundEmbedConfig;
  onClose: () => void;
}): JSX.Element {
  const [text, setText] = useState("");
  const [editor] = useLexicalComposerContext();
  const [embedResult, setEmbedResult] = useState<EmbedMatchResult | null>(null);

  const validateText = useMemo(
    () =>
      debounce((inputText: string) => {
        const urlMatch = URL_MATCHER.exec(inputText);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (embedConfig != null && inputText != null && urlMatch != null) {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          Promise.resolve(embedConfig.parseUrl(inputText)).then(
            (parseResult) => {
              setEmbedResult(parseResult);
            },
          );
        } else if (embedResult != null) {
          setEmbedResult(null);
        }
      }, 200),
    [embedConfig, embedResult],
  );

  const onClick = () => {
    if (embedResult != null) {
      embedConfig.insertNode(editor, embedResult);
      onClose();
    }
  };

  return (
    <div className="">
      <div className="space-y-4">
        <Input
          type="text"
          placeholder={embedConfig.exampleUrl}
          value={text}
          data-test-id={`${embedConfig.type}-embed-modal-url`}
          onChange={(e) => {
            const { value } = e.target;
            setText(value);
            validateText(value);
          }}
        />
        <DialogFooter>
          <Button
            disabled={!embedResult}
            onClick={onClick}
            data-test-id={`${embedConfig.type}-embed-modal-submit-btn`}
          >
            Embed
          </Button>
        </DialogFooter>
      </div>
    </div>
  );
}

export function AutoEmbedPlugin(): JSX.Element {
  const [modal, showModal] = useEditorModal();

  const openEmbedModal = (embedConfig: PlaygroundEmbedConfig) => {
    showModal(`Embed ${embedConfig.contentName}`, (onClose) => (
      <AutoEmbedDialog embedConfig={embedConfig} onClose={onClose} />
    ));
  };

  const getMenuOptions = (
    activeEmbedConfig: PlaygroundEmbedConfig,
    embedFn: () => void,
    dismissFn: () => void,
  ) => {
    return [
      new AutoEmbedOption("Dismiss", {
        onSelect: dismissFn,
      }),
      new AutoEmbedOption(`Embed ${activeEmbedConfig.contentName}`, {
        onSelect: embedFn,
      }),
    ];
  };

  return (
    <>
      {modal}
      <LexicalAutoEmbedPlugin<PlaygroundEmbedConfig>
        embedConfigs={EmbedConfigs}
        onOpenEmbedModalForConfig={openEmbedModal}
        getMenuOptions={getMenuOptions}
        menuRenderFn={(
          anchorElementRef,
          { options, selectOptionAndCleanUp },
        ) => {
          return anchorElementRef.current ? (
            <Popover open={true}>
              <PopoverPortal container={anchorElementRef.current}>
                <div className="-translate-y-full transform">
                  <PopoverTrigger />
                  <PopoverContent
                    className="w-[200px] p-0"
                    align="start"
                    side="right"
                  >
                    <CommandRoot>
                      <CommandList>
                        <CommandGroup>
                          {options.map((option) => (
                            <CommandItem
                              key={option.key}
                              value={option.title}
                              onSelect={() => {
                                selectOptionAndCleanUp(option);
                              }}
                              className="flex items-center gap-2"
                            >
                              {option.title}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </CommandRoot>
                  </PopoverContent>
                </div>
              </PopoverPortal>
            </Popover>
          ) : null;
        }}
      />
    </>
  );
}
