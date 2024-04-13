import type { InputProps as AntdInputProps } from "antd";
import { Input } from "antd";

type InputProps = Omit<AntdInputProps, "type">;

export type { InputProps };
export { Input };
