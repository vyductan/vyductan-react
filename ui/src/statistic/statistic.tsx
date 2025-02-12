type StatisticProps = Omit<React.ComponentProps<"div">, "title"> & {
  title: React.ReactNode;
  value: string | number;
};
const Statistic = ({ title, value, ...props }: StatisticProps) => {
  const valueToRender =
    typeof value === "number" ? value.toLocaleString() : value;
  return (
    <div {...props}>
      <div className="text-muted-foreground mb-1 text-sm">{title}</div>
      <div className="text-2xl font-bold">{valueToRender}</div>
    </div>
  );
};

export type { StatisticProps };
export { Statistic };
