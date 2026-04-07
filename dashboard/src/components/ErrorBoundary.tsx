"use client";

import React, { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          className="flex flex-col items-center justify-center gap-4 p-12 rounded-xl"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            minHeight: 200,
          }}
        >
          <div className="text-4xl">⚠️</div>
          <h3 className="text-lg font-semibold">Something went wrong</h3>
          <p className="text-sm text-center max-w-md" style={{ color: "var(--text-muted)" }}>
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:brightness-110"
            style={{
              background: "var(--accent-sky)",
              color: "#fff",
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
