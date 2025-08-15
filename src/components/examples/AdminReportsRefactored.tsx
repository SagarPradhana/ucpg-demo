import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  FileSpreadsheet,
  BarChart3,
  Users,
  DollarSign,
  Percent,
  AlertTriangle,
  Settings,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAdminReports } from "@/service/adminservices";
import { epochToCustomLocalStringTime } from "@/Common";
import { TimeFilter } from "@/components/ui/time-filter";
import { useTimeFilter } from "@/hooks/useTimeFilter";

interface AdminReportsRefactoredProps {
  exportData: (type: string, format: string) => void;
}

// Report type definitions
type ReportType =
  | "transaction"
  | "user"
  | "financial"
  | "commission"
  | "errorlog"
  | "custom";

interface ReportOption {
  value: ReportType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const AdminReportsRefactored: React.FC<AdminReportsRefactoredProps> = ({ exportData }) => {
  const { t } = useLanguage();
  const [selectedReport, setSelectedReport] = useState<ReportType>("transaction");

  // Use the new time filter hook instead of manual state management
  const timeFilter = useTimeFilter({
    mode: "epoch",
    defaultValue: "Today",
    onFilterChange: (state) => {
      console.log("Time filter changed:", state);
      // The query will automatically refetch due to dependency on epochRange
    },
  });

  // Report options configuration
  const reportOptions: ReportOption[] = [
    {
      value: "transaction",
      label: "Transaction Reports",
      icon: DollarSign,
      description: "Detailed transaction history and analytics",
    },
    {
      value: "user",
      label: "User Reports",
      icon: Users,
      description: "User registration and activity reports",
    },
    {
      value: "financial",
      label: "Financial Reports",
      icon: BarChart3,
      description: "Revenue, fees, and financial summaries",
    },
    {
      value: "commission",
      label: "Commission Reports",
      icon: Percent,
      description: "Commission tracking and payouts",
    },
    {
      value: "errorlog",
      label: "Error Reports",
      icon: AlertTriangle,
      description: "System errors and debugging information",
    },
    {
      value: "custom",
      label: "Custom Reports",
      icon: Settings,
      description: "Build custom reports with specific parameters",
    },
  ];

  // Query using the time filter's epoch range
  const { data: AdminReportsResponse, isLoading, error } = useQuery({
    queryKey: [
      "admin-reports",
      selectedReport,
      timeFilter.epochRange?.from_date,
      timeFilter.epochRange?.to_date,
    ],
    queryFn: () =>
      getAdminReports(selectedReport, {
        from_date: timeFilter.epochRange!.from_date,
        to_date: timeFilter.epochRange!.to_date,
      }),
    enabled: !!timeFilter.epochRange,
    gcTime: 60000,
    staleTime: 60000,
  });

  const [reportsData, setReportsData] = useState<any>({
    transaction: [],
    user: [],
    financial: [],
    commission: [],
    errorlog: [],
    custom: [],
  });

  useEffect(() => {
    if (AdminReportsResponse) {
      setReportsData((prevData) => ({
        ...prevData,
        [selectedReport]: (AdminReportsResponse as any)?.data || [],
      }));
    }
  }, [AdminReportsResponse, selectedReport]);

  const currentReportData = reportsData[selectedReport] || [];
  const selectedReportOption = reportOptions.find(option => option.value === selectedReport);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Admin Reports
          </CardTitle>
          <CardDescription>
            Generate and export comprehensive reports with customizable time ranges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Report Type Selection */}
            <div className="lg:col-span-2">
              <Label className="mb-1 block">Report Type</Label>
              <Select
                value={selectedReport}
                onValueChange={(value: ReportType) => setSelectedReport(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {option.description}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Time Filter - Using the new component */}
            <div className="flex-1">
              <TimeFilter
                mode="epoch"
                value={timeFilter.value}
                onChange={timeFilter.handleEpochChange}
                epochRange={timeFilter.epochRange}
                onEpochRangeChange={(range) => {
                  console.log("Epoch range updated:", range);
                }}
                showEpochDebug={true}
                label="Time Range"
                placeholder="Select time range"
                className="w-full"
              />
            </div>
          </div>

          {/* Export Actions */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportData(selectedReport, "csv")}
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportData(selectedReport, "pdf")}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Export PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportData(selectedReport, "excel")}
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export Excel
            </Button>
          </div>

          {/* Report Summary */}
          {selectedReportOption && (
            <div className="mb-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <selectedReportOption.icon className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">{selectedReportOption.label}</h3>
                <Badge variant="outline">
                  {currentReportData.length} records
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedReportOption.description}
              </p>
              <div className="mt-2 text-xs text-muted-foreground">
                <strong>Time Range:</strong> {timeFilter.value}
                {timeFilter.epochRange && (
                  <>
                    {" "}({new Date(timeFilter.epochRange.from_date * 1000).toLocaleDateString()} - {" "}
                    {new Date(timeFilter.epochRange.to_date * 1000).toLocaleDateString()})
                  </>
                )}
              </div>
            </div>
          )}

          {/* Report Data Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading reports...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-destructive">
                      Error loading reports: {(error as Error).message}
                    </TableCell>
                  </TableRow>
                ) : currentReportData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No data available for the selected time range
                    </TableCell>
                  </TableRow>
                ) : (
                  currentReportData.map((item: any, index: number) => (
                    <TableRow key={item.id || index}>
                      <TableCell className="font-mono text-sm">
                        {item.id || `#${index + 1}`}
                      </TableCell>
                      <TableCell>
                        {item.created_date 
                          ? epochToCustomLocalStringTime(item.created_date)
                          : item.date || "N/A"
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {item.type || selectedReport}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.amount ? `$${item.amount}` : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            item.status === "completed" ? "default" :
                            item.status === "pending" ? "secondary" :
                            item.status === "failed" ? "destructive" : "outline"
                          }
                        >
                          {item.status || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReportsRefactored;
