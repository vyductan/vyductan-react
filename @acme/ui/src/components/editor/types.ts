/**
 * Type definitions for Lexical editor content
 * Shared across the application
 */

export type LexicalTextNode = {
  detail: number;
  format: number;
  mode: string;
  style: string;
  text: string;
  type: "text";
  version: number;
};

export type LexicalElementNode = {
  children: (LexicalTextNode | LexicalElementNode)[];
  direction: "ltr" | "rtl";
  format: string | number;
  indent: number;
  type: string;
  version: number;
};

export type LexicalRootNode = {
  children: LexicalElementNode[];
  direction: "ltr" | "rtl";
  format: string | number;
  indent: number;
  type: "root";
  version: number;
};

export type LexicalEditorContent = {
  root: LexicalRootNode;
};
