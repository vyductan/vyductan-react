import type React from "react";
import { Flex } from "@acme/ui/components/flex";
import { Progress } from "@acme/ui/components/progress";

const App: React.FC = () => (
  <Flex gap="small" vertical>
    <Progress percent={30} />
    <Progress percent={50} status="active" />
    <Progress percent={70} status="exception" />
    <Progress percent={100} />
    <Progress percent={50} showInfo={false} />
  </Flex>
);

export default App;
