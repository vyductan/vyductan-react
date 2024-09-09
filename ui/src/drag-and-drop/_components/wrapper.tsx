import { clsm } from "../..";

interface Props {
  children: React.ReactNode;
  center?: boolean;
  style?: React.CSSProperties;
}
export function Wrapper({ children, center, style }: Props) {
  return (
    <div
      className={clsm("flex w-full", center && "justify-center")}
      style={style}
    >
      {children}
    </div>
  );
}
