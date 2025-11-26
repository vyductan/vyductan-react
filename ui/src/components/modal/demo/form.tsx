
import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Space } from "@/components/ui/space";

const App: React.FC = () => {
  return (
    <Modal
      title="Modal with Form"
      description="Enter your information below"
      trigger={<Button type="primary">Open Form Modal</Button>}
      onOk={() => console.log("Form submitted")}
    >
      <Space direction="vertical" className="w-full">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            Name
          </label>
          <Input id="name" placeholder="Enter your name" />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <Input id="email" type="email" placeholder="Enter your email" />
        </div>
        <div>
          <label htmlFor="message" className="mb-1 block text-sm font-medium">
            Message
          </label>
          <Input.TextArea
            id="message"
            placeholder="Enter your message"
            rows={4}
          />
        </div>
      </Space>
    </Modal>
  );
};

export default App;
