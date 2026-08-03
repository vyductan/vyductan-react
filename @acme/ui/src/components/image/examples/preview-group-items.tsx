import type React from "react";
import { useState } from "react";

import { Button } from "@acme/ui/components/button";
import { Image } from "@acme/ui/components/image";

// The preview list is independent of what the page renders: one thumbnail
// stands in for a whole set.
const items = [
  "https://picsum.photos/seed/acme-items-1/1200/800",
  "https://picsum.photos/seed/acme-items-2/1200/800",
  "https://picsum.photos/seed/acme-items-3/1200/800",
];

const App: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);

  return (
    <div className="flex flex-col items-start gap-4">
      <Image.PreviewGroup
        items={items}
        preview={{
          open,
          current,
          onOpenChange: (next, info) => {
            setOpen(next);
            setCurrent(info.current);
          },
          onChange: (next) => setCurrent(next),
          countRender: (index, total) => `Photo ${index} of ${total}`,
        }}
      >
        <Image
          src={items[0]}
          alt="Album cover"
          width={220}
          height={148}
          className="overflow-hidden rounded-lg"
        />
      </Image.PreviewGroup>

      <div className="flex items-center gap-3">
        <Button type="primary" onClick={() => setOpen(true)}>
          Open from outside
        </Button>
        <span className="text-muted-foreground text-sm">
          current index: {current}
        </span>
      </div>
    </div>
  );
};

export default App;
