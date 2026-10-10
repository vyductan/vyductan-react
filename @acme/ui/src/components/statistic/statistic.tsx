type StatisticProperties = Omit<React.ComponentProps<"div">, "title"> & {
  title: React.ReactNode;
  value: string | number;
};
const Statistic = ({ title, value, ...properties }: StatisticProperties) => {
  const valueToRender =
    typeof value === "number" ? value.toLocaleString() : value;
  return (
    <div {...properties}>
      <div className="mb-1 text-sm text-muted-foreground">{title}</div>
      <div className="text-2xl font-bold">{valueToRender}</div>
    </div>
  );
};

export type { StatisticProperties as StatisticProps };
export { Statistic };
