import type React from "react";
import { Flex } from "@acme/ui/components/flex";
import { Progress } from "@acme/ui/components/progress";

const App: React.FC = () => (
  <Flex gap="small" wrap>
    <Progress type="circle" percent={75} />
    <Progress type="circle" percent={70} status="exception" />
    <Progress type="circle" percent={100} />
  </Flex>
);

export default App;
