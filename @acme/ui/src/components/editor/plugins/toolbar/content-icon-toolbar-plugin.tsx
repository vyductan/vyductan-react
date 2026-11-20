"use client";

import { useState } from "react";
import { Sticker } from "lucide-react";

import { Button } from "@acme/ui/components/button";
import { Popover } from "@acme/ui/components/popover";

import { useToolbarContext } from "../../context/toolbar-context";
import { INSERT_IMAGE_COMMAND } from "../images-plugin";

/**
 * One entry in a caller-supplied icon set — a dietary badge, a facility mark,
 * anything an author inserts by name rather than by URL.
 *
 * The editor deliberately knows nothing about where the set comes from. The
 * host passes it in, the same seam `mentionsData` uses, so hosting (a storage
 * bucket, a CDN, a bundled asset folder) stays the host's decision.
 */
export interface EditorContentIcon {
  /** Stable key within the set — the object name, for a hosted one. */
  name: string;
  /** Shown under the swatch, and written to the inserted image's alt text. */
  label: string;
  url: string;
}

/**
 * Every icon is inserted at one height so a row of them reads as a set rather
 * than as whatever pixel sizes the source files happen to be.
 *
 * Width is derived from the file's real aspect ratio instead of being squared
 * off: a wide badge squeezed into a square box is visibly distorted, and
 * `ImageNode.exportDOM` writes both attributes verbatim, so a wrong number here
 * is what every consumer renders.
 */
const ICON_HEIGHT = 24;

/**
 * Measured once per URL and kept for the session. The grid has already painted
 * these images by the time one is clicked, so `decode()` resolves from cache.
 */
const aspectRatios = new Map<string, number>();

async function aspectRatioOf(url: string): Promise<number> {
  const cached = aspectRatios.get(url);
  if (cached !== undefined) {
    return cached;
  }

  const probe = new Image();
  probe.src = url;

  try {
    await probe.decode();
  } catch {
    // A missing or cross-origin-blocked file still inserts — square, and the
    // broken image is the author's signal — rather than swallowing the click.
    return 1;
  }

  const ratio =
    probe.naturalHeight > 0 ? probe.naturalWidth / probe.naturalHeight : 1;
  aspectRatios.set(url, ratio);
  return ratio;
}

export function ContentIconToolbarPlugin({
  icons,
}: {
  icons: EditorContentIcon[];
}) {
  const { activeEditor } = useToolbarContext();
  const [open, setOpen] = useState(false);

  if (icons.length === 0) {
    return null;
  }

  const insert = async (icon: EditorContentIcon) => {
    setOpen(false);

    const ratio = await aspectRatioOf(icon.url);

    activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, {
      src: icon.url,
      altText: icon.label,
      width: Math.max(1, Math.round(ICON_HEIGHT * ratio)),
      height: ICON_HEIGHT,
    });
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger="click"
      placement="bottomLeft"
      className="w-auto p-2"
      content={
        <div className="grid max-h-64 w-64 grid-cols-4 gap-1 overflow-y-auto">
          {icons.map((icon) => (
            <button
              key={icon.name}
              type="button"
              title={icon.label}
              aria-label={icon.label}
              className="flex flex-col items-center gap-1 rounded-sm p-2 hover:bg-accent"
              onClick={() => void insert(icon)}
            >
              <img
                src={icon.url}
                alt=""
                className="h-6 w-6 object-contain"
                loading="lazy"
              />
              <span className="w-full truncate text-center text-[10px] leading-tight text-muted-foreground">
                {icon.label}
              </span>
            </button>
          ))}
        </div>
      }
    >
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        title="Insert Icon"
        aria-label="Insert Icon"
      >
        <Sticker className="h-4 w-4" />
      </Button>
    </Popover>
  );
}
