import type React from "react";
import { useState } from "react";

import { Button } from "@acme/ui/components/button";
import { Drawer } from "@acme/ui/components/drawer";

const App: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<number>();

  const onClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Open
      </Button>
      <Drawer
        title="Resizable Drawer"
        description={
          size === undefined
            ? "Drag the left edge to resize"
            : `Width: ${Math.round(size)}px`
        }
        open={open}
        onClose={onClose}
        resizable={{ onResize: setSize }}
        maxSize={800}
      >
        <p>Drag the grip on the left edge — the drag stops at 800px.</p>
        <p>Focus the grip and use ← / → to resize by keyboard.</p>
      </Drawer>
    </>
  );
};

export default App;
