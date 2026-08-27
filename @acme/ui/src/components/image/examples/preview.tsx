import type React from "react";

import { Image } from "@acme/ui/components/image";

const App: React.FC = () => (
  <div className="flex flex-wrap items-start gap-6">
    <div className="flex flex-col gap-2">
      <span className="text-muted-foreground text-sm">Default</span>
      <Image
        src="https://picsum.photos/seed/acme-image-preview-1/600/400"
        alt="Sand dunes"
        width={180}
        height={120}
        className="rounded-lg"
      />
    </div>

    <div className="flex flex-col gap-2">
      <span className="text-muted-foreground text-sm">With a cover label</span>
      <Image
        src="https://picsum.photos/seed/acme-image-preview-2/600/400"
        alt="Snowy ridge"
        width={180}
        height={120}
        className="rounded-lg"
        preview={{ cover: <span className="text-sm text-white">Xem ảnh</span> }}
      />
    </div>

    <div className="flex flex-col gap-2">
      <span className="text-muted-foreground text-sm">preview={"{false}"}</span>
      <Image
        src="https://picsum.photos/seed/acme-image-preview-3/600/400"
        alt="Coastal cliffs"
        width={180}
        height={120}
        className="rounded-lg"
        preview={false}
      />
    </div>
  </div>
);

export default App;
