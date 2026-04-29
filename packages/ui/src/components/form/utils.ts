import { z } from "zod";

export type Rule = {
  required?: boolean;
  message?: string;
  min?: number;
  max?: number;
  pattern?: RegExp;
  type?: "email" | "url" | "number";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validator?: (value: any) => boolean | Promise<boolean>;
};

type RequiredNumberSchemaOptions = {
  min?: number;
  max?: number;
};

export function requiredNumberSchema(
  message: string,
  options: RequiredNumberSchemaOptions = {},
) {
  let schema = z.coerce.number({ error: message });

  if (options.min !== undefined) {
    schema = schema.min(options.min, { message });
  }

  if (options.max !== undefined) {
    schema = schema.max(options.max, { message });
  }

  return z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    schema,
  );
}

export function rulesToZod(
  rules: Rule[],
  baseType: "string" | "number" | "boolean" = "string",
) {
  let schema: z.ZodTypeAny;

  // Base schema
  switch (baseType) {
    case "string": {
      schema = z.string();
      break;
    }
    case "number": {
      schema = z.number();
      break;
    }
    case "boolean": {
      schema = z.boolean();
      break;
    }
    default: {
      schema = z.string();
    }
  }

  for (const rule of rules) {
    if (rule.required && baseType === "string") {
      schema = (schema as z.ZodString).min(
        1,
        rule.message ?? "This field is required",
      );
    }

    if (rule.min !== undefined && baseType === "string") {
      schema = (schema as z.ZodString).min(rule.min, rule.message);
    }

    if (rule.max !== undefined && baseType === "string") {
      schema = (schema as z.ZodString).max(rule.max, rule.message);
    }

    if (rule.pattern && baseType === "string") {
      schema = (schema as z.ZodString).regex(rule.pattern, rule.message);
    }

    if (rule.type === "email" && baseType === "string") {
      schema = (schema as z.ZodString).email(rule.message ?? "Invalid email");
    }

    if (rule.type === "url" && baseType === "string") {
      schema = (schema as z.ZodString).url(rule.message ?? "Invalid URL");
    }
  }

  return schema;
}
