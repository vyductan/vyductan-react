import "@testing-library/jest-dom/vitest";

import type { LexicalEditor } from "lexical";
import * as React from "react";
import { $generateHtmlFromNodes } from "@lexical/html";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { $getRoot, PASTE_COMMAND, UNDO_COMMAND } from "lexical";
import { afterEach, expect, test, vi } from "vitest";

import type { ResolvePasteLink } from "./paste-as-plugin";
import { nodes } from "../nodes/nodes";
import { AutoLinkPlugin } from "./auto-link-plugin";
import { LinkPlugin } from "./link-plugin";
import { MarkdownPastePlugin } from "./markdown-paste-plugin";
import { normalizeHtmlOutput } from "./normalize-html-output";
import { PasteAsPlugin } from "./paste-as-plugin";

Object.assign(globalThis, { React });

// jsdom ships neither DragEvent nor ClipboardEvent, and Lexical's own rich-text
// paste handler compares the event against both before doing anything. Without
// these the default paste path — the one this plugin deliberately does NOT
// replace — throws before it can insert a thing. Stand-in classes are enough:
// Lexical compares constructor names, so a plain clipboard payload still takes
// the text branch rather than the file branch.
for (const name of ["DragEvent", "ClipboardEvent"]) {
  if (!(name in globalThis)) {
    Object.assign(globalThis, { [name]: class extends MouseEvent {} });
  }
}

const PAGE_URL = "https://example.com/p/tour-information";

function EditorRefPlugin({
  onReady,
}: {
  onReady: (editor: LexicalEditor) => void;
}) {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    onReady(editor);
  }, [editor, onReady]);

  return null;
}

function PasteAsHarness({
  resolvePasteLink,
  onReady,
  onHtml,
}: {
  resolvePasteLink?: ResolvePasteLink;
  onReady: (editor: LexicalEditor) => void;
  onHtml?: (html: string) => void;
}) {
  return (
    <LexicalComposer
      initialConfig={{
        namespace: "PasteAsPluginTest",
        theme: {},
        nodes: nodes as never,
        onError: (error) => {
          throw error;
        },
      }}
    >
      <RichTextPlugin
        contentEditable={<ContentEditable aria-label="Paste as editor" />}
        placeholder={null}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <LinkPlugin />
      <AutoLinkPlugin />
      {/* Mounted so the neutrality claim is exercised, not assumed. */}
      <MarkdownPastePlugin />
      <PasteAsPlugin
        anchorElem={document.body}
        resolvePasteLink={resolvePasteLink}
      />
      <EditorRefPlugin onReady={onReady} />
      <OnChangePlugin
        ignoreSelectionChange={true}
        onChange={(editorState, editor) => {
          editorState.read(() => {
            onHtml?.(normalizeHtmlOutput($generateHtmlFromNodes(editor, null)));
          });
        }}
      />
    </LexicalComposer>
  );
}

type Harness = {
  editor: LexicalEditor;
  html: () => string;
  paste: (text: string, html?: string) => void;
};

async function mountHarness(
  resolvePasteLink?: ResolvePasteLink,
): Promise<Harness> {
  let editor: LexicalEditor | null = null;
  let latestHtml = "";

  render(
    <PasteAsHarness
      resolvePasteLink={resolvePasteLink}
      onReady={(nextEditor) => {
        editor = nextEditor;
      }}
      onHtml={(html) => {
        latestHtml = html;
      }}
    />,
  );

  await waitFor(() => {
    expect(editor).not.toBeNull();
  });

  const readyEditor = editor as unknown as LexicalEditor;

  act(() => {
    readyEditor.update(() => {
      $getRoot().selectEnd();
    });
  });

  return {
    editor: readyEditor,
    html: () => latestHtml,
    paste: (text: string, html = "") => {
      act(() => {
        readyEditor.dispatchCommand(PASTE_COMMAND, {
          clipboardData: {
            getData: (type: string) => {
              if (type === "text/plain") return text;
              if (type === "text/html") return html;
              return "";
            },
          },
          preventDefault: vi.fn(),
        } as unknown as ClipboardEvent);
      });
    },
  };
}

