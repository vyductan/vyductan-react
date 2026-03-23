export const clearPreviewPrefetchErrorForProject = (
  current: Record<string, string | null>,
  projectPath: string,
) => ({
  ...current,
  [projectPath]: null,
});
