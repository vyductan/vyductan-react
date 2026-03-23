import type React from "react";

import { Button } from "@acme/ui/components/button";
import { Flex } from "@acme/ui/components/flex";

const App: React.FC = () => (
  <Flex gap="small" align="center" wrap>
    <Button type="primary" size="small">
      Small
    </Button>
    <Button type="primary" size="middle">
      Default
    </Button>
    <Button type="primary" size="large">
      Large
    </Button>
  </Flex>
);

export default App;