const resolvesTo =
  (resolved: { title: string; icon?: string; url?: string } | null) =>
  (): { title: string; icon?: string; url?: string } | null =>
    resolved;

function popover() {
  return screen.queryByRole("listbox", { name: /paste as/i });
}

async function findPopover() {
  return await screen.findByRole("listbox", { name: /paste as/i });
}

function optionLabels() {
  return screen.getAllByRole("option").map((node) => node.textContent ?? "");
}

function activeOptionLabel() {
  const active = screen
    .getAllByRole("option")
    .find((node) => node.getAttribute("aria-selected") === "true");
  return active?.textContent ?? null;
}

function pressOnEditor(key: string) {
  const editable = screen.getByRole("textbox");
  act(() => {
    fireEvent.keyDown(editable, { key });
  });
}

afterEach(() => {
  cleanup();
});

test("pasting a resolvable url leaves the url in the document and offers the choice", async () => {
  const harness = await mountHarness(
    resolvesTo({ title: "Tour Information", icon: "📘" }),
  );

  harness.paste(PAGE_URL);

  await findPopover();

  expect(optionLabels()).toEqual([
    expect.stringContaining("Tour Information"),
    expect.stringContaining("URL"),
  ]);
  expect(harness.html()).toContain(PAGE_URL);
});

test("offers nothing when the host declines the url", async () => {
  const harness = await mountHarness(resolvesTo(null));

  harness.paste(PAGE_URL);

  await waitFor(() => {
    expect(harness.html()).toContain(PAGE_URL);
  });
  expect(popover()).not.toBeInTheDocument();
});

test("offers nothing when the host supplies no resolver", async () => {
  const harness = await mountHarness();

  harness.paste(PAGE_URL);

  await waitFor(() => {
    expect(harness.html()).toContain(PAGE_URL);
  });
  expect(popover()).not.toBeInTheDocument();
});

test("choosing mention rewrites the link text and marks it as a mention", async () => {
  const harness = await mountHarness(
    resolvesTo({ title: "Tour Information", icon: "📘" }),
  );

  harness.paste(PAGE_URL);
  await findPopover();

  act(() => {
    fireEvent.click(screen.getAllByRole("option")[0] as HTMLElement);
  });

  await waitFor(() => {
    expect(harness.html()).toContain("📘 Tour Information");
  });

  const document_ = new DOMParser().parseFromString(
    harness.html(),
    "text/html",
  );
  const anchor = document_.body.querySelector("a");
  expect(anchor?.getAttribute("href")).toBe(PAGE_URL);
  expect(anchor?.getAttribute("rel")).toContain("mention");
  expect(anchor?.textContent).toBe("📘 Tour Information");
  expect(harness.html()).not.toContain(`>${PAGE_URL}<`);
});

test("falls back to a default glyph when the host supplies no icon", async () => {
  const harness = await mountHarness(resolvesTo({ title: "Tour Information" }));

  harness.paste(PAGE_URL);
  await findPopover();

  act(() => {
    fireEvent.click(screen.getAllByRole("option")[0] as HTMLElement);
  });

  await waitFor(() => {
    expect(harness.html()).toContain("📄 Tour Information");
  });
});

test("retargets the link when the host returns a canonical url", async () => {
  const harness = await mountHarness(
    resolvesTo({
      title: "Tour Information",
      icon: "📘",
      url: "https://example.com/canonical",
    }),
  );

  harness.paste(`${PAGE_URL}?utm_source=chat`);
  await findPopover();

  act(() => {
    fireEvent.click(screen.getAllByRole("option")[0] as HTMLElement);
  });

  await waitFor(() => {
    const document_ = new DOMParser().parseFromString(
      harness.html(),
      "text/html",
    );
    expect(document_.body.querySelector("a")?.getAttribute("href")).toBe(
      "https://example.com/canonical",
    );
  });
});

