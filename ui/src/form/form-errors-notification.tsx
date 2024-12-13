import { useEffect } from "react";
import { z } from "zod";

import { notification } from "../toast";
import { useFormContext } from "./context";

export const FormErrorsNotification = () => {
  const form = useFormContext();
  const formSchema = form?.schema;
  const formFields = form?.control._fields;
  const formErrors = form?.formState.errors;
  useEffect(() => {
    if (
      formErrors &&
      formSchema &&
      formSchema instanceof z.ZodObject &&
      formFields
    ) {
      // Get the required fields from Zod schema
      const requiredFields = Object.keys(formSchema.shape).filter((key) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const field = formSchema.shape[key as keyof typeof formSchema.shape];
        return !(field instanceof z.ZodOptional);
      });
      // Get mounted fields from React Hook Form
      const mountedFields = Object.keys(formFields);
      // Get required fields that are not mounted
      const unmountedRequiredFields = new Set(
        requiredFields.filter((field) => !mountedFields.includes(field)),
      );
      // handle show notification
      if (Object.keys(formErrors).length > 0) {
        const errorsToNotify = Object.keys(formErrors)
          .filter((key) => {
            return unmountedRequiredFields.has(key);
          })
          .map((key) => {
            return {
              path: key,
              message: formErrors[key]?.message,
            };
          });
        notification.error({
          message: "Unexpected Form Errors",
          description: errorsToNotify.map((error) => {
            const message =
              typeof error.message === "string" ? error.message : "";
            return `${error.path}: ${message}`;
          }),
          duration: Infinity,
          closeButton: true,
        });
      }
    }
  }, [formErrors, formFields, formSchema]);

  return <></>;
  //   return (
  //     <>
  //       {Object.keys(formErrors || {}).length > 0 && (
  //         <Alert type="error" message={Object.values(formErrors || {})} className="mt-6" />
  //       )}
  //     </>
  //   );
};
