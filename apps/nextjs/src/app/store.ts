import { create } from "zustand";

type AppState = {
  segments: string[];
  updateSegments: (segments: string[]) => void;
  headerHeight: number;
  setHeaderHeight: (height: number) => void;
};
export const useAppStore = create<AppState>((set) => ({
  segments: [],
  updateSegments: (segments) => set(() => ({ segments })),
  headerHeight: 80,
  setHeaderHeight: (height) => set(() => ({ headerHeight: height })),
}));
