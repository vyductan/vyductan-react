import type React from "react";
import { useState } from "react";

import { Button } from "@acme/ui/components/button";
import { Drawer } from "@acme/ui/components/drawer";

const App: React.FC = () => {
  const [open, setOpen] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button type="primary" onClick={showDrawer}>
        Open
      </Button>
      <Drawer
        title="Basic Drawer"
        description="Drawer description"
        onClose={onClose}
        open={open}
        extra={
          <Button type="primary" onClick={onClose}>
            OK
          </Button>
        }
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Drawer>
    </>
  );
};

export default App;
