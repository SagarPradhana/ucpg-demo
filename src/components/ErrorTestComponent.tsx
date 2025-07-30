import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Bug, Zap } from "lucide-react";

// Component to test different types of errors
const ErrorTestComponent: React.FC = () => {
  const [shouldThrowError, setShouldThrowError] = useState(false);
  const [errorType, setErrorType] = useState<string>("");

  // Simulate different types of errors
  const throwError = (type: string) => {
    setErrorType(type);
    setShouldThrowError(true);
  };

  // This will trigger the error boundary
  if (shouldThrowError) {
    switch (errorType) {
      case "reference":
        // @ts-ignore - Intentional error for testing
        return undefinedVariable.someProperty;

      case "type":
        // @ts-ignore - Intentional error for testing
        return null.map((item) => item);

      case "range":
        const arr = [1, 2, 3];
        // @ts-ignore - Intentional error for testing
        return arr[999999999999].toString();

      case "syntax":
        // This won't actually throw at runtime but simulates parsing errors
        throw new SyntaxError("Unexpected token");

      case "network":
        throw new Error("Failed to fetch data from server");

      case "permission":
        throw new Error("Permission denied: insufficient privileges");

      default:
        throw new Error("Generic test error for ErrorBoundary testing");
    }
  }

  // Only show in development mode
  if (import.meta.env.MODE !== "development") {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bug className="h-5 w-5" />
          <span>Error Boundary Testing</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground">
          Use these buttons to test the ErrorBoundary component with different
          error types:
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => throwError("reference")}
            variant="destructive"
            size="sm"
            className="text-xs"
          >
            Reference Error
          </Button>

          <Button
            onClick={() => throwError("type")}
            variant="destructive"
            size="sm"
            className="text-xs"
          >
            Type Error
          </Button>

          <Button
            onClick={() => throwError("range")}
            variant="destructive"
            size="sm"
            className="text-xs"
          >
            Range Error
          </Button>

          <Button
            onClick={() => throwError("syntax")}
            variant="destructive"
            size="sm"
            className="text-xs"
          >
            Syntax Error
          </Button>

          <Button
            onClick={() => throwError("network")}
            variant="destructive"
            size="sm"
            className="text-xs"
          >
            Network Error
          </Button>

          <Button
            onClick={() => throwError("permission")}
            variant="destructive"
            size="sm"
            className="text-xs"
          >
            Permission Error
          </Button>
        </div>

        <div className="flex items-center space-x-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
          <AlertTriangle className="h-3 w-3" />
          <span>These errors will be caught by the ErrorBoundary</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorTestComponent;
