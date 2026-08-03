import type React from "react";

import { Image } from "@acme/ui/components/image";

const seeds = ["harbour", "canyon", "rooftops", "dunes"];

const App: React.FC = () => (
  <Image.PreviewGroup>
    <div className="flex flex-wrap gap-4">
      {seeds.map((seed) => (
        <Image
          key={seed}
          src={`https://picsum.photos/seed/acme-group-${seed}/600/400`}
          alt={seed}
          width={180}
          height={120}
          className="overflow-hidden rounded-lg"
        />
      ))}
    </div>
  </Image.PreviewGroup>
);

export default App;
