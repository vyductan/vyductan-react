import type React from "react";
import Link from "next/link";

import { Button } from "@acme/ui/components/button";

const App: React.FC = () => (
  <Button asChild>
    <Link href="/login">Login</Link>
  </Button>
);

export default App;
