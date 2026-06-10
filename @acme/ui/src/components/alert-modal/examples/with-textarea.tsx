import type React from "react";
import { useState } from "react";

import { AlertModal } from "@acme/ui/components/alert-modal";
import { Button } from "@acme/ui/components/button";
import { Textarea } from "@acme/ui/components/textarea";

const WithTextareaDemo: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    console.log("Deleted with reason:", reason);
    setReason("");
    setOpen(false);
  };

  return (
    <>
      <Button variant="outlined" color="danger" onClick={() => setOpen(true)}>
        Delete
      </Button>
      <AlertModal
        open={open}
        onOpenChange={setOpen}
        type="error"
        title="Delete item"
        description="This action cannot be undone."
        okText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirm}
      >
        <Textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Tell us why you're deleting this (optional)…"
          rows={4}
        />
      </AlertModal>
    </>
  );
};

export default WithTextareaDemo;
