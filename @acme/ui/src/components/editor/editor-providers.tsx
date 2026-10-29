"use client";

import type { ReactNode } from "react";

import type { ImageDownloadFn as ImageDownloadFunction } from "./context/image-download-context";
import type { ImageResolverFn as ImageResolverFunction } from "./context/image-resolver-context";
import { TooltipProvider } from "../tooltip";
import { ComponentPickerContext } from "./context/component-picker-context";
import { FloatingLinkContext } from "./context/floating-link-context";
import { ImageDownloadProvider } from "./context/image-download-context";
import { ImageResolverProvider } from "./context/image-resolver-context";
import { SharedAutocompleteContext } from "./context/shared-autocomplete-context";

interface EditorProvidersProperties {
  children: ReactNode;
  resolveImage?: ImageResolverFunction;
  downloadImage?: ImageDownloadFunction;
}

export function EditorProviders({
  children,
  resolveImage,
  downloadImage,
}: EditorProvidersProperties) {
  return (
    <ImageResolverProvider value={resolveImage}>
      <ImageDownloadProvider value={downloadImage}>
        <TooltipProvider>
          <SharedAutocompleteContext>
            <ComponentPickerContext>
              <FloatingLinkContext>{children}</FloatingLinkContext>
            </ComponentPickerContext>
          </SharedAutocompleteContext>
        </TooltipProvider>
      </ImageDownloadProvider>
    </ImageResolverProvider>
  );
}
