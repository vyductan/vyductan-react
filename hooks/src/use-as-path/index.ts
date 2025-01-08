// https://github.com/vercel/next.js/discussions/36723#discussioncomment-5186972
// TODO: check if breadcrumb has 3 level and click random link in breadcrumb then is correct back to parrent path

import { useEffect } from "react";
import { create } from "zustand";

import { usePathname } from "../use-pathname";
import { useSearchParams } from "../use-search-params";

interface AsPathStoreType {
  prevAsPath: string | undefined;
  currentAsPath: string | undefined;
}

const asPathStore = create<AsPathStoreType>(() => ({
  prevAsPath: undefined,
  currentAsPath: undefined,
}));

/** Hook to get prevAsPath and currentAsPath */
export const useAsPath = () => asPathStore((state) => state);

/** Utility function to get paths outside components */
export const getAsPath = () => asPathStore.getState();

/** Path initializer for App Router, should be used in root (e.g., layout.tsx or page.tsx) */
export const useAsPathInitializer = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currentAsPath } = useAsPath();

  useEffect(() => {
    const asPath = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    const currentAsPathWithoutSearchParams = currentAsPath?.split("?")[0];

    // /path?search=1
    if (currentAsPath !== asPath) {
      asPathStore.setState((state) => ({
        ...state,
        currentAsPath: asPath,
      }));
    }

    // /path
    if (currentAsPathWithoutSearchParams !== pathname) {
      asPathStore.setState((state) => ({
        ...state,
        currentAsPath: asPath,
        prevAsPath: currentAsPath,
      }));
    }
  }, [pathname, currentAsPath, searchParams]);
};
