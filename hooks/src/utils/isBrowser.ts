// May 16, 2022
const isBrowser =
  typeof window !== "undefined" && !!window.document.createElement;

export default isBrowser;
