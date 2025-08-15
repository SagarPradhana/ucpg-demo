import React, { useState, useMemo, useEffect } from "react";
import { epochRangeForLabel } from "@/utils/timeFilters";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAdminReports } from "@/service/adminservices";
import { epochToCustomLocalStringTime } from "@/Common";
import { NoData, NoDataPresets } from "@/components/ui/no-data";

interface AdminReportsProps {
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

const AdminReports: React.FC<AdminReportsProps> = ({ exportData }) => {
  const { t } = useLanguage();
  const [selectedReport, setSelectedReport] =
    useState<ReportType>("transaction");

  // Custom time filter state
  const [timeLabel, setTimeLabel] = useState<string>("Today");
  const [epochRange, setEpochRange] = useState(() =>
    epochRangeForLabel("Today")
  );

  // Custom date range state
  const [showCustomDates, setShowCustomDates] = useState(false);
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");

  // Report options
  const reportOptions: ReportOption[] = [
    {
      value: "transaction",
      label: t("admin.reports.transactionReport"),
      icon: BarChart3,
      description: t("admin.reports.transactionReportDesc"),
    },
    {
      value: "user",
      label: t("admin.reports.userReport"),
      icon: Users,
      description: t("admin.reports.userReportDesc"),
    },
    {
      value: "financial",
      label: t("admin.reports.financialReport"),
      icon: DollarSign,
      description: t("admin.reports.financialReportDesc"),
    },
    {
      value: "commission",
      label: t("admin.reports.commissionReport"),
      icon: Percent,
      description: t("admin.reports.commissionReportDesc"),
    },
    {
      value: "errorlog",
      label: t("admin.reports.errorLogReport"),
      icon: AlertTriangle,
      description: t("admin.reports.errorLogReportDesc"),
    },
  ];

  const {
    data: AdminReportsResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "admin-reports",
      selectedReport,
      epochRange.from_date,
      epochRange.to_date,
    ],
    queryFn: () =>
      getAdminReports(selectedReport, {
        from_date: epochRange.from_date,
        to_date: epochRange.to_date,
      }),
    gcTime: 60000,
    staleTime: 60000,
  });

  console.log(AdminReportsResponse);

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
                <span>{t("admin.reports.title")}</span>
              </CardTitle>
              <CardDescription>{t("admin.reports.subtitle")}</CardDescription>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload("pdf")}
                className="flex items-center space-x-1 sm:space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">PDF</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload("xlsx")}
                className="flex items-center space-x-1 sm:space-x-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span className="hidden sm:inline">XLSX</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Report Type Selector */}
          <div className="mb-6 space-y-6">
            {/* Report Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Report Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Report Type</Label>
                <Select
                  value={selectedReport}
                  onValueChange={(value: ReportType) =>
                    setSelectedReport(value)
                  }
                >
                  <SelectTrigger className="w-full border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportOptions?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <option.icon className="h-4 w-4 text-primary" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time Range */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Time Range</Label>
                <Select
                  value={timeLabel}
                  onValueChange={(label: string) => {
                    setTimeLabel(label);
                    if (label === "Custom") {
                      setShowCustomDates(true);
                    } else {
                      setShowCustomDates(false);
                      setEpochRange(epochRangeForLabel(label));
                    }
                  }}
                >
                  <SelectTrigger className="w-full border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition">
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Today",
                      "Yesterday",
                      "Last 7 Days",
                      "Last 30 Days",
                      "This Week",
                      "Last Week",
                      "This Month",
                      "Last Month",
                      "Custom",
                    ].map((label) => (
                      <SelectItem key={label} value={label}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Custom Dates */}
                {showCustomDates && (
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">From Date</Label>
                      <Input
                        type="date"
                        value={customDateFrom}
                        onChange={(e) => {
                          setCustomDateFrom(e.target.value);
                          if (e.target.value && customDateTo) {
                            const fromEpoch = Math.floor(
                              new Date(e.target.value).getTime() / 1000
                            );
                            const toEpoch =
                              Math.floor(
                                new Date(customDateTo).getTime() / 1000
                              ) + 86399;
                            setEpochRange({
                              from_date: fromEpoch,
                              to_date: toEpoch,
                            });
                          }
                        }}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">To Date</Label>
                      <Input
                        type="date"
                        value={customDateTo}
                        onChange={(e) => {
                          setCustomDateTo(e.target.value);
                          if (customDateFrom && e.target.value) {
                            const fromEpoch = Math.floor(
                              new Date(customDateFrom).getTime() / 1000
                            );
                            const toEpoch =
                              Math.floor(
                                new Date(e.target.value).getTime() / 1000
                              ) + 86399;
                            setEpochRange({
                              from_date: fromEpoch,
                              to_date: toEpoch,
                            });
                          }
                        }}
                        className="text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Report Description */}
            {currentReportOption && (
              <div className="p-4 bg-muted/30 rounded-lg flex items-start space-x-3">
                <currentReportOption.icon className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">{currentReportOption.label}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentReportOption.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Report Table */}
          <div className="border rounded-lg overflow-x-auto">
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">
                  Loading reports...
                </span>
              </div>
            )}

            {/* Error State */}
            {isError && (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
                <span className="text-destructive font-medium">
                  Failed to load reports
                </span>
                <span className="text-sm text-muted-foreground mt-1">
                  {error?.message || "An error occurred while fetching data"}
                </span>
              </div>
            )}

            {/* Report Content */}
            {!isLoading && !isError && selectedReport === "transaction" && (
              <>
                {(reportsData?.transaction ?? []).length === 0 ? (
                  <NoData
                    {...NoDataPresets.transactions}
                    variant="detailed"
                    size="md"
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("admin.reports.user")}</TableHead>
                        <TableHead>{t("admin.transactions.date")}</TableHead>
                        <TableHead>{t("admin.transactions.amount")}</TableHead>
                        <TableHead>
                          {t("admin.transactions.currency")}
                        </TableHead>
                        <TableHead>{t("admin.transactions.status")}</TableHead>
                        <TableHead>
                          {t("admin.transactions.commission")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(reportsData?.transaction ?? [])?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {item?.user}
                          </TableCell>
                          <TableCell>
                            {epochToCustomLocalStringTime(item.date)}
                          </TableCell>
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
                          <TableCell>{item.commission}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </>
            )}

            {!isLoading && !isError && selectedReport === "user" && (
              <>
                {(reportsData?.user ?? []).length === 0 ? (
                  <NoData
                    {...NoDataPresets.users}
                    variant="detailed"
                    size="md"
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("admin.userRoles.name")}</TableHead>
                        <TableHead>{t("admin.userRoles.email")}</TableHead>
                        <TableHead>
                          {t("admin.reports.registrationDate")}
                        </TableHead>
                        <TableHead>{t("admin.transactions.status")}</TableHead>
                        <TableHead>
                          {t("admin.reports.totalTransactions")}
                        </TableHead>
                        <TableHead>{t("admin.reports.totalVolume")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportsData?.user?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.email}</TableCell>
                          <TableCell>
                            {epochToCustomLocalStringTime(
                              item.registration_date
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                item.status === "Active"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.total_transactions}</TableCell>
                          <TableCell>{item.total_volume}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </>
            )}

            {!isLoading && !isError && selectedReport === "financial" && (
              <>
                {(reportsData?.financial ?? []).length === 0 ? (
                  <NoData
                    title="No financial data available"
                    description="No financial reports found for the selected time range. Try adjusting your time filter."
                    icon="database"
                    variant="detailed"
                    size="md"
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("admin.reports.period")}</TableHead>
                        <TableHead>{t("admin.reports.revenue")}</TableHead>
                        <TableHead>{t("admin.reports.expenses")}</TableHead>
                        <TableHead>{t("admin.reports.profit")}</TableHead>
                        <TableHead>
                          {t("admin.reports.commissionEarned")}
                        </TableHead>
                        <TableHead>
                          {t("admin.reports.transactionCount")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportsData?.financial?.map((item, index) => (
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
              </>
            )}

            {!isLoading && !isError && selectedReport === "commission" && (
              <>
                {(reportsData?.commission ?? []).length === 0 ? (
                  <NoData
                    title="No commission data available"
                    description="No commission reports found for the selected time range."
                    icon="database"
                    variant="detailed"
                    size="md"
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          {t("admin.reports.totalTransactions")}
                        </TableHead>
                        <TableHead>{t("admin.reports.totalVolume")}</TableHead>
                        <TableHead>
                          {t("admin.reports.commissionRate")}
                        </TableHead>
                        <TableHead>
                          {t("admin.reports.commissionEarned")}
                        </TableHead>
                        <TableHead>{t("admin.transactions.status")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportsData?.commission?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.total_transactions}</TableCell>
                          <TableCell>{item.total_volume}</TableCell>
                          <TableCell>{item.commission_rate}</TableCell>
                          <TableCell className="text-green-600">
                            {item.commission_earned}
                          </TableCell>
                          <TableCell>
                            <Badge variant="default">{item.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </>
            )}

            {!isLoading && !isError && selectedReport === "errorlog" && (
              <>
                {(reportsData?.errorlog ?? []).length === 0 ? (
                  <NoData
                    {...NoDataPresets.errors}
                    variant="detailed"
                    size="md"
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("admin.errorLogs.timestamp")}</TableHead>
                        <TableHead>{t("admin.errorLogs.errorCode")}</TableHead>
                        <TableHead>{t("admin.errorLogs.severity")}</TableHead>
                        <TableHead>{t("admin.errorLogs.message")}</TableHead>
                        <TableHead>
                          {t("admin.reports.affectedUsers")}
                        </TableHead>
                        <TableHead>{t("admin.reports.resolved")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportsData?.errorlog?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-xs">
                            {epochToCustomLocalStringTime(item.timestamp)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.error_code}
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
                          <TableCell>{item.affected_users}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                item.resolved === "Yes"
                                  ? "default"
                                  : "destructive"
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
              </>
            )}
          </div>

          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground">
                {t("admin.reports.totalRecords")}
              </div>
              <div className="text-2xl font-bold">
                {selectedReport === "transaction"
                  ? reportsData?.transaction?.length
                  : selectedReport === "user"
                  ? reportsData?.user?.length
                  : selectedReport === "financial"
                  ? reportsData?.financial?.length
                  : selectedReport === "commission"
                  ? reportsData?.commission?.length
                  : selectedReport === "errorlog"
                  ? reportsData?.errorlog?.length
                  : reportsData.custom.length}
              </div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground">
                {t("admin.reports.reportType")}
              </div>
              <div className="text-lg font-semibold">
                {currentReportOption?.label}
              </div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground">
                {t("admin.reports.generated")}
              </div>
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
