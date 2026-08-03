import type React from "react";
import { useState } from "react";

import { Button } from "@acme/ui/components/button";
import { ImagePreview } from "@acme/ui/components/image";

const App: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Open preview
      </Button>

      <ImagePreview open={open} onOpenChange={setOpen}>
        <div className="flex h-full items-center justify-center p-12">
          <picture>
            <img
              src="https://picsum.photos/seed/acme-image-overlay/1200/800"
              alt="Aerial view of a river delta"
              className="max-h-full max-w-full object-contain"
            />
          </picture>
        </div>
      </ImagePreview>
    </>
  );
};

export default App;
