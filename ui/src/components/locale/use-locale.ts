/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable unicorn/no-useless-fallback-in-spread */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import * as React from "react";

import type { Locale } from ".";
import type { LocaleContextProps } from "./context";
import LocaleContext from "./context";
import defaultLocaleData from "./en-us";

export type LocaleComponentName = Exclude<keyof Locale, "locale">;

const useLocale = <C extends LocaleComponentName = LocaleComponentName>(
  componentName: C,
  defaultLocale?: Locale[C] | (() => Locale[C]),
): readonly [NonNullable<Locale[C]>, string] => {
  const fullLocale = React.useContext<LocaleContextProps | undefined>(
    LocaleContext,
  );

  const getLocale = React.useMemo<NonNullable<Locale[C]>>(() => {
    const locale = defaultLocale || defaultLocaleData[componentName];
    const localeFromContext = fullLocale?.[componentName] ?? {};
    return {
      ...(typeof locale === "function" ? locale() : locale),
      ...(localeFromContext || {}),
    };
  }, [componentName, defaultLocale, fullLocale]);

  const getLocaleCode = React.useMemo<string>(() => {
    const localeCode = fullLocale?.locale;
    // Had use LocaleProvide but didn't set locale
    if (fullLocale?.exist && !localeCode) {
      return defaultLocaleData.locale;
    }
    return localeCode!;
  }, [fullLocale]);

  return [getLocale, getLocaleCode] as const;
};

export default useLocale;
