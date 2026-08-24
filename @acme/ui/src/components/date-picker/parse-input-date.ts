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
  // Month-name variants (e.g. "2027-Jan-15 10:00:00", "15 Jan 2027").
  "YYYY-MMM-DD",
  "YYYY-MMM-DD HH:mm",
  "YYYY-MMM-DD HH:mm:ss",
  "DD-MMM-YYYY",
  "DD MMM YYYY",
  "DD MMM YYYY HH:mm",
  "MMM D, YYYY",
  "MMMM D, YYYY",
] as const;

export const parseInputDate = (rawValue: string, preferredFormat: string) => {
  const value = rawValue.trim();
  if (value === "") {
    return;
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

  return;
};
