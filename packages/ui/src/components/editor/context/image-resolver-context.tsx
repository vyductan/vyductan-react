import { createContext, useContext } from "react";

export type ImageResolverFn = (source: string) => Promise<string>;

const ImageResolverContext = createContext<ImageResolverFn | undefined>(
  undefined,
);

export const ImageResolverProvider = ImageResolverContext.Provider;

export function useImageResolver() {
  return useContext(ImageResolverContext);
}
