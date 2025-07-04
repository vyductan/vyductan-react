import type { FieldValues } from "react-hook-form";

import type { FormInstance, UseFormProps } from "./hooks/use-form";
import warning from "../_util/warning";
import { FormErrorList as ErrorList } from "./_components/form-error-list";
import { Field as Item } from "./_components/form-field";
import { FieldList as List } from "./_components/form-list";
import { Provider as FormProvider } from "./context";
import { Form as InternalForm } from "./form";
import { useForm } from "./hooks/use-form";
import { useFormInstance } from "./hooks/use-form-instance";
import { useWatch } from "./hooks/use-watch";

export * from "./form";
export * from "./context";
export * from "./hooks/use-form";
export * from "./hooks/use-watch";
export * from "./_components/form-field";
export * from "./_components/form-label";
export * from "./_components/form-message";
export * from "./_components/form-description";
export * from "./_components/form-list";
export * from "./_components/form-control";
export * from "./_components/form-item";
export * from "./types";

type InternalFormType = typeof InternalForm;

type CompoundedComponent = InternalFormType & {
  useForm: typeof useWrapForm;
  useFormInstance: typeof useFormInstance;
  useWatch: typeof useWatch;
  Item: typeof Item;
  List: typeof List;
  ErrorList: typeof ErrorList;
  Provider: typeof FormProvider;

  /** @deprecated Only for warning usage. Do not use. */
  create: () => void;
};

const Form = InternalForm as unknown as CompoundedComponent;

function useWrapForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
>(
  props?: UseFormProps<TFieldValues, TContext, TTransformedValues>,
): [FormInstance<TFieldValues, TContext, TTransformedValues>] {
  const form = useForm(props);
  return [form];
}

Form.Item = Item;
Form.List = List;
Form.ErrorList = ErrorList;
Form.useForm = useWrapForm;
Form.useFormInstance = useFormInstance;
Form.useWatch = useWatch;
Form.Provider = FormProvider;
Form.create = () => {
  warning(
    false,
    "Form",
    "antd v4 removed `Form.create`. Please remove or use `@ant-design/compatible` instead.",
  );
};

export { Form };
