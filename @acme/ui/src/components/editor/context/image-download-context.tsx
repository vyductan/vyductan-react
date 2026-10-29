"use client";

import { createContext, useContext } from "react";

/**
 * Saves an image, by its src as the document has it, under a name. Where
 * the page cannot download — a VS Code webview shows the save dialog and
 * writes nothing — the host does it.
 */
export type ImageDownloadFn = (source: string, name: string) => void;

const ImageDownloadContext = createContext<ImageDownloadFn | undefined>(
  undefined,
);

export const ImageDownloadProvider = ImageDownloadContext.Provider;

export function useImageDownload() {
  return useContext(ImageDownloadContext);
}
