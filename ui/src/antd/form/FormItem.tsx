import type { FormItemProps as AntdFormItemProps } from "antd";
import type { ReactElement } from "react";
import type {
  ControllerProps,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { Form as AntdForm } from "antd";
import { FormItem as RhfAntdFormItem } from "react-hook-form-antd";

const { Item: AntdFormItem } = AntdForm;

export type FieldControllerRenderProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = ControllerRenderProps<TFieldValues, TName>;
type FormItemProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<ControllerProps<TFieldValues, TName>, "control" | "name" | "render"> &
  Omit<AntdFormItemProps, "name"> & {
    children: ReactElement;
    label?: string;
    description?: string;
    className?: string;
  } & (
    | {
        name?: never;
        control?: never;
      }
    | {
        name: ControllerProps<TFieldValues, TName>["name"];
        control: ControllerProps<TFieldValues, TName>["control"];
      }
  );
const FormItem = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  rules: _,
  ...props
}: FormItemProps<TFieldValues, TName>) => {
  if (control && name)
    return <RhfAntdFormItem control={control} name={name} {...props} />;
  return <AntdFormItem {...props} />;
};
export { FormItem };
export type { FormItemProps };
