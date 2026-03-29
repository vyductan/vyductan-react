import type React from "react";

import { Button } from "@acme/ui/components/button";
import { Flex } from "@acme/ui/components/flex";

const App: React.FC = () => (
  <Flex gap="small" wrap>
    <Button type="primary" loading>
      Loading
    </Button>
    <Button loading>Loading default</Button>
  </Flex>
);

export default App;
