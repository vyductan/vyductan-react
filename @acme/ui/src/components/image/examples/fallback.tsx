import type React from "react";

import { Image } from "@acme/ui/components/image";

// A path that always 404s, so the error branch is reproducible offline.
const brokenSource = "/this-image-does-not-exist.png";

const App: React.FC = () => (
  <div className="flex flex-wrap gap-6">
    <div className="flex flex-col gap-2">
      <span className="text-muted-foreground text-sm">Default fallback</span>
      <Image
        src={brokenSource}
        alt="Unavailable photo"
        width={240}
        height={160}
        className="overflow-hidden rounded-lg"
      />
    </div>

    <div className="flex flex-col gap-2">
      <span className="text-muted-foreground text-sm">Custom fallback</span>
      <Image
        src={brokenSource}
        fallback="https://picsum.photos/seed/acme-image-fallback/600/400"
        alt="Unavailable photo"
        width={240}
        height={160}
        className="overflow-hidden rounded-lg"
      />
    </div>
  </div>
);

export default App;
