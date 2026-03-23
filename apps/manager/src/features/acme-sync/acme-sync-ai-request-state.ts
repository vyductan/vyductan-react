export const shouldReportAiRequestError = (input: {
  requestId: number;
  currentRequestId: number;
  projectPath: string;
  activeProjectPaths: string[];
}) => {
  return (
    input.requestId === input.currentRequestId &&
    input.activeProjectPaths.includes(input.projectPath)
  );
};
