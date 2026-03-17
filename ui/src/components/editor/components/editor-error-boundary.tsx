"use client";

import React from "react";

import { message } from "../../message";

interface EditorErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

interface EditorErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary for Lexical editor
 * Provides user-friendly error messages and recovery options
 */
export class EditorErrorBoundary extends React.Component<
  EditorErrorBoundaryProps,
  EditorErrorBoundaryState
> {
  constructor(props: EditorErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): EditorErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    console.error("Lexical Editor Error:", error, errorInfo);

    // Show user-friendly message
    message.error(
      "Đã xảy ra lỗi với trình soạn thảo. Vui lòng thử tải lại trang.",
    );
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback ?? DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Default error fallback component
 */
function DefaultErrorFallback({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8">
      <h3 className="mb-2 text-lg font-semibold text-red-800">
        Lỗi trình soạn thảo
      </h3>
      <p className="mb-4 text-sm text-red-600">
        {error.message || "Đã xảy ra lỗi không xác định"}
      </p>
      <button
        onClick={resetError}
        className="rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
      >
        Thử lại
      </button>
    </div>
  );
}
