import type React from "react";

import { Image } from "@acme/ui/components/image";

const App: React.FC = () => (
  <Image
    src="https://picsum.photos/seed/acme-image-basic/600/400"
    alt="Mountain lake at sunrise"
    width={300}
    height={200}
    className="overflow-hidden rounded-lg"
  />
);

export default App;
