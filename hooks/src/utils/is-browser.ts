/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable unicorn/prefer-global-this */
// May 16, 2022
// https://github.com/alibaba/hooks/blob/master/packages/hooks/src/utils/isBrowser.ts
const isBrowser = !!(
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
);

export default isBrowser;
