import type React from "react";
import { useState } from "react";

import { AlertModal } from "@acme/ui/components/alert-modal";
import { Button } from "@acme/ui/components/button";

const TypesDemo: React.FC = () => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);

  const handleConfirm = () => {
    console.log("Confirmed!");
    setConfirmOpen(false);
  };

  const handleCancel = () => {
    console.log("Cancelled!");
    setConfirmOpen(false);
  };

  const handleWarningConfirm = () => {
    console.log("Warning action confirmed!");
    setWarningOpen(false);
  };

  const handleInfoConfirm = () => {
    console.log("Info acknowledged!");
    setInfoOpen(false);
  };

  const handleSuccessConfirm = () => {
    console.log("Success action completed!");
    setSuccessOpen(false);
  };

  const handleErrorConfirm = () => {
    console.log("Error acknowledged!");
    setErrorOpen(false);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button variant="outlined" onClick={() => setConfirmOpen(true)}>
          Open Confirm Modal
        </Button>
        <Button
          variant="outlined"
          color="amber"
          onClick={() => setWarningOpen(true)}
        >
          Open Warning Modal
        </Button>
        <Button
          variant="outlined"
          color="blue"
          onClick={() => setInfoOpen(true)}
        >
          Open Info Modal
        </Button>
        <Button
          variant="outlined"
          color="success"
          onClick={() => setSuccessOpen(true)}
        >
          Open Success Modal
        </Button>
        <Button
          variant="outlined"
          color="danger"
          onClick={() => setErrorOpen(true)}
        >
          Open Error Modal
        </Button>
      </div>

      <AlertModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm Action"
        description="Are you sure you want to proceed? This action cannot be undone."
        type="confirm"
        okText="Confirm"
        cancelText="Cancel"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      <AlertModal
        open={warningOpen}
        onOpenChange={setWarningOpen}
        title="Warning"
        description="This action may have unintended consequences. Please review before proceeding."
        type="warning"
        okText="I Understand"
        onConfirm={handleWarningConfirm}
      />

      <AlertModal
        open={infoOpen}
        onOpenChange={setInfoOpen}
        title="Information"
        description="Here is some important information you should know about this feature."
        type="info"
        okText="Got it"
        onConfirm={handleInfoConfirm}
      />

      <AlertModal
        open={successOpen}
        onOpenChange={setSuccessOpen}
        title="Success"
        description="Your action has been completed successfully!"
        type="success"
        okText="Continue"
        onConfirm={handleSuccessConfirm}
      />

      <AlertModal
        open={errorOpen}
        onOpenChange={setErrorOpen}
        title="Error"
        description="An error occurred while processing your request. Please try again later."
        type="error"
        okText="OK"
        onConfirm={handleErrorConfirm}
      />
    </>
  );
};

export default TypesDemo;
