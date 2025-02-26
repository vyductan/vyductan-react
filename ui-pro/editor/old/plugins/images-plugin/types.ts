import type { ImagePayload } from "../../nodes/image-node/image-node";

export type InsertImagePayload = Readonly<ImagePayload>;

export type UploadService = (input: {
  file: File;
  fileName: string;
}) => Promise<{
  url: string;
  fileName: string;
}>;
