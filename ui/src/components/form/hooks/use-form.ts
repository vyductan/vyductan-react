"use client";

/**
 * Docs
 * https://github.com/react-component/field-form/blob/master/src/useForm.ts
 * https://github.com/react-hook-form/react-hook-form/blob/master/src/useForm.ts
 */
import type { BaseSyntheticEvent } from "react";
import type {
  UseFormProps as __UseFormProps,
  DeepPartial,
  DefaultValues,
  FieldValues,
  KeepStateOptions,
  SubmitHandler,
  UseFormReset,
  UseFormReturn,
} from "react-hook-form";
import type { z, ZodSchema } from "zod";
import { useCallback, useEffect, useRef } from "react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import _ from "lodash";
import { useForm as __useForm, useWatch } from "react-hook-form";

import type { ResetAction } from "../types";

type FormInstance<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues extends FieldValues | undefined = undefined,
> = UseFormReturn<TFieldValues, TContext, TTransformedValues> & {
  schema?: ZodSchema | undefined;
  defaultValues?: UseFormProps<
    TFieldValues,
    TContext,
    TTransformedValues
  >["defaultValues"];
  submit: (
    event?: BaseSyntheticEvent<object, unknown, unknown>,
  ) => Promise<void>;
  setFieldsValue: UseFormReset<TFieldValues>;
  resetFields: (keepStateOptions?: KeepStateOptions) => void;
};

type UseFormProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues extends FieldValues | undefined = undefined,
> = {
  schema?: z.ZodSchema<TTransformedValues, any, TFieldValues>;
  onSubmit?: SubmitHandler<TTransformedValues>;
  onValuesChange?: (
    changedValues: Partial<TFieldValues>,
    values: DeepPartial<TFieldValues>,
  ) => void;
} & __UseFormProps<TFieldValues, TContext, TTransformedValues>;
const useForm = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues extends FieldValues | undefined = undefined,
>(
  props?: UseFormProps<TFieldValues, TContext, TTransformedValues>,
): FormInstance<TFieldValues, TContext, TTransformedValues> => {
  const { schema, defaultValues, onSubmit, ...restProps } = props ?? {};

  const methods = __useForm<TFieldValues, TContext, TTransformedValues>(
    props
      ? {
          resolver: schema
            ? standardSchemaResolver<
                TFieldValues,
                TContext,
                TTransformedValues
              >(schema)
            : undefined,
          // defaultValues: props.defaultValues,
          // values: props.values,
          ...restProps,
        }
      : undefined,
  );

  const { reset } = methods;

  const setFieldsValue = useCallback(
    (
      values?:
        | DefaultValues<TFieldValues>
        | TFieldValues
        | ResetAction<TFieldValues>,
      keepStateOptions?: KeepStateOptions,
    ) => {
      reset(values, {
        keepDefaultValues: true,
        ...keepStateOptions,
      });
    },
    [reset],
  );

  const resetFields = useCallback(
    (keepStateOptions?: KeepStateOptions) => {
      if (props) {
        if (typeof props.defaultValues === "function") {
          // props
          //   .defaultValues()
          //   .then((values: TFieldValues) => {
          //     return methods.reset(values, keepStateOptions);
          //   })
          //   .catch(() => void 0);
        } else {
          methods.reset(props.defaultValues, keepStateOptions);
        }
      }
    },
    [methods, props],
  );
  const _formControl =
    useRef<FormInstance<TFieldValues, TContext, TTransformedValues>>(null);

  const submit = useCallback(
    (event?: BaseSyntheticEvent<object, unknown, unknown>) => {
      return onSubmit
        ? methods.handleSubmit(onSubmit)(event)
        : Promise.resolve();
    },
    [methods, onSubmit],
  );

  _formControl.current ??= {
    ...methods,
    schema,
    defaultValues,
    submit,
    resetFields,
    setFieldsValue,
  };

  // onValuesChange
  // has onValuesChange
  // form has values
  // values not same defaultValues
  const control = _formControl.current.control;
  const watchedValues = useWatch<TFieldValues, TTransformedValues>({
    control,
  });

  // const prevWatchedValues = useRef<Partial<TFieldValues>>({});
  // const isUserInteractionRef = useRef(false);
  const {
    onValuesChange,
    //  values
  } = props ?? {};

  // // Track if the change comes from user interaction or props update
  // useEffect(() => {
  //   if (!onValuesChange) return;

  //   // Skip the first render
  //   if (Object.keys(prevWatchedValues.current).length === 0) {
  //     prevWatchedValues.current = { ...watchedValues };
  //     return;
  //   }

  //   // Find changed fields
  //   const changedFields = Object.entries(watchedValues).reduce(
  //     (acc, [key, value]) => {
  //       if (!_.isEqual(value, prevWatchedValues.current[key])) {
  //         acc[key] = value;
  //       }
  //       return acc;
  //     },
  //     {} as Partial<TFieldValues>,
  //   );

  //   // Only trigger onValuesChange if there are actual changes and it's from user interaction
  //   if (Object.keys(changedFields).length > 0 && isUserInteractionRef.current) {
  //     onValuesChange(changedFields, watchedValues);
  //   }

  //   // Update previous values
  //   prevWatchedValues.current = { ...watchedValues };

  //   // Reset the user interaction flag
  //   isUserInteractionRef.current = false;
  // }, [watchedValues, onValuesChange]);

  // // Set up form field change handler to detect user interactions
  // useEffect(() => {
  //   if (!onValuesChange) return;

  //   // Use watch to detect changes
  //   const subscription = methods.watch((value, { name }) => {
  //     if (name) {
  //       // Only if a field name is provided (user interaction)
  //       isUserInteractionRef.current = true;
  //     }
  //   });

  //   // const subscription = methods.formState.subscribe(({ isDirty }) => {
  //   //   if (isDirty) {
  //   //     isUserInteractionRef.current = true;
  //   //   }
  //   // });

  //   return () => subscription.unsubscribe();
  // }, [methods, onValuesChange]);

  useEffect(() => {
    if (!onValuesChange) return;

    // Use watch to detect changes
    const subscription = methods.watch((value, info) => {
      // if (info.name === "description") console.log("iiiiiii", info);
      if (info.type === "change") {
        onValuesChange(info.name ? value[info.name] : {}, value);
      }
    });

    return () => subscription.unsubscribe();
  }, [methods, onValuesChange]);

  // const dirtyFields = _formControl.current.formState.dirtyFields;

  // useEffect(() => {
  //   if (onValuesChange) {
  //     const values = watchedValues;
  //     const changedValues = {} as DeepPartialSkipArrayKey<TFieldValues>;
  //     for (const key in dirtyFields) {
  //       changedValues[key] = values[key];
  //     }
  //     onValuesChange(changedValues, values);
  //   }
  // }, [onValuesChange, watchedValues, dirtyFields]);

  // useEffect(() => {
  //   // if (
  //   //   onValuesChange &&
  //   //   !_.isEqual(defaultValues, w) &&
  //   //   Object.keys(w).length > 0
  //   // ) {
  //   //   //
  //   // }
  //   // if (
  //   //   onValuesChange &&
  //   //   !_.isEqual(defaultValues, w) &&
  //   //   Object.keys(w).length > 0
  //   // ) {
  //   //   console.log("xxxxxxxxxxx", getChangedValues(defaultValues, w));
  //   //   onValuesChange(
  //   //     getChangedValues(defaultValues, w) as TFieldValues,
  //   //     w as TFieldValues,
  //   //   );
  //   // }
  // }, [w, onValuesChange, defaultValues, dirtyFields]);

  _formControl.current.submit = submit;
  _formControl.current.formState = methods.formState;

  return _formControl.current;
};

export { useForm };
export type { UseFormProps, FormInstance };

// const getChangedValues = <TFieldValues extends FieldValues = FieldValues>(
//   object1: DeepPartialSkipArrayKey<TFieldValues>,
//   object2: TFieldValues,
// ): Partial<TFieldValues> => {
//   // if (!object1) return object2;
//   return _.transform(
//     object1,
//     (result, value, key) => {
//       if (!_.isEqual(value, object2[key])) {
//         result[key] = object2[key];
//       }
//     },
//     {},
//   );
// };
