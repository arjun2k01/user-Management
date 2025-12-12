// src/components/common/ErrorBoundary.jsx
import React from "react";
import { AlertTriangle } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Enterprise apps always log errors
    console.error("Unhandled UI error:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
          <div className="max-w-md w-full rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-slate-950 p-6 shadow-xl text-center">
            <div className="flex justify-center mb-3">
              <div className="h-12 w-12 rounded-full bg-red-500/15 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </div>

            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Something went wrong
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              An unexpected error occurred. Please reload the page.
            </p>

            <button
              onClick={this.handleReload}
              className="mt-5 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 transition"
            >
              Reload application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
