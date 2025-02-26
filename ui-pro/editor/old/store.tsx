import { create } from "zustand";

import type { UploadService } from "./plugins/images-plugin/types";

type EditorState = {
  uploadService: UploadService;
};
export const useEditor = create<EditorState>()((_set) => ({
  uploadService: () => Promise.resolve({ url: "", fileName: "" }),
}));
