import type React from "react";
import { Download, Mail, Plus } from "lucide-react";

import { Button } from "@acme/ui/components/button";
import { Flex } from "@acme/ui/components/flex";

const App: React.FC = () => (
  <Flex gap="small" align="center" wrap>
    <Button type="primary">
      <Plus className="size-4" />
      Add Item
    </Button>
    <Button>
      <Download className="size-4" />
      Download
    </Button>
    <Button type="link">
      <Mail className="size-4" />
      Send Email
    </Button>
  </Flex>
);

export default App;