test("choosing url leaves the document exactly as the plain paste left it", async () => {
  const plain = await mountHarness(resolvesTo(null));
  plain.paste(PAGE_URL);
  await waitFor(() => {
    expect(plain.html()).toContain(PAGE_URL);
  });
  const withoutOffer = plain.html();
  cleanup();

  const harness = await mountHarness(
    resolvesTo({ title: "Tour Information", icon: "📘" }),
  );
  harness.paste(PAGE_URL);
  await findPopover();

  act(() => {
    fireEvent.click(screen.getAllByRole("option")[1] as HTMLElement);
  });

  await waitFor(() => {
    expect(popover()).not.toBeInTheDocument();
  });
  expect(harness.html()).toBe(withoutOffer);
});

test("enter with no arrow keys chooses mention, so the default focus is real", async () => {
  const harness = await mountHarness(
    resolvesTo({ title: "Tour Information", icon: "📘" }),
  );

  harness.paste(PAGE_URL);
  await findPopover();

  expect(activeOptionLabel()).toContain("Tour Information");

  pressOnEditor("Enter");

  await waitFor(() => {
    expect(harness.html()).toContain("📘 Tour Information");
  });
});

test("arrow down moves to url and arrow up wraps back to mention", async () => {
  const harness = await mountHarness(
    resolvesTo({ title: "Tour Information", icon: "📘" }),
  );

  harness.paste(PAGE_URL);
  await findPopover();

  pressOnEditor("ArrowDown");
  await waitFor(() => {
    expect(activeOptionLabel()).toContain("URL");
  });

  pressOnEditor("ArrowDown");
  await waitFor(() => {
    expect(activeOptionLabel()).toContain("Tour Information");
  });

  pressOnEditor("ArrowUp");
  await waitFor(() => {
    expect(activeOptionLabel()).toContain("URL");
  });

  pressOnEditor("Enter");

  await waitFor(() => {
    expect(popover()).not.toBeInTheDocument();
  });
  expect(harness.html()).toContain(PAGE_URL);
  expect(harness.html()).not.toContain("Tour Information");
});

test("escape dismisses the offer and leaves the pasted url alone", async () => {
  const harness = await mountHarness(
    resolvesTo({ title: "Tour Information", icon: "📘" }),
  );

  harness.paste(PAGE_URL);
  await findPopover();

  pressOnEditor("Escape");

  await waitFor(() => {
    expect(popover()).not.toBeInTheDocument();
  });
  expect(harness.html()).toContain(PAGE_URL);
  expect(harness.html()).not.toContain("Tour Information");
});

test("typing dismisses the offer and the character still reaches the editor", async () => {
  const harness = await mountHarness(
    resolvesTo({ title: "Tour Information", icon: "📘" }),
  );

  harness.paste(PAGE_URL);
  await findPopover();

  // Dispatched by hand so the event object can be inspected afterwards: what
  // matters is that dismissing did not swallow the keystroke, and only
  // `defaultPrevented` can say so. Asserting inserted text here would prove
  // nothing, since jsdom never types on the editor's behalf.
  const editable = screen.getByRole("textbox");
  const keyEvent = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    key: "x",
  });

  act(() => {
    editable.dispatchEvent(keyEvent);
  });

  await waitFor(() => {
    expect(popover()).not.toBeInTheDocument();
  });
  expect(keyEvent.defaultPrevented).toBe(false);
});

test("enter splits the paragraph again once the offer is gone", async () => {
  const harness = await mountHarness(
    resolvesTo({ title: "Tour Information", icon: "📘" }),
  );

  harness.paste(PAGE_URL);
  await findPopover();

  pressOnEditor("Escape");
  await waitFor(() => {
    expect(popover()).not.toBeInTheDocument();
  });

  const paragraphsBefore = (harness.html().match(/<p/g) ?? []).length;

  // A real Enter, so this exercises the command being unregistered rather than
  // the editor API being called directly.
  pressOnEditor("Enter");

  await waitFor(() => {
    expect((harness.html().match(/<p/g) ?? []).length).toBeGreaterThan(
      paragraphsBefore,
    );
  });
});

