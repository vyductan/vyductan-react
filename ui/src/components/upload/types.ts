import { z } from "zod";

export type BaseUploadProps = {
  uploadService: UploadService;
};
export type UploadService = (
  input: {
    uid: string;
    file: File;
    fileName: string;
  },
  reset: () => void,
) => Promise<
  | {
      success: true;
      url: string;
      fileName: string;
    }
  | {
      success: false;
      error?: Error;
    }
>;
export type DownloadService = (input: {
  file: UploadFileItem;
}) => Promise<void>;

export type UploadFileItem = {
  uid: string;
  url: string;
  name: string;
  percent?: number;
  status?: "error" | "done" | "uploading" | "removed";
  blob?: Blob;
};

export const FileItemSchema = z.object({
  url: z.string(),
  name: z.string(),
  percent: z.number().optional(),
});
