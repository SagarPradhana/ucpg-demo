import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle } from "lucide-react";
import { NoData, NoDataPresets } from "@/components/ui/no-data";

const AdminReportsStatesDemo: React.FC = () => {
  const [currentState, setCurrentState] = useState<"loading" | "error" | "nodata" | "data">("loading");

  const renderCurrentState = () => {
    switch (currentState) {
      case "loading":
        return (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading reports...</span>
          </div>
        );

      case "error":
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
            <span className="text-destructive font-medium">Failed to load reports</span>
            <span className="text-sm text-muted-foreground mt-1">
              An error occurred while fetching data
            </span>
          </div>
        );

      case "nodata":
        return (
          <NoData
            {...NoDataPresets.transactions}
            variant="detailed"
            size="md"
          />
        );

      case "data":
        return (
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Sample Transaction 1</div>
                  <div className="text-sm text-muted-foreground">2024-01-15 10:30:00</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">$250.00</div>
                  <Badge variant="default">Completed</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Sample Transaction 2</div>
                  <div className="text-sm text-muted-foreground">2024-01-15 14:45:00</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">$125.50</div>
                  <Badge variant="default">Completed</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Sample Transaction 3</div>
                  <div className="text-sm text-muted-foreground">2024-01-15 16:20:00</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-600">$75.25</div>
                  <Badge variant="secondary">Pending</Badge>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold">AdminReports States Demo</h1>
        <p className="text-muted-foreground mt-2">
          Demonstration of loading, error, no-data, and data states in AdminReports
        </p>
      </div>

      {/* State Controls */}
      <Card>
        <CardHeader>
          <CardTitle>State Controls</CardTitle>
          <CardDescription>
            Click the buttons below to see different states of the AdminReports component
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={currentState === "loading" ? "default" : "outline"}
              onClick={() => setCurrentState("loading")}
            >
              Loading State
            </Button>
            <Button
              variant={currentState === "error" ? "default" : "outline"}
              onClick={() => setCurrentState("error")}
            >
              Error State
            </Button>
            <Button
              variant={currentState === "nodata" ? "default" : "outline"}
              onClick={() => setCurrentState("nodata")}
            >
              No Data State
            </Button>
            <Button
              variant={currentState === "data" ? "default" : "outline"}
              onClick={() => setCurrentState("data")}
            >
              Data State
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current State Display */}
      <Card>
        <CardHeader>
          <CardTitle>Current State: {currentState.charAt(0).toUpperCase() + currentState.slice(1)}</CardTitle>
          <CardDescription>
            This is how the AdminReports component looks in the {currentState} state
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto min-h-[200px]">
            {renderCurrentState()}
          </div>
        </CardContent>
      </Card>

      {/* Implementation Details */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Loading State</h4>
            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`{isLoading && (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    <span className="ml-2 text-muted-foreground">Loading reports...</span>
  </div>
)}`}
            </pre>
          </div>

          <div>
            <h4 className="font-medium mb-2">Error State</h4>
            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`{isError && (
  <div className="flex flex-col items-center justify-center py-12">
    <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
    <span className="text-destructive font-medium">Failed to load reports</span>
    <span className="text-sm text-muted-foreground mt-1">
      {error?.message || "An error occurred while fetching data"}
    </span>
  </div>
)}`}
            </pre>
          </div>

          <div>
            <h4 className="font-medium mb-2">No Data State</h4>
            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`{!isLoading && !isError && (reportsData?.transaction ?? []).length === 0 && (
  <NoData
    {...NoDataPresets.transactions}
    variant="detailed"
    size="md"
  />
)}`}
            </pre>
          </div>

          <div>
            <h4 className="font-medium mb-2">Query Setup</h4>
            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`const { 
  data: AdminReportsResponse, 
  isLoading, 
  isError, 
  error 
} = useQuery({
  queryKey: ["admin-reports", selectedReport, epochRange.from_date, epochRange.to_date],
  queryFn: () => getAdminReports(selectedReport, {
    from_date: epochRange.from_date,
    to_date: epochRange.to_date,
  }),
  gcTime: 60000,
  staleTime: 60000,
});`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Key Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">✅ Loading State</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Animated spinner with Loader2 icon</li>
                <li>• Clear loading message</li>
                <li>• Centered layout</li>
                <li>• Consistent with design system</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">✅ Error State</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Clear error indication with AlertTriangle</li>
                <li>• Error message display</li>
                <li>• Helpful user guidance</li>
                <li>• Destructive color scheme</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">✅ No Data State</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Professional no-data UI</li>
                <li>• Contextual messaging</li>
                <li>• No "Clear Filters" button (as requested)</li>
                <li>• Consistent with other components</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">✅ Data State</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Normal table/data display</li>
                <li>• Full functionality available</li>
                <li>• Responsive design</li>
                <li>• Proper data formatting</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReportsStatesDemo;
