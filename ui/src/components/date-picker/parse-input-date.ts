import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const FALLBACK_DATE_FORMATS = [
  "YYYY-MM-DD",
  "YYYY/MM/DD",
  "YYYY.MM.DD",
  "YYYY-MM-DD HH:mm",
  "YYYY/MM/DD HH:mm",
  "YYYY-MM-DD HH:mm:ss",
  "YYYY/MM/DD HH:mm:ss",
  "DD/MM/YYYY",
  "D/M/YYYY",
  "DD/MM/YYYY HH:mm",
  "D/M/YYYY HH:mm",
  "DD-MM-YYYY",
  "D-M-YYYY",
  "DD-MM-YYYY HH:mm",
  "D-M-YYYY HH:mm",
  "MM/DD/YYYY",
  "M/D/YYYY",
  "MM/DD/YYYY HH:mm",
  "M/D/YYYY HH:mm",
] as const;

export const parseInputDate = (rawValue: string, preferredFormat: string) => {
  const value = rawValue.trim();
  if (value === "") {
    return null;
  }

  const uniqueFormats = [
    ...new Set([preferredFormat, ...FALLBACK_DATE_FORMATS]),
  ];
  for (const format of uniqueFormats) {
    const parsed = dayjs(value, format, true);
    if (parsed.isValid()) {
      return parsed;
    }
  }

  const relaxedParsed = dayjs(value);
  if (relaxedParsed.isValid()) {
    return relaxedParsed;
  }

  return null;
};
