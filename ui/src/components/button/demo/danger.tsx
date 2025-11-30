import type React from "react";
import { Button } from "@acme/ui/components/button";
import { Flex } from "@acme/ui/components/flex";

const App: React.FC = () => (
  <Flex wrap gap="small">
    <Button type="primary" danger>
      Primary
    </Button>
    <Button danger>Default</Button>
    <Button type="dashed" danger>
      Dashed
    </Button>
    <Button type="text" danger>
      Text
    </Button>
    <Button type="link" danger>
      Link
    </Button>
  </Flex>
);

export default App;
