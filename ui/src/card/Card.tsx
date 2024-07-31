import type { ReactNode } from "react";

import { CardContent, CardRoot } from "./_components";

type CardProps = {
  children: ReactNode;
};
const Card = ({ children }: CardProps) => {
  return (
    <CardRoot>
      <CardContent>{children}</CardContent>
    </CardRoot>
  );
};

export { Card };
