import { useMemo } from "react";
import _ from "lodash";
import { ZodArray } from "zod";

import { useFormContext } from "../context";

const TEMPORARY_REPLACEMENT_PLACEHOLDER = "__PLACEHOLDER__";
const ZOD_OBJECT_FIELD_PATH = ".shape.";
// const ZOD_ARRAY_FIELD_PATH_1 = "._def.type";
// maybe for refine()
const ZOD_ARRAY_FIELD_PATH = "._def.type._def.schema";

export const generateZodFieldPath = (fieldName: string) => {
  return fieldName
    .replaceAll(/\.\d+/g, TEMPORARY_REPLACEMENT_PLACEHOLDER)
    .replaceAll(".", ZOD_OBJECT_FIELD_PATH)
    .replaceAll(
      new RegExp(TEMPORARY_REPLACEMENT_PLACEHOLDER, "g"),
      ZOD_ARRAY_FIELD_PATH,
    );
};

const handleNotFoundField = (fieldName: string) => {
  throw new Error(
    `Field ${fieldName} not found in schema. Make sure the field exists in the schema or do not pass the schema inside the Form - in this case you could manually set the required property for FormLabel.`,
  );
};

const isRequiredField = (zodField: unknown) => {
  if (
    typeof zodField !== "object" ||
    zodField === null ||
    !("safeParse" in zodField) ||
    typeof zodField.safeParse !== "function"
  ) {
    return true;
  }

  if (zodField.safeParse(void 0).success) {
    return false;
  }

  if (zodField.safeParse(null).success) {
    return false;
  }

  if (zodField instanceof ZodArray && zodField.safeParse([]).success) {
    return false;
  }

  return true;
};

export const useRequiredFieldCheck = (
  fieldName: string | undefined,
  defaultRequired?: boolean,
) => {
  const formContext = useFormContext();
  const schema = formContext?.form?.schema;

  return useMemo(() => {
    if (defaultRequired !== undefined) {
      return defaultRequired;
    }

    if (!fieldName || !schema) {
      return;
    }

    // If it's a ZodObject, use its shape, otherwise assume it's already the shape
    const shape = "shape" in schema ? schema.shape : schema;
    const zodFieldPath = generateZodFieldPath(fieldName);

    const zodField = _.get(shape, zodFieldPath);
    if (!zodField) handleNotFoundField(fieldName);
    return isRequiredField(zodField);
  }, [fieldName, schema, defaultRequired]);
};
