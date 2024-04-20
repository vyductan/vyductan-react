export const t = (keyword: string, ns: Record<string, unknown>) => {
  return ns[keyword];
};
export type TranslationFn = typeof t;
