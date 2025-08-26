import type { ZodType } from "zod/v4";
import { useMemo } from "react";
import _ from "lodash";
import { ZodOptional } from "zod";

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
export const useFieldOptionalityCheck = (
  fieldName: string | undefined,
  schema?: ZodType,
) => {
  return useMemo(() => {
    if (!fieldName || !schema) {
      return;
    }

    // If it's a ZodObject, use its shape, otherwise assume it's already the shape
    const shape = "shape" in schema ? schema.shape : schema;
    const zodFieldPath = generateZodFieldPath(fieldName);

    const zodField = _.get(shape, zodFieldPath);
    if (!zodField) handleNotFoundField(fieldName);
    return zodField instanceof ZodOptional;
  }, [fieldName, schema]);
};
