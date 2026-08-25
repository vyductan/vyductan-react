import type { Control, FieldValues } from "react-hook-form";
import { useEffect } from "react";
import { useFormState } from "react-hook-form";
import { z } from "zod";

import { notification } from "../../notification";
import { useFormContext } from "../context";

const FormErrorsNotificationInner = ({
  control,
  schema,
}: {
  control: Control<FieldValues>;
  schema: unknown;
}) => {
  // useFormState uses isRoot=false, so it sets _proxyFormState.errors = true
  // (not 'all'). The root useForm() subscription therefore does NOT re-render
  // the whole form on every errors emission — only this component does, and it
  // renders nothing. Reading form.formState.errors directly would latch the
  // root proxy to 'all' and re-render the entire form on every emission.
  const { errors } = useFormState({ control });

  useEffect(() => {
    if (!(schema instanceof z.ZodObject)) return;
    if (Object.keys(errors).length === 0) return;

    // control._fields is mutated in place, so read it here rather than treating
    // it as an effect dependency (its identity never changes).
    const mountedFields = new Set(Object.keys(control._fields));
    const unmountedRequiredFields = new Set(
      Object.keys(schema.shape).filter(
        (key) =>
          !(schema.shape[key] instanceof z.ZodOptional) &&
          !mountedFields.has(key),
      ),
    );

    const descriptions = Object.keys(errors)
      .filter((key) => unmountedRequiredFields.has(key))
      .map((key) => {
        const message = errors[key]?.message;
        return `${key}: ${typeof message === "string" ? message : ""}`;
      });

    if (descriptions.length > 0) {
      notification.error({
        message: "Unexpected Form Errors",
        description: descriptions,
        duration: Infinity,
        closeButton: true,
      });
    }
  }, [errors, control, schema]);

  return <></>;
};

export const FormErrorsNotification = () => {
  const formContext = useFormContext();
  const control = formContext?.form?.control;
  if (!control) return <></>;

  return (
    <FormErrorsNotificationInner
      control={control as unknown as Control<FieldValues>}
      schema={formContext?.form?.schema}
    />
  );
};
