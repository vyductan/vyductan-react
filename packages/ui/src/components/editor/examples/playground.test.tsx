/* eslint-disable unicorn/no-null -- Lexical APIs and serialized editor fixtures intentionally use null semantics. */
import "@testing-library/jest-dom/vitest";

import { createElement } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { editorRenderSourceFixtures } from "../render/render-fixtures";
import PlaygroundDemo from "./playground";

vi.mock("../editor", async () => {
  const React = await import("react");
  let nextEditorInstanceId = 0;

  return {
    Editor: ({
      autoFocus = false,
      editable = true,
      format = "json",
      onChange,
      onStatsChange,
      placeholder,
      value = "",
      variant = "default",
    }: {
      autoFocus?: boolean;
      editable?: boolean;
      format?: "json" | "markdown" | "html";
      onChange?: (value: string, editorState: unknown) => void;
      onStatsChange?: (stats: {
        wordCount: number;
        characterCount: number;
        readingTimeMinutes: number;
      }) => void;
      placeholder?: string;
      value?: string;
      variant?: string;
    }) => {
      const instanceId = React.useRef(nextEditorInstanceId++);
      const [draftValue, setDraftValue] = React.useState(value);

      React.useEffect(() => {
        const trimmedValue = draftValue.trim();
        const wordCount = trimmedValue ? trimmedValue.split(/\s+/).length : 0;

        onStatsChange?.({
          wordCount,
          characterCount: draftValue.length,
          readingTimeMinutes: wordCount === 0 ? 0 : 1,
        });
      }, [draftValue, onStatsChange]);

      return createElement(
        "div",
        undefined,
        createElement(
          "output",
          { "data-testid": "editor-props" },
          JSON.stringify({
            instanceId: instanceId.current,
            format,
            variant,
            editable,
            autoFocus,
            placeholder,
          }),
        ),
        createElement("textarea", {
          "aria-label": `${format} editor`,
          onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => {
            const nextValue = event.target.value;
            setDraftValue(nextValue);
            onChange?.(nextValue, {});
          },
          placeholder,
          readOnly: !editable,
          value: draftValue,
        }),
      );
    },
  };
});

afterEach(() => {
  cleanup();
});

