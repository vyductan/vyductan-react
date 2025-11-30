
import type React from "react";
import { useState } from "react";
import { Button } from "@acme/ui/components/button";
import { Modal } from "@acme/ui/components/modal";
import { Space } from "@acme/ui/components/space";

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      console.log("Item deleted");
    }, 2000);
  };

  return (
    <Space wrap>
      <Modal
        title="Confirm Delete"
        trigger={<Button color="danger">Delete Item</Button>}
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
        onOk={() => console.log("Deleted")}
      >
        <p>Are you sure you want to delete this item?</p>
        <p className="text-muted-foreground text-sm">
          This action cannot be undone.
        </p>
      </Modal>

      <Modal
        title="Confirm with Loading"
        trigger={<Button variant="outlined">Action with Loading</Button>}
        okText="Confirm"
        cancelText="Cancel"
        confirmLoading={loading}
        onOk={handleDelete}
      >
        <p>Click confirm to see the loading state.</p>
        <p className="text-muted-foreground text-sm">
          The OK button will show a loading indicator for 2 seconds.
        </p>
      </Modal>

      <Modal
        title="Custom Button Props"
        trigger={<Button variant="outlined">Custom OK Button</Button>}
        okText="Proceed"
        okButtonProps={{
          color: "danger",
          variant: "outlined",
        }}
      >
        <p>This modal has custom OK button styling.</p>
      </Modal>
    </Space>
  );
};

export default App;
