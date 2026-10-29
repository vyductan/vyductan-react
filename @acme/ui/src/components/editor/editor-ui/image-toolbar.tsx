import type { JSX, MouseEvent } from "react";

export interface ImageToolbarProps {
  /** Left out when the image cannot take a caption. */
  onCaption?: () => void;
  onZoom: () => void;
  onDownload: () => void;
  /** Opens the image menu at the given point. */
  onMore: (position: { x: number; y: number }) => void;
}

/**
 * Notion's image toolbar: at the image's top right on hover, its actions a
 * click away. Ask AI, comment and crop have nothing behind them here, so
 * they are left out.
 */
export function ImageToolbar({
  onCaption,
  onZoom,
  onDownload,
  onMore,
}: ImageToolbarProps): JSX.Element {
  const items: {
    label: string;
    icon: string;
    onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  }[] = [
    ...(onCaption
      ? [
          {
            label: "Caption",
            icon: "icon-[lucide--captions]",
            onClick: onCaption,
          },
        ]
      : []),
    { label: "Zoom", icon: "icon-[lucide--zoom-in]", onClick: onZoom },
    { label: "Download", icon: "icon-[lucide--download]", onClick: onDownload },
    {
      label: "More",
      icon: "icon-[lucide--ellipsis]",
      onClick: (event) => {
        const box = event.currentTarget.getBoundingClientRect();
        onMore({ x: box.left, y: box.bottom + 4 });
      },
    },
  ];

  return (
    <div
      data-slot="image-toolbar"
      className="absolute top-2 right-2 z-20 flex items-center gap-0.5 rounded-lg border bg-popover p-0.5 text-popover-foreground shadow-md"
      // The image keeps its selection: a press here is not a click in the
      // editor.
      onMouseDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onClick={(event) => event.stopPropagation()}
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          aria-label={item.label}
          title={item.label}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          onClick={item.onClick}
        >
          <span className={`${item.icon} size-4`} />
        </button>
      ))}
    </div>
  );
}
