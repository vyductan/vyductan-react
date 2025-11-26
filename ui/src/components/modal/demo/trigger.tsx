
import type React from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

const App: React.FC = () => {
  return (
    <Modal
      title="Modal with Trigger"
      trigger={<Button type="primary">Click to Open</Button>}
      onOk={() => console.log("OK clicked")}
    >
      <p>This modal uses the trigger prop to handle opening.</p>
      <p>The trigger can be any React element.</p>
    </Modal>
  );
};

export default App;
