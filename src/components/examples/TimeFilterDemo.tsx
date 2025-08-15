import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TimeFilter } from "@/components/ui/time-filter";
import { useTimeFilter } from "@/hooks/useTimeFilter";
import { getRelativeTimeOptions } from "@/utils/timeFilters";

// Sample data for demonstration
const generateSampleData = () => {
  const now = Date.now();
  return [
    {
      id: 1,
      name: "Recent Transaction",
      timestamp: Math.floor((now - 30 * 60 * 1000) / 1000), // 30 minutes ago
      amount: 100,
    },
    {
      id: 2,
      name: "Morning Transaction",
      timestamp: Math.floor((now - 4 * 60 * 60 * 1000) / 1000), // 4 hours ago
      amount: 250,
    },
    {
      id: 3,
      name: "Yesterday's Transaction",
      timestamp: Math.floor((now - 25 * 60 * 60 * 1000) / 1000), // 25 hours ago
      amount: 75,
    },
    {
      id: 4,
      name: "Last Week Transaction",
      timestamp: Math.floor((now - 8 * 24 * 60 * 60 * 1000) / 1000), // 8 days ago
      amount: 300,
    },
    {
      id: 5,
      name: "Old Transaction",
      timestamp: Math.floor((now - 35 * 24 * 60 * 60 * 1000) / 1000), // 35 days ago
      amount: 150,
    },
  ];
};

const TimeFilterDemo: React.FC = () => {
  const [sampleData] = useState(generateSampleData());

  // Epoch mode filter
  const epochFilter = useTimeFilter({
    mode: "epoch",
    defaultValue: "Today",
  });

  // Relative mode filter
  const relativeFilter = useTimeFilter({
    mode: "relative",
    defaultValue: "24h",
  });

  // Custom mode filter
  const customFilter = useTimeFilter({
    mode: "custom",
    defaultDateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    defaultDateTo: new Date().toISOString().split('T')[0],
  });

  // Filter data based on different modes
  const epochFilteredData = sampleData.filter(item => 
    epochFilter.filterByTimestamp(item.timestamp)
  );

  const relativeFilteredData = sampleData.filter(item => 
    relativeFilter.filterByTimestamp(item.timestamp)
  );

  const customFilteredData = sampleData.filter(item => 
    customFilter.filterByTimestamp(item.timestamp)
  );

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const calculateTotal = (data: typeof sampleData) => {
    return data.reduce((sum, item) => sum + item.amount, 0);
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Time Filter Demo</h1>
        <p className="text-muted-foreground mt-2">
          Interactive demonstration of the custom time filter component
        </p>
      </div>

      {/* Sample Data Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Sample Data</CardTitle>
          <CardDescription>
            {sampleData.length} transactions spanning different time periods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleData.map(item => (
              <div key={item.id} className="p-3 border rounded-lg">
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-muted-foreground">
                  {formatTimestamp(item.timestamp)}
                </div>
                <div className="text-lg font-bold text-green-600">
                  ${item.amount}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Badge variant="outline" className="text-lg px-4 py-2">
              Total: ${calculateTotal(sampleData)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Epoch Mode Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Epoch Mode Filter</CardTitle>
          <CardDescription>
            Filter using predefined time periods (Today, Yesterday, Last 7 Days, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TimeFilter
            mode="epoch"
            value={epochFilter.value}
            onChange={epochFilter.handleEpochChange}
            epochRange={epochFilter.epochRange}
            showEpochDebug={true}
            label="Select Time Period"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Filtered Results ({epochFilteredData.length} items)</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {epochFilteredData.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">{item.name}</span>
                    <Badge variant="outline">${item.amount}</Badge>
                  </div>
                ))}
                {epochFilteredData.length === 0 && (
                  <div className="text-center text-muted-foreground py-4">
                    No transactions in this period
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm">
                <strong>Total Amount:</strong> ${calculateTotal(epochFilteredData)}
              </div>
              <div className="text-sm">
                <strong>Filter:</strong> {epochFilter.value}
              </div>
              {epochFilter.epochRange && (
                <div className="text-xs text-muted-foreground">
                  <strong>Range:</strong><br />
                  From: {new Date(epochFilter.epochRange.from_date * 1000).toLocaleString()}<br />
                  To: {new Date(epochFilter.epochRange.to_date * 1000).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relative Mode Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Relative Mode Filter</CardTitle>
          <CardDescription>
            Filter using relative time periods (Last 1 Hour, Last 24 Hours, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TimeFilter
            mode="relative"
            value={relativeFilter.value}
            onChange={relativeFilter.handleRelativeChange}
            relativeOptions={getRelativeTimeOptions('extended')}
            label="Select Relative Period"
            variant="compact"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Filtered Results ({relativeFilteredData.length} items)</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {relativeFilteredData.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">{item.name}</span>
                    <Badge variant="outline">${item.amount}</Badge>
                  </div>
                ))}
                {relativeFilteredData.length === 0 && (
                  <div className="text-center text-muted-foreground py-4">
                    No transactions in this period
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm">
                <strong>Total Amount:</strong> ${calculateTotal(relativeFilteredData)}
              </div>
              <div className="text-sm">
                <strong>Filter:</strong> {relativeFilter.value}
              </div>
              <div className="text-xs text-muted-foreground">
                Real-time filtering based on current timestamp
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Mode Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Date Range Filter</CardTitle>
          <CardDescription>
            Filter using custom start and end dates
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Filtered Results ({customFilteredData.length} items)</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {customFilteredData.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">{item.name}</span>
                    <Badge variant="outline">${item.amount}</Badge>
                  </div>
                ))}
                {customFilteredData.length === 0 && (
                  <div className="text-center text-muted-foreground py-4">
                    No transactions in this date range
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm">
                <strong>Total Amount:</strong> ${calculateTotal(customFilteredData)}
              </div>
              <div className="text-sm">
                <strong>Date Range:</strong> {customFilter.dateFrom} to {customFilter.dateTo}
              </div>
              <div className="text-sm">
                <strong>Valid Range:</strong> {customFilter.isValidRange ? "✅ Yes" : "❌ No"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reset All Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={epochFilter.reset}
            >
              Reset Epoch Filter
            </Button>
            <Button 
              variant="outline" 
              onClick={relativeFilter.reset}
            >
              Reset Relative Filter
            </Button>
            <Button 
              variant="outline" 
              onClick={customFilter.reset}
            >
              Reset Custom Filter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeFilterDemo;
