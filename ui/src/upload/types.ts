import { z } from "zod";

export type BaseUploadProps = {
  uploadService: UploadService;
};
export type UploadService = (input: {
  file: File;
  fileName: string;
}) => Promise<
  | {
      success: true;
      url: string;
      fileName: string;
    }
  | {
      success: false;
    }
>;
export type DownloadService = (input: {
  file: FileItem;
  fileName: string;
}) => Promise<void>;

export type FileItem = {
  url: string;
  name: string;
};

export const FileItemSchema = z.object({
  url: z.string(),
  name: z.string(),
});
