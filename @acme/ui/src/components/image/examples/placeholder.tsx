import type React from "react";
import { useState } from "react";

import { Button } from "@acme/ui/components/button";
import { Image } from "@acme/ui/components/image";

const App: React.FC = () => {
  // Remounting with a new key restarts the download so the placeholder is
  // observable again.
  const [reload, setReload] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      <Button className="self-start" onClick={() => setReload(reload + 1)}>
        Reload
      </Button>

      <div className="flex flex-wrap gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-muted-foreground text-sm">
            Default (Skeleton)
          </span>
          <Image
            key={`default-${reload}`}
            src={`https://picsum.photos/seed/acme-image-skeleton-${reload}/600/400`}
            alt="Forest path"
            width={240}
            height={160}
            className="overflow-hidden rounded-lg"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-muted-foreground text-sm">
            Custom placeholder
          </span>
          <Image
            key={`custom-${reload}`}
            src={`https://picsum.photos/seed/acme-image-custom-${reload}/600/400`}
            alt="City skyline"
            width={240}
            height={160}
            className="overflow-hidden rounded-lg"
            placeholder={
              <div className="bg-muted text-muted-foreground flex size-full animate-pulse items-center justify-center text-xs">
                Loading…
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default App;
