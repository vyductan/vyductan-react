import type React from "react";
import { create } from "zustand";

import type { BreadcrumbItem } from "./breadcrumb";

type BreadcrumbState = {
  params: Record<string, string>;
  items?: BreadcrumbItem[];
  render?: () => React.ReactNode;
};
type BreadcrumbActions = {
  setBreadcrumb: (breadcrumb: {
    items?: BreadcrumbItem[];
    params?: Record<string, string>;
    render?: () => React.ReactNode;
  }) => void;
};
type BreadcrumbStore = BreadcrumbState & BreadcrumbActions;
const useBreadcrumb = create<BreadcrumbStore>()((set) => ({
  params: {},
  items: undefined,
  render: undefined,
  setBreadcrumb: ({
    items,
    params,
    render,
  }: {
    items?: BreadcrumbItem[];
    params?: Record<string, string>;
    render?: () => React.ReactNode;
  }) => set({ items, params, render }),
}));

export type { BreadcrumbState };
export { useBreadcrumb };
