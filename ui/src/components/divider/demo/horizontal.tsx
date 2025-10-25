import type React from "react";
import { Divider } from "@/components/ui/divider";

const App: React.FC = () => (
  <>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne
      merninisti licere mihi ista probare, quae sunt a te dicta? Refert tamen,
      quo modo.
    </p>
    <Divider />
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne
      merninisti licere mihi ista probare, quae sunt a te dicta? Refert tamen,
      quo modo.
    </p>
    <Divider dashed />
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne
      merninisti licere mihi ista probare, quae sunt a te dicta? Refert tamen,
      quo modo.
    </p>
  </>
);

export default App;
