import { create } from "zustand";

import type { BreadcrumbProps } from "./breadcrumb";

type BreadcrumbState<
  TMeta extends Record<string, string> = Record<string, string>,
> = BreadcrumbProps & {
  meta?: TMeta;
};
type BreadcrumbActions<
  TMeta extends Record<string, string> = Record<string, string>,
> = {
  setBreadcrumb: (breadcrumb: BreadcrumbState<TMeta>) => void;
  reset: () => void;
};
type BreadcrumbStore<
  TMeta extends Record<string, string> = Record<string, string>,
> = BreadcrumbState<TMeta> & BreadcrumbActions<TMeta>;

const initialState: BreadcrumbState = {
  params: {},
  items: undefined,
  meta: {},
};
const useBreadcrumbBase = create<BreadcrumbStore>()((set) => ({
  ...initialState,
  setBreadcrumb: (breadcrumb) => set(breadcrumb),
  reset: () => set(initialState),
}));

// apply generic type
const useBreadcrumb = useBreadcrumbBase as {
  <
    TMeta extends Record<string, string> = Record<string, string>,
  >(): BreadcrumbStore<TMeta>;
  <TMeta extends Record<string, string>, U>(
    selector: (s: BreadcrumbStore<TMeta>) => U,
  ): U;
};

export type { BreadcrumbState };
export { useBreadcrumb };
