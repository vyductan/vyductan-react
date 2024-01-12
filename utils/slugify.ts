import Orislugify from "slugify";

export const slugify = (
  string: string,
  options?:
    | {
        replacement?: string;
        remove?: RegExp;
        lower?: boolean;
        strict?: boolean;
        locale?: string;
        trim?: boolean;
      }
    | string,
) => {
  return Orislugify(
    string,
    typeof options === "string"
      ? options
      : { locale: "en", lower: true, ...options },
  );
};
