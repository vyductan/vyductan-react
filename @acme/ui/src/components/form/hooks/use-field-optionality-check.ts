/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import { ZodArray } from "zod";

import { useFormContext } from "../context";

// Modifier schemas that wrap another schema. We must unwrap these to descend
// into the underlying object/array, but we must NEVER unwrap the leaf we
// return — isRequiredField relies on the optional/nullable signal being intact
// (it probes safeParse(undefined) / safeParse(null)).
const CONTAINER_WRAPPERS = new Set([
  "ZodOptional",
  "ZodNullable",
  "ZodDefault",
  "ZodCatch",
  "ZodReadonly",
]);
const CONTAINER_WRAPPER_TYPES = new Set([
  "optional",
  "nullable",
  "default",
  "catch",
  "readonly",
]);

const unwrapContainer = (schema: any): any => {
  let current = schema;
  while (current) {
    const ctorName = current.constructor?.name;
    const type = current.type;
    if (CONTAINER_WRAPPERS.has(ctorName) || CONTAINER_WRAPPER_TYPES.has(type)) {
      const def = current.def ?? current._def;
      current =
        typeof current.unwrap === "function" ? current.unwrap() : def?.innerType;
    } else {
      break;
    }
  }
  return current;
};

// Walk a react-hook-form field path ("items.0.name") through a zod schema and
// return the leaf schema for that field, or undefined if the path is invalid.
// Zod-4 shape: ZodObject#shape, ZodArray#element, def via `.def` (`._def` alias).
const getZodField = (schema: any, path: string): any => {
  let current = schema;

  for (const part of path.split(".")) {
    // Unwrap the CONTAINER before indexing into it (never the returned leaf).
    current = unwrapContainer(current);
    if (!current) return undefined;

    const def = current.def ?? current._def;
    const ctorName = current.constructor?.name;
    const isIndex = /^\d+$/.test(part);

    if (isIndex) {
      if (ctorName === "ZodArray" || current.type === "array") {
        current = current.element ?? def?.element;
      } else {
        return undefined;
      }
    } else {
      if (current.shape || current.type === "object") {
        current = current.shape?.[part] ?? def?.shape?.[part];
      } else {
        return undefined;
      }
    }
  }

  // Leaf stays wrapped — isRequiredField needs the optional/nullable signal.
  return current;
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

    const zodField = getZodField(schema, fieldName);
    if (!zodField) handleNotFoundField(fieldName);
    return isRequiredField(zodField);
  }, [fieldName, schema, defaultRequired]);
};
