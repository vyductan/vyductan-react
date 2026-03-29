/**
 * Type definitions for Lexical editor content
 * Shared across the application
 */

export type LexicalDirection = "ltr" | "rtl" | null;

export type LexicalSerializedNode = {
  type: string;
  version: number;
  [key: string]: unknown;
};

export type LexicalTextNode = LexicalSerializedNode & {
  detail: number;
  format: number;
  mode: string;
  style: string;
  text: string;
  type: "text";
};

export type LexicalElementNode = LexicalSerializedNode & {
  children: LexicalSerializedNode[];
  direction: LexicalDirection;
  format: string | number;
  indent: number;
};

export type LexicalRootNode = LexicalElementNode & {
  children: LexicalSerializedNode[];
  type: "root";
};

export type LexicalEditorContent = {
  root: LexicalRootNode;
};
