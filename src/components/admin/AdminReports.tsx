import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Download,
  FileText,
  FileSpreadsheet,
  BarChart3,
  Users,
  DollarSign,
  Percent,
  AlertTriangle,
  Settings,
} from "lucide-react";

interface AdminReportsProps {
  exportData: (type: string, format: string) => void;
}

// Report type definitions
type ReportType =
  | "transaction"
  | "user"
  | "financial"
  | "commission"
  | "error-log"
  | "custom";

interface ReportOption {
  value: ReportType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const AdminReports: React.FC<AdminReportsProps> = ({ exportData }) => {
  const [selectedReport, setSelectedReport] =
    useState<ReportType>("transaction");

  // Report options
  const reportOptions: ReportOption[] = [
    {
      value: "transaction",
      label: "Transaction Report",
      icon: BarChart3,
      description: "Detailed transaction history and analytics",
    },
    {
      value: "user",
      label: "User Reports",
      icon: Users,
      description: "User activity and registration statistics",
    },
    {
      value: "financial",
      label: "Financial Reports",
      icon: DollarSign,
      description: "Revenue, profits, and financial summaries",
    },
    {
      value: "commission",
      label: "Commission Report",
      icon: Percent,
      description: "Commission earnings and fee breakdowns",
    },
    {
      value: "error-log",
      label: "Error Log Report",
      icon: AlertTriangle,
      description: "System errors and technical issues",
    },
    {
      value: "custom",
      label: "Custom Reports",
      icon: Settings,
      description: "Customizable reports with flexible parameters",
    },
  ];

  // Sample data for different report types
  const sampleData = {
    transaction: [
      {
        id: "TXN001",
        date: "2024-01-15",
        amount: "$1,250.00",
        currency: "BTC",
        status: "Completed",
        user: "john.doe@example.com",
        commission: "$25.00",
      },
      {
        id: "TXN002",
        date: "2024-01-15",
        amount: "$850.00",
        currency: "ETH",
        status: "Pending",
        user: "jane.smith@example.com",
        commission: "$17.00",
      },
      {
        id: "TXN003",
        date: "2024-01-14",
        amount: "$2,100.00",
        currency: "USDT",
        status: "Completed",
        user: "mike.wilson@example.com",
        commission: "$42.00",
      },
    ],
    user: [
      {
        id: "USR001",
        name: "John Doe",
        email: "john.doe@example.com",
        registrationDate: "2024-01-10",
        status: "Active",
        totalTransactions: 15,
        totalVolume: "$12,500.00",
      },
      {
        id: "USR002",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        registrationDate: "2024-01-12",
        status: "Active",
        totalTransactions: 8,
        totalVolume: "$6,800.00",
      },
      {
        id: "USR003",
        name: "Mike Wilson",
        email: "mike.wilson@example.com",
        registrationDate: "2024-01-08",
        status: "Suspended",
        totalTransactions: 22,
        totalVolume: "$18,900.00",
      },
    ],
    financial: [
      {
        period: "January 2024",
        revenue: "$45,600.00",
        expenses: "$12,300.00",
        profit: "$33,300.00",
        commissionEarned: "$2,280.00",
        transactionCount: 156,
      },
      {
        period: "December 2023",
        revenue: "$52,100.00",
        expenses: "$14,800.00",
        profit: "$37,300.00",
        commissionEarned: "$2,605.00",
        transactionCount: 189,
      },
      {
        period: "November 2023",
        revenue: "$48,900.00",
        expenses: "$13,200.00",
        profit: "$35,700.00",
        commissionEarned: "$2,445.00",
        transactionCount: 167,
      },
    ],
    commission: [
      {
        provider: "Binance",
        totalTransactions: 45,
        totalVolume: "$125,600.00",
        commissionRate: "2.5%",
        commissionEarned: "$3,140.00",
        status: "Active",
      },
      {
        provider: "Coinbase",
        totalTransactions: 32,
        totalVolume: "$89,200.00",
        commissionRate: "2.0%",
        commissionEarned: "$1,784.00",
        status: "Active",
      },
      {
        provider: "Kraken",
        totalTransactions: 28,
        totalVolume: "$76,800.00",
        commissionRate: "1.8%",
        commissionEarned: "$1,382.40",
        status: "Active",
      },
    ],
    "error-log": [
      {
        timestamp: "2024-01-15 14:30:25",
        errorCode: "ERR_001",
        severity: "High",
        message: "Database connection timeout",
        affectedUsers: 12,
        resolved: "Yes",
      },
      {
        timestamp: "2024-01-15 12:15:10",
        errorCode: "ERR_002",
        severity: "Medium",
        message: "API rate limit exceeded",
        affectedUsers: 5,
        resolved: "Yes",
      },
      {
        timestamp: "2024-01-15 09:45:33",
        errorCode: "ERR_003",
        severity: "Low",
        message: "Cache invalidation warning",
        affectedUsers: 0,
        resolved: "Yes",
      },
    ],
    custom: [
      {
        metric: "Daily Active Users",
        value: "1,245",
        change: "+12.5%",
        period: "Last 30 days",
      },
      {
        metric: "Average Transaction Size",
        value: "$1,850.00",
        change: "+8.2%",
        period: "Last 30 days",
      },
      {
        metric: "System Uptime",
        value: "99.8%",
        change: "+0.1%",
        period: "Last 30 days",
      },
    ],
  };

  // Get current report option
  const currentReportOption = reportOptions.find(
    (option) => option.value === selectedReport
  );

  // Handle download
  const handleDownload = (format: "pdf" | "xlsx") => {
    exportData(selectedReport, format);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Reports & Analytics</span>
              </CardTitle>
              <CardDescription>
                Generate and export comprehensive reports
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload("pdf")}
                className="flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>PDF</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload("xlsx")}
                className="flex items-center space-x-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>XLSX</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Report Type Selector */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex-1">
                <Select
                  value={selectedReport}
                  onValueChange={(value: ReportType) =>
                    setSelectedReport(value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <option.icon className="h-4 w-4" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Report Description */}
            {currentReportOption && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <currentReportOption.icon className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    {currentReportOption.label}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentReportOption.description}
                </p>
              </div>
            )}
          </div>

