import { create } from "zustand";

import type { UploadService } from "./plugins/ImagesPlugin/types";

type EditorState = {
  uploadService: UploadService;
};
export const useEditor = create<EditorState>()((set) => ({
  uploadService: () => Promise.resolve({ url: "", fileName: "" }),
}));
