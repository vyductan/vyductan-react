import type { CardProps } from "../card";
import { Card } from "../card";

type StatisticCardProps = CardProps & {
  icon: React.ReactNode;
  title: React.ReactNode;
  value: string | number;
};
const StatisticCard = ({
  icon,
  title,
  value,
  ...props
}: StatisticCardProps) => {
  const valueToRender =
    typeof value === "number" ? value.toLocaleString() : value;
  return (
    <Card classNames={{ content: "flex items-center gap-4" }} {...props}>
      <div className="flex size-12 items-center justify-center rounded-md border ring-3 ring-gray-100">
        {icon}
      </div>
      <div className="flex flex-col">
        <div className="text-2xl font-bold">{valueToRender}</div>
        <div className="text-muted-foreground">{title}</div>
      </div>
    </Card>
  );
};

export type { StatisticCardProps };
export { StatisticCard };
