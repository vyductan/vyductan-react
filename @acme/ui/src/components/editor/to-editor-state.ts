/**
 * Whatever a caller stored, as an editor state Lexical can deserialise.
 *
 * `value` is documented as a Lexical editor-state JSON string, and the state is
 * read once — `LexicalComposer` takes it as `initialConfig.editorState`, so a
 * value the editor rejects is not a warning, it is a blank editor for as long as
 * the component is mounted.
 *
 * That rejection used to be the whole behaviour: anything failing JSON.parse was
 * logged and dropped. But a column of task bodies is exactly the kind of place
 * plain prose ends up — written by an API, an import, an agent, or an older
 * version of the app — and the editor is then the only thing standing between a
 * user and their text. Worse where a form autosaves: the user types into what
 * looks like an empty body, and the save replaces the prose they never saw.
 *
 * So prose becomes a document rather than nothing. A string that already
 * deserialises is passed through untouched — re-wrapping it would nest the
 * document inside a paragraph and lose its formatting.
 */

const textNode = (text: string) => ({
  detail: 0,
  format: 0,
  mode: "normal",
  style: "",
  text,
  type: "text",
  version: 1,
});

const paragraphNode = (text: string) => ({
  children: text ? [textNode(text)] : [],
  direction: text ? "ltr" : null,
  format: "",
  indent: 0,
  type: "paragraph",
  version: 1,
});

/**
 * True when the string is a serialised editor state — parses, and has a root.
 *
 * The root check matters: a body that opens with a JSON snippet parses fine and
 * would otherwise be handed to Lexical as a document, which renders nothing.
 */
export const isSerializedEditorState = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed.startsWith("{")) return false;
  try {
    const parsed: unknown = JSON.parse(trimmed);
    return typeof parsed === "object" && parsed !== null && "root" in parsed;
  } catch {
    return false;
  }
};

/**
 * Plain text as an editor state, one paragraph per line.
 *
 * Blank lines survive as empty paragraphs: in prose they are the paragraph
 * breaks, and collapsing them reflows the text into a single block.
 */
export const plainTextToEditorState = (text: string): string =>
  JSON.stringify({
    root: {
      children: text.replaceAll("\r\n", "\n").split("\n").map(paragraphNode),
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  });

export const toEditorState = (value: string): string =>
  isSerializedEditorState(value) ? value : plainTextToEditorState(value);
