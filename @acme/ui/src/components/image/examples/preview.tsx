import type React from "react";

import { Image } from "@acme/ui/components/image";

const sources = [
  { seed: "acme-image-preview-1", alt: "Sand dunes" },
  { seed: "acme-image-preview-2", alt: "Snowy ridge" },
  { seed: "acme-image-preview-3", alt: "Coastal cliffs" },
];

const App: React.FC = () => (
  <div className="flex flex-wrap gap-4">
    {sources.map((source) => (
      <Image
        key={source.seed}
        preview
        src={`https://picsum.photos/seed/${source.seed}/600/400`}
        alt={source.alt}
        width={180}
        height={120}
        className="overflow-hidden rounded-lg"
      />
    ))}
  </div>
);

export default App;
