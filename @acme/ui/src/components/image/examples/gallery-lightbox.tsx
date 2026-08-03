import type React from "react";
import { useState } from "react";

import type { GalleryMedia } from "@acme/ui/components/image";
import { GalleryLightbox } from "@acme/ui/components/image";

const media: GalleryMedia[] = [
  {
    type: "image",
    url: "https://picsum.photos/seed/acme-gallery-1/1200/800",
    fileName: "harbour.jpg",
  },
  {
    type: "image",
    url: "https://picsum.photos/seed/acme-gallery-2/1200/800",
    fileName: "canyon.jpg",
  },
  {
    type: "video",
    url: "https://mdn.github.io/shared-assets/videos/flower.mp4",
    fileName: "flower.mp4",
  },
  {
    type: "image",
    url: "https://picsum.photos/seed/acme-gallery-3/1200/800",
    fileName: "rooftops.jpg",
  },
];

const App: React.FC = () => {
  // `undefined` means closed; a number is both "open" and the starting slide.
  const [openIndex, setOpenIndex] = useState<number>();

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {media.map((item, index) => (
          <button
            key={item.url}
            type="button"
            aria-label={`Open ${item.fileName}`}
            onClick={() => setOpenIndex(index)}
            className="focus-visible:ring-ring size-24 overflow-hidden rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {item.type === "video" ? (
              <video
                src={item.url}
                className="size-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              <picture className="flex size-full">
                <img
                  src={item.url}
                  alt={item.fileName}
                  className="size-full object-cover"
                />
              </picture>
            )}
          </button>
        ))}
      </div>

      <GalleryLightbox
        open={openIndex !== undefined}
        onOpenChange={(next) => {
          if (!next) setOpenIndex(undefined);
        }}
        media={media}
        initialIndex={openIndex ?? 0}
        onDownloadAll={() => {
          console.log(
            "download all",
            media.map((item) => item.fileName),
          );
        }}
      />
    </>
  );
};

export default App;
