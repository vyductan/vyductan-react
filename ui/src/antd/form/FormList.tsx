import type { FormListProps as AntdFormListProps } from "antd/es/form";
import { Form } from "antd";

import { FormItem } from "./FormItem";

const { List } = Form;

export type FormListProps = AntdFormListProps & {
  label?: string;
};
export const FormList = ({ label, children, ...props }: FormListProps) => {
  return (
    <List {...props}>
      {(fields, oparation, meta) => {
        return (
          <FormItem label={label}>{children(fields, oparation, meta)}</FormItem>
        );
      }}
    </List>
  );
};
