// May 16, 2022
const isBrowser = !!(
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
)

export default isBrowser
