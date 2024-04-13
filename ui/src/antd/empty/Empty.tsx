import type { EmptyProps as AntdEmptyProps } from "antd";
import { Empty as AntdEmpty } from "antd";

type EmptyProps = AntdEmptyProps;
const Empty = ({ imageStyle, ...props }: EmptyProps) => {
  return (
    <AntdEmpty
      image="/empty.svg"
      imageStyle={{
        height: 60,
        margin: "auto",
        display: "flex",
        justifyContent: "center",
        width: "100%",
        ...imageStyle,
      }}
      {...props}
    />
  );
};

export type { EmptyProps };
export { Empty };
