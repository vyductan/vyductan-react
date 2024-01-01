import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
};
const Card = ({ children }: CardProps) => {
  return (
    <div>
      <div className="lg:p-lg">{children}</div>
    </div>
  );
};

export default Card;
