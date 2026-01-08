"use client";

import type { ReactNode } from "react";

import type { ImageResolverFn } from "./context/image-resolver-context";
import { TooltipProvider } from "../tooltip";
import { ComponentPickerContext } from "./context/component-picker-context";
import { FloatingLinkContext } from "./context/floating-link-context";
import { ImageResolverProvider } from "./context/image-resolver-context";
import { SharedAutocompleteContext } from "./context/shared-autocomplete-context";

interface EditorProvidersProps {
  children: ReactNode;
  resolveImage?: ImageResolverFn;
}

export function EditorProviders({
  children,
  resolveImage,
}: EditorProvidersProps) {
  return (
    <ImageResolverProvider value={resolveImage}>
      <TooltipProvider>
        <SharedAutocompleteContext>
          <ComponentPickerContext>
            <FloatingLinkContext>{children}</FloatingLinkContext>
          </ComponentPickerContext>
        </SharedAutocompleteContext>
      </TooltipProvider>
    </ImageResolverProvider>
  );
}
