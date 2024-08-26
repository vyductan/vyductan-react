type StatisticProps = {
  title: React.ReactNode;
  value: string | number;
};
const Statistic = ({ title, value }: StatisticProps) => {
  const valueToRender =
    typeof value === "number" ? value.toLocaleString() : value;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-foreground-muted">{title}</div>
      <div className="text-2xl font-bold">{valueToRender}</div>
    </div>
  );
};

export type { StatisticProps };
export { Statistic };
