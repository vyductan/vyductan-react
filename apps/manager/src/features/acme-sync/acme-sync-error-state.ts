export interface LastModifiedEntry {
  display: string;
  time: number | null;
  errorMessage?: string | null;
}

export const buildLastModifiedFailureState = (
  message: string,
): LastModifiedEntry => {
  return {
    display: "Error",
    time: null,
    errorMessage: message,
  };
};

export const formatSyncExecutionError = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message;
  }

  return "Sync failed. Check the logs and try again.";
};

export const buildFocusListenerSetupErrorMessage = (error: unknown) => {
  const detail = formatSyncExecutionError(error);
  return `Failed to subscribe to window focus changes: ${detail}`;
};
