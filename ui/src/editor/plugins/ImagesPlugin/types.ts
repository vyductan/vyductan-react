import type { ImagePayload } from "../../nodes/ImageNode/ImageNode";

export type InsertImagePayload = Readonly<ImagePayload>;

export type ApiUpload = (input: { file: File; fileName: string }) => Promise<{
  url: string;
  fileName: string;
}>;