describe("PlaygroundDemo", () => {
  test("uses table content as the default preset for json, markdown, and html", async () => {
    render(createElement(PlaygroundDemo));

    expect(screen.getByRole("button", { name: "JSON" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByRole("heading", { name: /json output/i }),
    ).toBeInTheDocument();

    const jsonEditor = screen.getByRole("textbox", { name: /json editor/i });
    expect((jsonEditor as HTMLTextAreaElement).value).toContain("table");
    expect((jsonEditor as HTMLTextAreaElement).value).toContain("Header A");

    fireEvent.click(screen.getByRole("button", { name: "Markdown" }));

    expect(
      screen.getByRole("heading", { name: /markdown output/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: /markdown editor/i }),
    ).toHaveValue(editorRenderSourceFixtures.table.markdown);

    fireEvent.click(screen.getByRole("button", { name: "HTML" }));

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /html editor/i })).toHaveValue(
        editorRenderSourceFixtures.table.html,
      );
      expect(screen.getByLabelText(/serialized output/i)).toHaveTextContent(
        "<table>",
      );
    });
  });

  test("switches formats and remounts the editor when a preset is applied", async () => {
    render(createElement(PlaygroundDemo));

    fireEvent.click(
      screen.getByRole("button", {
        name: /checklist structured content for validating serialized editor state\./i,
      }),
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/serialized output/i)).toHaveTextContent(
        /release checklist/i,
      );
      expect(
        (
          screen.getByRole("textbox", {
            name: /json editor/i,
          }) as HTMLTextAreaElement
        ).value,
      ).toMatch(/release checklist/i);
    });

    fireEvent.click(screen.getByRole("button", { name: "Markdown" }));

    fireEvent.click(
      screen.getByRole("button", {
        name: /docs technical documentation style content\./i,
      }),
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/serialized output/i)).toHaveTextContent(
        /# api integration guide/i,
      );
      expect(
        (
          screen.getByRole("textbox", {
            name: /markdown editor/i,
          }) as HTMLTextAreaElement
        ).value,
      ).toMatch(/# api integration guide/i);
    });
  });

  test("keeps the same editor instance while typing and remounts only for preset changes", async () => {
    render(createElement(PlaygroundDemo));

    const initialEditorProperties = JSON.parse(
      screen.getByTestId("editor-props").textContent ?? "{}",
    ) as { instanceId: number };

    fireEvent.change(screen.getByRole("textbox", { name: /json editor/i }), {
      target: {
        value: JSON.stringify(
          {
            root: {
              type: "root",
              format: "",
              indent: 0,
              version: 1,
              direction: "ltr",
              children: [
                {
                  type: "paragraph",
                  format: "",
                  indent: 0,
                  version: 1,
                  direction: "ltr",
                  children: [
                    {
                      detail: 0,
                      format: 0,
                      mode: "normal",
                      style: "",
                      text: "Drafting without remounting the editor.",
                      type: "text",
                      version: 1,
                    },
                  ],
                },
              ],
            },
          },
          null,
          2,
        ),
      },
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/serialized output/i)).toHaveTextContent(
        /drafting without remounting the editor/i,
      );
      expect(screen.getByTestId("editor-props")).toHaveTextContent(
        `"instanceId":${initialEditorProperties.instanceId}`,
      );
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /checklist structured content for validating serialized editor state\./i,
      }),
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/serialized output/i)).toHaveTextContent(
        /release checklist/i,
      );
      expect(screen.getByTestId("editor-props")).not.toHaveTextContent(
        `"instanceId":${initialEditorProperties.instanceId}`,
      );
    });
  });

  test("pretty-prints serialized json output without mutating the editor textbox value", async () => {
    render(createElement(PlaygroundDemo));

    const minifiedJson =
      '{"root":{"type":"root","format":"","indent":0,"version":1,"direction":"ltr","children":[{"type":"paragraph","format":"","indent":0,"version":1,"direction":"ltr","children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Minified JSON stays raw in the editor.","type":"text","version":1}]}]}}';

    fireEvent.change(screen.getByRole("textbox", { name: /json editor/i }), {
      target: { value: minifiedJson },
    });

    await waitFor(() => {
      const output =
        screen.getByLabelText(/serialized output/i).textContent ?? "";

      expect(output).toContain(`{
  "root": {
    "type": "root"`);
      expect(output).toContain("Minified JSON stays raw in the editor.");
      expect(screen.getByRole("textbox", { name: /json editor/i })).toHaveValue(
        minifiedJson,
      );
    });
  });

  test("pretty-prints cleaned html output without mutating the editor textbox value", async () => {
    render(createElement(PlaygroundDemo));

    const rawHtml =
      "<section><h1>Welcome</h1><div><p>Hello</p><ul><li>One</li></ul></div></section>";

    fireEvent.click(screen.getByRole("button", { name: "HTML" }));
    fireEvent.change(screen.getByRole("textbox", { name: /html editor/i }), {
      target: { value: rawHtml },
    });

    await waitFor(() => {
      const output =
        screen.getByLabelText(/serialized output/i).textContent ?? "";
      const divIndent = output.match(/\n(\s+)<div>/)?.[1]?.length ?? 0;
      const ulIndent = output.match(/\n(\s+)<ul>/)?.[1]?.length ?? 0;
      const liIndent = output.match(/\n(\s+)<li>One<\/li>/)?.[1]?.length ?? 0;

      expect(output).toContain("<section>");
      expect(output).toContain("\n");
      expect(divIndent).toBeGreaterThan(0);
      expect(ulIndent).toBeGreaterThan(divIndent);
      expect(liIndent).toBeGreaterThan(ulIndent);
      expect(screen.getByRole("textbox", { name: /html editor/i })).toHaveValue(
        rawHtml,
      );
    });
  });

  test("labels html output as cleaned html", async () => {
    render(createElement(PlaygroundDemo));

    fireEvent.click(screen.getByRole("button", { name: "HTML" }));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /cleaned html output/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/inspect exactly what the current editor mode emits/i),
      ).toHaveTextContent(/cleaned html output/i);
      expect(screen.getByText("Cleaned")).toBeInTheDocument();
    });
  });

  test("preserves format content when switching tabs", async () => {
    render(createElement(PlaygroundDemo));

    const rawJson =
      '{"root":{"type":"root","format":"","indent":0,"version":1,"direction":"ltr","children":[{"type":"paragraph","format":"","indent":0,"version":1,"direction":"ltr","children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"JSON draft survives tab switching.","type":"text","version":1}]}]}}';
    const rawMarkdown = "# Draft markdown";
    const rawHtml = "<p>Draft html</p>";

    fireEvent.change(screen.getByRole("textbox", { name: /json editor/i }), {
      target: { value: rawJson },
    });

    fireEvent.click(screen.getByRole("button", { name: "Markdown" }));
    fireEvent.change(
      screen.getByRole("textbox", { name: /markdown editor/i }),
      {
        target: { value: rawMarkdown },
      },
    );

    fireEvent.click(screen.getByRole("button", { name: "HTML" }));
    fireEvent.change(screen.getByRole("textbox", { name: /html editor/i }), {
      target: { value: rawHtml },
    });

    fireEvent.click(screen.getByRole("button", { name: "JSON" }));
    expect(screen.getByRole("textbox", { name: /json editor/i })).toHaveValue(
      rawJson,
    );

    fireEvent.click(screen.getByRole("button", { name: "Markdown" }));
    expect(
      screen.getByRole("textbox", { name: /markdown editor/i }),
    ).toHaveValue(rawMarkdown);

    fireEvent.click(screen.getByRole("button", { name: "HTML" }));
    expect(screen.getByRole("textbox", { name: /html editor/i })).toHaveValue(
      rawHtml,
    );
  });

  test("keeps markdown output raw in the panel", async () => {
    render(createElement(PlaygroundDemo));

    const rawMarkdown = "# Heading\n\n- one\n- two";

    fireEvent.click(screen.getByRole("button", { name: "Markdown" }));
    fireEvent.change(
      screen.getByRole("textbox", { name: /markdown editor/i }),
      {
        target: { value: rawMarkdown },
      },
    );

    await waitFor(() => {
      expect(
        screen.getByRole("textbox", { name: /markdown editor/i }),
      ).toHaveValue(rawMarkdown);
      expect(screen.getByLabelText(/serialized output/i).textContent).toBe(
        rawMarkdown,
      );
    });
  });

  test("applies toggles and controls to the active editor", async () => {
    render(createElement(PlaygroundDemo));

    const jsonEditor = screen.getByRole("textbox", { name: /json editor/i });
    const editableCheckbox = screen.getByRole("checkbox", {
      name: /editable/i,
    });

    expect(jsonEditor).not.toHaveAttribute("readonly");

    fireEvent.click(editableCheckbox);

    expect(
      screen.getByRole("textbox", { name: /json editor/i }),
    ).toHaveAttribute("readonly");

    fireEvent.change(screen.getByLabelText(/placeholder/i), {
      target: { value: "Write something polished..." },
    });

    fireEvent.change(screen.getByLabelText(/variant/i), {
      target: { value: "minimal" },
    });

    await waitFor(() => {
      expect(
        screen.getByRole("textbox", { name: /json editor/i }),
      ).toHaveAttribute("placeholder", "Write something polished...");
      expect(screen.getByTestId("editor-props")).toHaveTextContent(
        '"variant":"minimal"',
      );
    });
  });
});
