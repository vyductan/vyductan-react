
import type React from "react";
import { Button } from "@acme/ui/components/button";
import { Modal } from "@acme/ui/components/modal";
import { Space } from "@acme/ui/components/space";

const App: React.FC = () => {
  return (
    <Space wrap>
      <Modal
        title="Small Modal"
        trigger={<Button variant="outlined">Width 400px</Button>}
        width={400}
      >
        <p>This is a small modal with width 400px.</p>
      </Modal>

      <Modal
        title="Default Modal"
        trigger={<Button variant="outlined">Width 520px (Default)</Button>}
        width={520}
      >
        <p>This is the default modal with width 520px.</p>
      </Modal>

      <Modal
        title="Large Modal"
        trigger={<Button variant="outlined">Width 800px</Button>}
        width={800}
      >
        <p>This is a large modal with width 800px.</p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </Modal>

      <Modal
        title="Responsive Modal"
        trigger={<Button variant="outlined">Responsive Width</Button>}
        width={{
          xs: "90%",
          sm: 400,
          md: 600,
          lg: 800,
        }}
      >
        <p>This modal has responsive width!</p>
        <p>Width changes based on screen size:</p>
        <ul className="ml-4 list-disc">
          <li>xs: 90%</li>
          <li>sm: 400px</li>
          <li>md: 600px</li>
          <li>lg: 800px</li>
        </ul>
      </Modal>
    </Space>
  );
};

export default App;
