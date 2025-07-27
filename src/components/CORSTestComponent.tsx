import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";

const CORSTestComponent: React.FC = () => {
  const [testStatus, setTestStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [testResult, setTestResult] = useState<string>("");
  const [apiUrl, setApiUrl] = useState<string>("");

  const testCORS = async () => {
    setTestStatus("testing");
    setTestResult("");

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
    setApiUrl(apiBaseUrl);

    try {
      // Test preflight request (OPTIONS)
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "OPTIONS",
        headers: {
          Origin: window.location.origin,
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "Content-Type, Authorization",
        },
      });

      if (response.ok || response.status === 204) {
        setTestStatus("success");
        setTestResult(
          `✅ CORS is configured correctly! Status: ${response.status}`
        );
      } else {
        setTestStatus("error");
        setTestResult(
          `❌ CORS preflight failed. Status: ${response.status}. Check your backend CORS configuration.`
        );
      }
    } catch (error: any) {
      setTestStatus("error");
      if (error.message.includes("CORS")) {
        setTestResult(
          "❌ CORS is blocking requests. Add your Netlify domain to your backend CORS configuration."
        );
      } else if (error.message.includes("Failed to fetch")) {
        setTestResult(
          "❌ Cannot reach API server. Check if your backend is running and the URL is correct."
        );
      } else {
        setTestResult(`❌ Test failed: ${error.message}`);
      }
    }
  };

  const getStatusBadge = () => {
    switch (testStatus) {
      case "success":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Working
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      case "testing":
        return (
          <Badge variant="secondary">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Testing
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Not Tested
          </Badge>
        );
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          CORS Test
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Testing API connection to:
          </p>
          <code className="text-xs bg-muted p-2 rounded block">
            {apiUrl || "Not determined yet"}
          </code>
        </div>

        <Button
          onClick={testCORS}
          disabled={testStatus === "testing"}
          className="w-full"
        >
          {testStatus === "testing" ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing CORS...
            </>
          ) : (
            "Test CORS Configuration"
          )}
        </Button>

        {testResult && (
          <div
            className={`p-3 rounded text-sm ${
              testStatus === "success"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {testResult}
          </div>
        )}

        {testStatus === "error" && (
          <div className="text-xs text-muted-foreground space-y-2">
            <p>
              <strong>To fix CORS errors:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Add CORS configuration to your backend</li>
              <li>Include your Netlify domain in allowed origins</li>
              <li>Ensure OPTIONS requests are handled</li>
              <li>Redeploy your backend service</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CORSTestComponent;