          {/* Report Table */}
          <div className="border rounded-lg">
            {selectedReport === "transaction" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Commission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleData.transaction.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.amount}</TableCell>
                      <TableCell>{item.currency}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === "Completed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.user}</TableCell>
                      <TableCell>{item.commission}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {selectedReport === "user" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Transactions</TableHead>
                    <TableHead>Total Volume</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleData.user.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.email}</TableCell>
                      <TableCell>{item.registrationDate}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === "Active" ? "default" : "destructive"
                          }
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.totalTransactions}</TableCell>
                      <TableCell>{item.totalVolume}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {selectedReport === "financial" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Expenses</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>Commission Earned</TableHead>
                    <TableHead>Transaction Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleData.financial.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {item.period}
                      </TableCell>
                      <TableCell className="text-green-600">
                        {item.revenue}
                      </TableCell>
                      <TableCell className="text-red-600">
                        {item.expenses}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {item.profit}
                      </TableCell>
                      <TableCell>{item.commissionEarned}</TableCell>
                      <TableCell>{item.transactionCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {selectedReport === "commission" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead>Total Transactions</TableHead>
                    <TableHead>Total Volume</TableHead>
                    <TableHead>Commission Rate</TableHead>
                    <TableHead>Commission Earned</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleData.commission.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {item.provider}
                      </TableCell>
                      <TableCell>{item.totalTransactions}</TableCell>
                      <TableCell>{item.totalVolume}</TableCell>
                      <TableCell>{item.commissionRate}</TableCell>
                      <TableCell className="text-green-600">
                        {item.commissionEarned}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{item.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {selectedReport === "error-log" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Error Code</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Affected Users</TableHead>
                    <TableHead>Resolved</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleData["error-log"].map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-xs">
                        {item.timestamp}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.errorCode}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.severity === "High"
                              ? "destructive"
                              : item.severity === "Medium"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {item.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {item.message}
                      </TableCell>
                      <TableCell>{item.affectedUsers}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.resolved === "Yes" ? "default" : "destructive"
                          }
                        >
                          {item.resolved}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {selectedReport === "custom" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Period</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleData.custom.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {item.metric}
                      </TableCell>
                      <TableCell className="text-lg font-semibold">
                        {item.value}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.change.startsWith("+")
                              ? "default"
                              : "destructive"
                          }
                        >
                          {item.change}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.period}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground">Total Records</div>
              <div className="text-2xl font-bold">
                {selectedReport === "transaction"
                  ? sampleData.transaction.length
                  : selectedReport === "user"
                  ? sampleData.user.length
                  : selectedReport === "financial"
                  ? sampleData.financial.length
                  : selectedReport === "commission"
                  ? sampleData.commission.length
                  : selectedReport === "error-log"
                  ? sampleData["error-log"].length
                  : sampleData.custom.length}
              </div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground">Report Type</div>
              <div className="text-lg font-semibold">
                {currentReportOption?.label}
              </div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground">Generated</div>
              <div className="text-lg font-semibold">
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReports;
