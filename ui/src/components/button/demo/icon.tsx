import type React from "react";

import { Button } from "@acme/ui/components/button";
import { Flex } from "@acme/ui/components/flex";
import { ArrowUpRight, Plus, Trash2 } from "lucide-react";

const App: React.FC = () => (
  <Flex gap="small" align="center" wrap>
    <Button shape="icon" size="small" aria-label="Add item">
      <Plus className="size-4" />
    </Button>
    <Button shape="icon" aria-label="Open link">
      <ArrowUpRight className="size-4" />
    </Button>
    <Button type="primary" shape="icon" size="large" aria-label="Delete item">
      <Trash2 className="size-4" />
    </Button>
  </Flex>
);

export default App;
