import type React from "react";
import { useRef, useState } from "react";

import type { GalleryMedia } from "@acme/ui/components/image";
import { Button } from "@acme/ui/components/button";
import { GalleryLightbox } from "@acme/ui/components/image";
import { SeekableVideo } from "@acme/ui/components/video";

const media: GalleryMedia[] = [
  {
    type: "video",
    url: "https://mdn.github.io/shared-assets/videos/flower.mp4",
    fileName: "cover.mp4",
  },
  {
    type: "image",
    url: "https://picsum.photos/seed/acme-sync-1/1200/800",
    fileName: "still.jpg",
  },
];

const App: React.FC = () => {
  const coverReference = useRef<HTMLVideoElement>(null);
  const [open, setOpen] = useState(false);
  const [startTime, setStartTime] = useState(0);

  return (
    <div className="flex flex-col items-start gap-4">
      <SeekableVideo
        ref={coverReference}
        src={media[0]?.url}
        controls
        playsInline
        className="w-full max-w-lg rounded-xl"
      />

      <Button
        type="primary"
        onClick={() => {
          // Hand the cover's position to the lightbox as it opens.
          setStartTime(coverReference.current?.currentTime ?? 0);
          setOpen(true);
        }}
      >
        Open lightbox from here
      </Button>

      <GalleryLightbox
        open={open}
        onOpenChange={setOpen}
        media={media}
        initialIndex={0}
        videoSync={{
          index: 0,
          startTime,
          // Mirror it back so closing the lightbox leaves the cover in sync.
          onTimeUpdate: (time) => {
            if (coverReference.current)
              coverReference.current.currentTime = time;
          },
        }}
      />
    </div>
  );
};

export default App;
