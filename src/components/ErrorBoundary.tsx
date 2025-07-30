import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console or external service
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleReportError = () => {
    // You can implement error reporting logic here
    const errorDetails = {
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.log("Error Report:", errorDetails);

    // Example: Send to error reporting service
    // reportError(errorDetails);

    alert(
      "Error report has been logged. Please contact support if the issue persists."
    );
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-destructive/10 p-3 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl">Something went wrong</CardTitle>
                <CardDescription className="text-base mt-2">
                  We're sorry, but an unexpected error has occurred. Please try
                  refreshing the page or go back to the home page.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error Details (Development Mode) */}
              {import.meta.env.MODE === "development" && this.state.error && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-sm flex items-center space-x-2">
                    <Bug className="h-4 w-4" />
                    <span>Error Details (Development)</span>
                  </h4>
                  <div className="text-xs font-mono bg-background rounded p-2 overflow-auto max-h-32">
                    <p className="text-destructive font-semibold">
                      {this.state.error.name}: {this.state.error.message}
                    </p>
                    {this.state.error.stack && (
                      <pre className="mt-2 text-muted-foreground whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleRetry}
                  className="flex-1 flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Try Again</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="flex-1 flex items-center space-x-2"
                >
                  <Home className="h-4 w-4" />
                  <span>Go to Home</span>
                </Button>

                <Button
                  variant="secondary"
                  onClick={this.handleReportError}
                  className="flex-1 flex items-center space-x-2"
                >
                  <Bug className="h-4 w-4" />
                  <span>Report Error</span>
                </Button>
              </div>

              {/* Additional Help */}
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  If this problem persists, please contact our support team
                </p>
                <div className="flex justify-center space-x-4 text-xs text-muted-foreground">
                  <span>Error ID: {Date.now().toString(36)}</span>
                  <span>•</span>
                  <span>Time: {new Date().toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
