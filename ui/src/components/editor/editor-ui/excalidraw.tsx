import dynamic from "next/dynamic";

export const Excalidraw = dynamic(
  () =>
    import("@excalidraw/excalidraw").then((mod) => ({
      default: mod.Excalidraw,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="text-muted-foreground">Loading Excalidraw...</div>
      </div>
    ),
  },
);
