interface ImportMeta {
  glob<T = unknown>(
    pattern: string | string[],
    options?: {
      as?: string;
      eager?: boolean;
      import?: string;
      query?: string | Record<string, string | number | boolean>;
    },
  ): Record<string, T>;
}

/**
 * Vite serves `?raw` imports as the file's text. Declared here rather than by
 * pulling in `vite/client`, which also declares globals this package does not
 * want (and would widen what typecheck accepts).
 */
declare module "*?raw" {
  const content: string;
  export default content;
}
