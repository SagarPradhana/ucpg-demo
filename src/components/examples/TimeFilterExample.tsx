import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TimeFilter, defaultRelativeOptions, extendedRelativeOptions } from "@/components/ui/time-filter";
import { useTimeFilter } from "@/hooks/useTimeFilter";
import { getRelativeTimeOptions } from "@/utils/timeFilters";

const TimeFilterExample: React.FC = () => {
  // Example 1: Epoch mode (like AdminReports)
  const epochFilter = useTimeFilter({
    mode: "epoch",
    defaultValue: "Today",
    onFilterChange: (state) => {
      console.log("Epoch filter changed:", state);
    },
  });

  // Example 2: Relative mode (like AdminDashboard)
  const relativeFilter = useTimeFilter({
    mode: "relative",
    defaultValue: "24h",
    onFilterChange: (state) => {
      console.log("Relative filter changed:", state);
    },
  });

  // Example 3: Custom date range mode (like AdminTransactions)
  const customFilter = useTimeFilter({
    mode: "custom",
    defaultDateFrom: "2024-01-01",
    defaultDateTo: "2024-12-31",
    onFilterChange: (state) => {
      console.log("Custom filter changed:", state);
    },
  });

  // Example 4: Dynamic mode switching
  const [dynamicMode, setDynamicMode] = useState<"epoch" | "relative" | "custom">("epoch");
  const dynamicFilter = useTimeFilter({
    mode: dynamicMode,
    onFilterChange: (state) => {
      console.log("Dynamic filter changed:", state);
    },
  });

  // Sample data for filtering demonstration
  const sampleData = [
    { id: 1, name: "Transaction 1", timestamp: Math.floor(Date.now() / 1000) - 3600 }, // 1 hour ago
    { id: 2, name: "Transaction 2", timestamp: Math.floor(Date.now() / 1000) - 86400 }, // 1 day ago
    { id: 3, name: "Transaction 3", timestamp: Math.floor(Date.now() / 1000) - 604800 }, // 1 week ago
    { id: 4, name: "Transaction 4", timestamp: Math.floor(Date.now() / 1000) - 2592000 }, // 1 month ago
  ];

  const filteredData = sampleData.filter(item => relativeFilter.filterByTimestamp(item.timestamp));

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Time Filter Examples</h1>
        <p className="text-muted-foreground mt-2">
          Demonstrating different time filter modes and configurations
        </p>
      </div>

      {/* Example 1: Epoch Mode */}
      <Card>
        <CardHeader>
          <CardTitle>1. Epoch Mode (AdminReports Style)</CardTitle>
          <CardDescription>
            Uses predefined time labels that convert to epoch ranges. Perfect for reports and analytics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TimeFilter
            mode="epoch"
            value={epochFilter.value}
            onChange={epochFilter.handleEpochChange}
            epochRange={epochFilter.epochRange}
            onEpochRangeChange={(range) => console.log("Epoch range:", range)}
            showEpochDebug={true}
            label="Report Time Range"
            placeholder="Select report period"
          />
          <div className="text-sm text-muted-foreground">
            <strong>Current Selection:</strong> {epochFilter.value}
            {epochFilter.epochRange && (
              <div>
                From: {new Date(epochFilter.epochRange.from_date * 1000).toLocaleString()} <br />
                To: {new Date(epochFilter.epochRange.to_date * 1000).toLocaleString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Example 2: Relative Mode */}
      <Card>
        <CardHeader>
          <CardTitle>2. Relative Mode (AdminDashboard Style)</CardTitle>
          <CardDescription>
            Uses relative time periods for real-time filtering. Great for logs and live data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TimeFilter
            mode="relative"
            value={relativeFilter.value}
            onChange={relativeFilter.handleRelativeChange}
            relativeOptions={getRelativeTimeOptions('logs')}
            label="Log Time Range"
            placeholder="Select time period"
            variant="compact"
          />
          <div className="text-sm text-muted-foreground">
            <strong>Current Selection:</strong> {relativeFilter.value}
          </div>
          
          {/* Demo filtered data */}
          <div className="mt-4">
            <h4 className="font-medium mb-2">Filtered Sample Data:</h4>
            <div className="space-y-2">
              {filteredData.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span>{item.name}</span>
                  <Badge variant="outline">
                    {new Date(item.timestamp * 1000).toLocaleString()}
                  </Badge>
                </div>
              ))}
              {filteredData.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  No data matches the current filter
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Example 3: Custom Date Range Mode */}
      <Card>
        <CardHeader>
          <CardTitle>3. Custom Date Range Mode (AdminTransactions Style)</CardTitle>
          <CardDescription>
            Allows users to select specific date ranges. Ideal for detailed analysis and custom reporting.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TimeFilter
            mode="custom"
            dateFrom={customFilter.dateFrom}
            dateTo={customFilter.dateTo}
            onDateFromChange={customFilter.handleDateFromChange}
            onDateToChange={customFilter.handleDateToChange}
            label="Custom Date Range"
            orientation="horizontal"
          />
          <div className="text-sm text-muted-foreground">
            <strong>Date Range:</strong> {customFilter.dateFrom} to {customFilter.dateTo}
            <br />
            <strong>Valid Range:</strong> {customFilter.isValidRange ? "✅ Yes" : "❌ No"}
          </div>
        </CardContent>
      </Card>

      {/* Example 4: Dynamic Mode Switching */}
      <Card>
        <CardHeader>
          <CardTitle>4. Dynamic Mode Switching</CardTitle>
          <CardDescription>
            Switch between different filter modes dynamically based on user needs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button
              variant={dynamicMode === "epoch" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setDynamicMode("epoch");
                dynamicFilter.switchMode("epoch");
              }}
            >
              Epoch Mode
            </Button>
            <Button
              variant={dynamicMode === "relative" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setDynamicMode("relative");
                dynamicFilter.switchMode("relative");
              }}
            >
              Relative Mode
            </Button>
            <Button
              variant={dynamicMode === "custom" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setDynamicMode("custom");
                dynamicFilter.switchMode("custom");
              }}
            >
              Custom Mode
            </Button>
          </div>

          <TimeFilter
            mode={dynamicMode}
            value={dynamicFilter.value}
            onChange={
              dynamicMode === "epoch" 
                ? dynamicFilter.handleEpochChange
                : dynamicMode === "relative"
                ? dynamicFilter.handleRelativeChange
                : undefined
            }
            epochRange={dynamicFilter.epochRange}
            onEpochRangeChange={(range) => console.log("Dynamic epoch range:", range)}
            dateFrom={dynamicFilter.dateFrom}
            dateTo={dynamicFilter.dateTo}
            onDateFromChange={dynamicFilter.handleDateFromChange}
            onDateToChange={dynamicFilter.handleDateToChange}
            relativeOptions={extendedRelativeOptions}
            showEpochDebug={dynamicMode === "epoch"}
            label={`${dynamicMode.charAt(0).toUpperCase() + dynamicMode.slice(1)} Filter`}
          />

          <div className="text-sm text-muted-foreground">
            <strong>Current Mode:</strong> {dynamicMode}
            <br />
            <strong>Current State:</strong> {JSON.stringify(dynamicFilter.state, null, 2)}
          </div>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Basic TimeFilter Component:</h4>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`<TimeFilter
  mode="epoch"
  value={value}
  onChange={handleChange}
  label="Time Range"
/>`}
              </pre>
            </div>
            <div>
              <h4 className="font-medium mb-2">Using the useTimeFilter Hook:</h4>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`const filter = useTimeFilter({
  mode: "relative",
  defaultValue: "24h",
  onFilterChange: (state) => {
    console.log(state);
  }
});`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeFilterExample;