test("leaves a markdown paste to the markdown plugin and offers nothing", async () => {
  const resolve = vi.fn(resolvesTo({ title: "Tour Information" }));
  const harness = await mountHarness(resolve as unknown as ResolvePasteLink);

  harness.paste(["# Heading", "", `- a link [here](${PAGE_URL})`].join("\n"));

  await waitFor(() => {
    expect(harness.html()).toContain("<h1");
  });
  expect(popover()).not.toBeInTheDocument();
  expect(resolve).not.toHaveBeenCalled();
});

test("offers nothing for multi-line text that merely contains a url", async () => {
  const resolve = vi.fn(resolvesTo({ title: "Tour Information" }));
  const harness = await mountHarness(resolve as unknown as ResolvePasteLink);

  harness.paste(`See ${PAGE_URL}\nfor details`);

  await waitFor(() => {
    expect(harness.html()).toContain("for details");
  });
  expect(popover()).not.toBeInTheDocument();
  expect(resolve).not.toHaveBeenCalled();
});

test("drops a resolution that arrives after the pasted link is gone", async () => {
  let settle: (value: { title: string } | null) => void = () => undefined;
  const harness = await mountHarness(
    () =>
      new Promise<{ title: string } | null>((resolve) => {
        settle = resolve;
      }),
  );

  harness.paste(PAGE_URL);

  act(() => {
    harness.editor.update(() => {
      $getRoot().clear();
    });
  });

  await act(async () => {
    settle({ title: "Tour Information" });
    await Promise.resolve();
  });

  expect(popover()).not.toBeInTheDocument();
});

test("choosing mention reaches the change handler, so a host can save it", async () => {
  const harness = await mountHarness(
    resolvesTo({ title: "Tour Information", icon: "📘" }),
  );

  harness.paste(PAGE_URL);
  await findPopover();

  const htmlBefore = harness.html();

  act(() => {
    fireEvent.click(screen.getAllByRole("option")[0] as HTMLElement);
  });

  await waitFor(() => {
    expect(harness.html()).not.toBe(htmlBefore);
  });
  expect(harness.html()).toContain("Tour Information");
});

test("one undo puts the pasted url back", async () => {
  const harness = await mountHarness(
    resolvesTo({ title: "Tour Information", icon: "📘" }),
  );

  harness.paste(PAGE_URL);
  await findPopover();

  act(() => {
    fireEvent.click(screen.getAllByRole("option")[0] as HTMLElement);
  });

  await waitFor(() => {
    expect(harness.html()).toContain("Tour Information");
  });

  act(() => {
    harness.editor.dispatchCommand(UNDO_COMMAND, undefined);
  });

  await waitFor(() => {
    expect(harness.html()).toContain(PAGE_URL);
  });
  expect(harness.html()).not.toContain("Tour Information");
});

test("a second paste supersedes the first, even when the first resolves later", async () => {
  const settlers: (() => void)[] = [];
  const titles = ["First page", "Second page"];
  let call = 0;

  const harness = await mountHarness(
    () =>
      new Promise<{ title: string } | null>((resolve) => {
        const index = call++;
        settlers.push(() => resolve({ title: titles[index] as string }));
      }),
  );

  const flush = async () => {
    await act(async () => {
      await Promise.resolve();
    });
  };

  harness.paste(PAGE_URL);
  // Let the first paste's lookup actually start. Lexical's update listeners run
  // on a microtask, so without this the two pastes land in one batch and the
  // first never reaches the resolver at all.
  await flush();

  // A new line between them, because two pastes with nothing in between merge
  // into a single auto-link and neither URL survives as itself.
  act(() => {
    harness.editor.update(() => {
      $getRoot().selectEnd().insertParagraph();
    });
  });

  harness.paste("https://example.com/p/second");
  await flush();

  expect(settlers).toHaveLength(2);

  // The second lookup answers first; the stale first one lands afterwards with
  // its node still in the document, so only the supersede token can tell that
  // its offer no longer belongs on screen.
  await act(async () => {
    settlers[1]?.();
    settlers[0]?.();
    await Promise.resolve();
  });

  await findPopover();
  expect(optionLabels()[0]).toContain("Second page");
  expect(optionLabels()[0]).not.toContain("First page");
});
