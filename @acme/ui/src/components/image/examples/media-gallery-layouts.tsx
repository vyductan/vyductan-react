import type React from "react";
import { useState } from "react";

import type { GalleryMedia } from "@acme/ui/components/image";
import { MediaGallery } from "@acme/ui/components/image";
import { Segmented } from "@acme/ui/components/segmented";

const pool: GalleryMedia[] = Array.from({ length: 8 }, (_, index) => ({
  type: "image",
  url: `https://picsum.photos/seed/acme-mosaic-${index}/1200/800`,
  fileName: `photo-${index + 1}.jpg`,
}));

const App: React.FC = () => {
  // Tile spans are derived from how many tiles are visible, so stepping through
  // the counts is the fastest way to see every arrangement.
  const [count, setCount] = useState(5);

  return (
    <div className="flex flex-col gap-4">
      <Segmented
        value={String(count)}
        onChange={(value) => setCount(Number(value))}
        options={[1, 2, 3, 4, 5, 8].map((value) => ({
          label: `${value} item${value > 1 ? "s" : ""}`,
          value: String(value),
        }))}
      />

      <MediaGallery
        media={pool.slice(0, count)}
        alt="Sample gallery"
        height={360}
      />
    </div>
  );
};

export default App;
