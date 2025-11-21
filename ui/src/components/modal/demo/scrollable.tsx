"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

const App: React.FC = () => {
  const longContent = Array.from({ length: 50 }, (_, i) => (
    <p key={i}>
      This is paragraph {i + 1}. Lorem ipsum dolor sit amet, consectetur
      adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.
    </p>
  ));

  return (
    <Modal
      title="Scrollable Modal"
      trigger={<Button type="primary">Open Scrollable Modal</Button>}
      onOk={() => console.log("OK clicked")}
    >
      <div className="space-y-4">{longContent}</div>
    </Modal>
  );
};

export default App;
