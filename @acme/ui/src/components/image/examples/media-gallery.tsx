import type React from "react";

import type { GalleryMedia } from "@acme/ui/components/image";
import { MediaGallery } from "@acme/ui/components/image";

const media: GalleryMedia[] = [
  {
    type: "image",
    url: "https://picsum.photos/seed/acme-listing-1/1600/1000",
    fileName: "living-room.jpg",
  },
  {
    type: "image",
    url: "https://picsum.photos/seed/acme-listing-2/1600/1000",
    fileName: "kitchen.jpg",
  },
  {
    type: "video",
    url: "https://mdn.github.io/shared-assets/videos/flower.mp4",
    fileName: "walkthrough.mp4",
  },
  {
    type: "image",
    url: "https://picsum.photos/seed/acme-listing-3/1600/1000",
    fileName: "bedroom.jpg",
  },
  {
    type: "image",
    url: "https://picsum.photos/seed/acme-listing-4/1600/1000",
    fileName: "terrace.jpg",
  },
  {
    type: "image",
    url: "https://picsum.photos/seed/acme-listing-5/1600/1000",
    fileName: "pool.jpg",
  },
  {
    type: "image",
    url: "https://picsum.photos/seed/acme-listing-6/1600/1000",
    fileName: "garden.jpg",
  },
];

const App: React.FC = () => (
  <MediaGallery
    media={media}
    alt="Sunset Villa"
    onDownloadAll={() => {
      console.log(
        "download all",
        media.map((item) => item.fileName),
      );
    }}
  />
);

export default App;
