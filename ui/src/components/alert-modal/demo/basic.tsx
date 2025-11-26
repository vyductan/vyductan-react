
import type React from "react";
import { useState } from "react";
import { AlertModal } from "@/components/ui/alert-modal";
import { Button } from "@/components/ui/button";

const App: React.FC = () => {
  const [open, setOpen] = useState(false);
  const handleConfirm = () => {
    console.log("Confirmed!");
    setOpen(false);
  };

  const handleCancel = () => {
    console.log("Cancelled!");
    setOpen(false);
  };

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete
      </Button>
      <AlertModal
        open={open}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        confirmLoading={false}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
};

export default App;
