import { Component } from "react";
import { AlertTriangle } from "lucide-react";
import { handleError } from "./errorHandler";

// Catches render-time errors anywhere in the tree below it (Suspense/query
// errors are handled separately by queryClient.js) so one broken page can't
// take down the entire app shell — pairs with the axios interceptor (api.js)
// and TanStack Query's global onError (queryClient.js) as the third layer of
// this app's central error handling.
export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    handleError(error, "render:" + (info?.componentStack?.split("\n")[1]?.trim() || "unknown"));
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 p-10 text-center">
          <AlertTriangle size={36} className="text-destructive opacity-70" />
          <p className="font-semibold text-foreground">Something went wrong loading this page</p>
          <p className="text-sm text-muted-foreground">Try reloading, or navigate to a different module.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 py-1.5 px-4 text-sm font-medium rounded-md bg-primary text-primary-foreground border-none cursor-pointer hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
