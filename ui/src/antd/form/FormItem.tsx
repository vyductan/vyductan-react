import type { ReactNode } from "react";
import type {
  Control,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import {
  Children,
  cloneElement,
  isValidElement,
  ReactElement,
  useEffect,
} from "react";
import { Form as AntdForm } from "antd";
import { Controller, useController } from "react-hook-form";

import { FormInstance } from "./useForm";

type AntdFormItemProps = React.ComponentProps<typeof AntdForm.Item>;

export type FormItemProps<TFieldValues extends FieldValues = FieldValues> = {
  // children: ReactNode | (({
  //         field,
  //         fieldState,
  //         formState,
  //       }: {
  //         field: FieldControllerRenderProps<TFieldValues, TName>;
  //         fieldState: ControllerFieldState;
  //         formState: UseFormStateReturn<TFieldValues>;
  //       }) => React.ReactElement);
  disabled?: boolean;
} & Omit<AntdFormItemProps, "children" | "name" | "rules" | "validateStatus"> &
  (
    | {
        name?: never;
        control?: never;
        children: ReactNode;
      }
    | {
        name: FieldPath<TFieldValues>;
        control: Control<TFieldValues>;
        children: ReactNode | ControllerProps<TFieldValues>["render"];
      }
  );

// TODO: Support `onBlur` `ref` `reset`
export const FormItem = <TFieldValues extends FieldValues = FieldValues>({
  children,
  control,
  name,
  ...props
}: FormItemProps<TFieldValues>) => {
  // const { field, fieldState } = useController({ name, control, disabled });
  // const form = AntdForm.useFormInstance();

  // useEffect(() => {
  // 	form.setFieldValue(name, field.value);
  // }, [field.value]);

  if (!name) {
    return <AntdForm.Item {...props} />;
  }
  return (
    <AntdForm.Item {...props}>
      <Controller
        control={control}
        disabled={props.disabled}
        name={name}
        // render={children}
        render={
          typeof children === "function" ? children : () => <>{children}</>
        }
        // render={({ field, fieldState }) => {
        //   return (
        //     <AntdForm.Item
        //       {...props}
        //       //@ts-expect-error Ant Design form item name type safe is not necessary here
        //       name={name}
        //       initialValue={field.value}
        //       validateStatus={fieldState.invalid ? "error" : undefined}
        //       help={fieldState.error?.message ?? help}
        //     >
        //       {Children.map(
        //         children,
        //         (child) =>
        //           isValidElement(child) &&
        //           cloneElement(child, {
        //             ...field,
        //             //@ts-expect-error onChange type safe is not necessary here
        //             onChange: (...params) => {
        //               child.props.onChange?.(...params);
        //               field.onChange(...params);
        //             },
        //             onBlur: () => {
        //               child.props.onBlur?.();
        //               field.onBlur();
        //             },
        //             ...(valuePropName && {
        //               [valuePropName]: field.value,
        //             }),
        //           }),
        //       )}
        //     </AntdForm.Item>
        //   );
        // }}
      />
    </AntdForm.Item>
  );

  // return (
  //
  // );
};
