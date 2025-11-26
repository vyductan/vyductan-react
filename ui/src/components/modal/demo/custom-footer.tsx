
import type React from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Space } from "@/components/ui/space";

const App: React.FC = () => {
  return (
    <Space direction="vertical">
      <Modal
        title="Custom Footer with Function"
        trigger={<Button type="primary">Custom Footer (Function)</Button>}
        footer={({ extra }) => (
          <Space>
            {extra.CancelBtn}
            <Button variant="outlined">Custom Action</Button>
            {extra.OkBtn}
          </Space>
        )}
        onOk={() => console.log("OK clicked")}
      >
        <p>This modal has a custom footer using a function.</p>
        <p>You can reorder buttons or add custom actions.</p>
      </Modal>

      <Modal
        title="Custom Footer with Node"
        trigger={<Button variant="outlined">Custom Footer (Node)</Button>}
        footer={
          <Space>
            <Button variant="outlined">Custom Button 1</Button>
            <Button type="primary">Custom Button 2</Button>
          </Space>
        }
      >
        <p>This modal has a completely custom footer.</p>
        <p>You can provide any React node as the footer.</p>
      </Modal>

      <Modal
        title="Modal without Footer"
        trigger={<Button variant="outlined">No Footer</Button>}
        footer={null}
      >
        <p>This modal has no footer at all.</p>
      </Modal>
    </Space>
  );
};

export default App;
