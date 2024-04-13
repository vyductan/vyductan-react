export type BadgeProps = {
  children: React.ReactNode;
  count?: React.ReactNode;
};
export const Badge = ({ count }: BadgeProps) => {
  return <div>{count}</div>;
};
