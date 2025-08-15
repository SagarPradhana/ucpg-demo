import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  DollarSign,
  QrCode,
  Percent,
  Wallet,
  Shield,
  User,
  Calendar,
  Filter,
  Search,
  Eye,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import CommonPagination from "@/components/ui/common-pagination";
import { usePagination } from "@/hooks/usePagination";
import {
  getAdminTransitionStatistics,
  getAdminUnclaimedFunds,
  getAuditLogs,
} from "@/service/adminservices";
import { getTodayDateRange } from "@/Common";
import { TimeFilter } from "@/components/ui/time-filter";
import { useTimeFilter } from "@/hooks/useTimeFilter";
import { getRelativeTimeOptions } from "@/utils/timeFilters";

interface Transaction {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: "sent" | "received" | "expired" | "cancelled";
  commission: number;
  netAmount: number;
  providerFee: number;
  qrStatus: "active" | "used" | "expired";
}

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "success" | "failed" | "warning";
}

interface AdminDashboardProps {
  dashboardStats: {
    todayPayments: { count: number; amount: number };
    last24Hours: {
      activePromoLinks: number;
      usedPromoCodes: number;
      claimedFunds: number;
      unclaimedFunds: number;
    };
    commissionIncome: { daily: number; weekly: number };
  };
  transactions: Transaction[];
  transactionChartData: Array<{ name: string; sent: number; received: number }>;
  currencyDistribution: Array<{ name: string; value: number; color: string }>;
  currencyData?: Array<{ name: string; value: number; color: string }>;
  getStatusBadge: (status: string) => string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  dashboardStats,
  transactions,
  transactionChartData,
  currencyDistribution,
  currencyData,
  getStatusBadge,
}) => {
  const { t } = useLanguage();

  // const { data: adminTransitionStatistics } = useQuery({
  //   queryKey: ["admin-transition-statistics"],
  //   queryFn: () => getAdminTransitionStatistics(),
  //   gcTime: 60000,
  //   staleTime: 60000,
  // });
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination hooks for both tables
  const transactionsPagination = usePagination({
    initialPage: 1,
    pageSize: 5, // Smaller page size for dashboard
  });

  const auditLogsPagination = usePagination({
    initialPage: 1,
    pageSize: 5, // Smaller page size for dashboard
  });
  const [userFilter, setUserFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");

  // Update pagination when data changes
  React.useEffect(() => {
    transactionsPagination.setTotalItems(transactions.length);
  }, [transactions.length, transactionsPagination]);

  // Helper functions for paginated data
  const getPaginatedTransactions = () => {
    const startIndex =
      (transactionsPagination.currentPage - 1) *
      transactionsPagination.pageSize;
    const endIndex = startIndex + transactionsPagination.pageSize;
    return transactions.slice(startIndex, endIndex);
  };

  const getPaginatedAuditLogs = () => {
    const startIndex =
      (auditLogsPagination.currentPage - 1) * auditLogsPagination.pageSize;
    const endIndex = startIndex + auditLogsPagination.pageSize;
    return filteredAuditLogs.slice(startIndex, endIndex);
  };

  // Use the new time filter hook for audit logs
  const auditLogTimeFilter = useTimeFilter({
    mode: "relative",
    defaultValue: "24h",
    onFilterChange: (state) => {
      console.log("Audit log time filter changed:", state);
    },
  });
  const { data: unclaimedFundsResponse } = useQuery({
    queryKey: ["admin-unclaimed-funds"],
    queryFn: () => getAdminUnclaimedFunds(getTodayDateRange()),
    gcTime: 60000,
    staleTime: 60000,
  });
  const { data: auditLogsResponse } = useQuery({
    queryKey: ["admin-auditLog"],
    queryFn: () => getAuditLogs(getTodayDateRange()),
    gcTime: 60000,
    staleTime: 60000,
  });
  console.log(unclaimedFundsResponse);

  console.log(auditLogsResponse);
  // Audit log state

  // Sample audit log data
  const auditLogs: AuditLog[] = [
    {
      id: "AL001",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      user: "admin@example.com",
      action: "User Login",
      resource: "Authentication System",
      details: "Successful admin login",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      severity: "low",
      status: "success",
    },
    {
      id: "AL002",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      user: "john.doe@example.com",
      action: "Transaction Created",
      resource: "Transaction #TXN123456",
      details: "Created new transaction for $500 BTC",
      ipAddress: "192.168.1.101",
      userAgent: "Mozilla/5.0 (macOS; Intel Mac OS X 10_15_7)",
      severity: "medium",
      status: "success",
    },
    {
      id: "AL003",
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      user: "jane.smith@example.com",
      action: "Failed Login Attempt",
      resource: "Authentication System",
      details: "Invalid password attempt",
      ipAddress: "192.168.1.102",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1)",
      severity: "high",
      status: "failed",
    },
    {
      id: "AL004",
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      user: "admin@example.com",
      action: "Settings Updated",
      resource: "System Configuration",
      details: "Updated commission rates",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      severity: "medium",
      status: "success",
    },
    {
      id: "AL005",
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      user: "support@example.com",
      action: "User Account Suspended",
      resource: "User #USR789",
      details: "Suspended user account due to suspicious activity",
      ipAddress: "192.168.1.103",
      userAgent: "Mozilla/5.0 (Linux; Android 11)",
      severity: "critical",
      status: "success",
    },
    {
      id: "AL006",
      timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
      user: "operator@example.com",
      action: "Provider Configuration",
      resource: "Payment Provider #PP001",
      details: "Updated provider API settings",
      ipAddress: "192.168.1.104",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      severity: "medium",
      status: "success",
    },
  ];

  // Get unique values for filters
  const uniqueUsers = useMemo(() => {
    return Array.from(new Set(auditLogs.map((log) => log.user)));
  }, [auditLogs]);

  const uniqueActions = useMemo(() => {
    return Array.from(new Set(auditLogs.map((log) => log.action)));
  }, [auditLogs]);

  // Filter audit logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase());

      // User filter
      const matchesUser = userFilter === "all" || log.user === userFilter;

      // Action filter
      const matchesAction =
        actionFilter === "all" || log.action === actionFilter;

      // Time filter using the new hook
      const logTime = new Date(log.timestamp).getTime();
      const logTimestamp = Math.floor(logTime / 1000); // Convert to seconds
      const matchesTime = auditLogTimeFilter.filterByTimestamp(logTimestamp);

      return matchesSearch && matchesUser && matchesAction && matchesTime;
    });
  }, [
    auditLogs,
    searchTerm,
    userFilter,
    actionFilter,
    auditLogTimeFilter.value,
  ]);

  // Update audit logs pagination when filtered data changes
  React.useEffect(() => {
    auditLogsPagination.setTotalItems(filteredAuditLogs.length);
  }, [filteredAuditLogs.length, auditLogsPagination]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setUserFilter("all");
    setActionFilter("all");
    auditLogTimeFilter.handleRelativeChange("24h");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Responsive Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="transition-all duration-300 hover:shadow-md overflow-hidden border-l-4 border-l-blue-500">
          <CardContent className="p-4 sm:p-6 bg-gradient-to-br from-blue-50/30 to-transparent">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate mb-1">
                  {t("admin.dashboard.todayPayments")}
                </p>
                <p className="text-xl sm:text-2xl font-bold truncate text-blue-700">
                  {dashboardStats.todayPayments.count}
                </p>
                <p className="text-xs font-medium text-blue-600/80 truncate mt-1">
                  ${dashboardStats.todayPayments.amount.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-md overflow-hidden border-l-4 border-l-green-500">
          <CardContent className="p-4 sm:p-6 bg-gradient-to-br from-green-50/30 to-transparent">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate mb-1">
                  {t("admin.dashboard.activePromoLinks")}
                </p>
                <p className="text-xl sm:text-2xl font-bold truncate text-green-700">
                  {dashboardStats.last24Hours.activePromoLinks}
                </p>
                <p className="text-xs font-medium text-green-600 truncate mt-1 flex items-center">
                  <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M7 14l5-5 5 5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  +12% from yesterday
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <QrCode className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-md overflow-hidden border-l-4 border-l-purple-500">
          <CardContent className="p-4 sm:p-6 bg-gradient-to-br from-purple-50/30 to-transparent">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate mb-1">
                  {t("admin.dashboard.commissionIncome")} (
                  {t("admin.dashboard.daily")})
                </p>
                <p className="text-xl sm:text-2xl font-bold truncate text-purple-700">
                  ${dashboardStats.commissionIncome.daily.toLocaleString()}
                </p>
                <p className="text-xs font-medium text-purple-600 truncate mt-1 flex items-center">
                  <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M7 14l5-5 5 5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  +8.2% from yesterday
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Percent className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-md overflow-hidden border-l-4 border-l-blue-500">
          <CardContent className="p-4 sm:p-6 bg-gradient-to-br from-blue-50/30 to-transparent">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate mb-1">
                  Funds Overview
                </p>
                <div className="flex justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-green-700">
                      Claimed:
                    </p>
                    <p className="text-xl font-bold text-green-700">
                      $
                      {(
                        ((unclaimedFundsResponse as any)?.data?.claimed
                          ?.amount as number) ?? 0
                      ).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-orange-700">
                      Unclaimed:
                    </p>
                    <p className="text-xl font-bold text-orange-700">
                      $
                      {(
                        ((unclaimedFundsResponse as any)?.data?.unclaimed
                          ?.amount as number) ?? 0
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs font-medium text-green-600 truncate mt-1 flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M5 13l4 4L19 7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Successfully claimed
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-orange-600 truncate mt-1 flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Requires attention
                    </p>
                  </div>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Responsive Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <Card className="transition-all duration-200 hover:shadow-md overflow-hidden">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base sm:text-lg flex items-center">
              <BarChart className="mr-2 h-5 w-5 text-primary" />
              {t("admin.dashboard.transactionVolume")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 sm:h-80 w-full bg-card/50 rounded-lg p-4 shadow-sm border border-border/50">
              {transactionChartData && transactionChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={transactionChartData}
                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                    barSize={20}
                    barGap={8}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      fontSize={12}
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: "#e0e0e0" }}
                      tickLine={false}
                    />
                    <YAxis
                      fontSize={12}
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: "#e0e0e0" }}
                      tickLine={false}
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <Tooltip
                      formatter={(value) => [value.toLocaleString(), ""]}
                      contentStyle={{
                        borderRadius: "8px",
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        boxShadow:
                          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                        border: "none",
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      iconType="circle"
                      iconSize={10}
                      wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                    />
                    <Bar
                      dataKey="sent"
                      name="Sent"
                      fill="#8884d8"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="received"
                      name="Received"
                      fill="#82ca9d"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center bg-muted/20 rounded-lg border border-dashed border-muted">
                  <BarChart className="w-12 h-12 text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground font-medium">
                    No Data Available
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Transaction volume data will appear here
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md overflow-hidden">
          <CardHeader className="pb-3 border-b bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="text-base sm:text-lg flex items-center">
              <Wallet className="mr-2 h-5 w-5 text-primary animate-pulse" />
              {t("admin.dashboard.currencyDistribution")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Crypto Currency Distribution */}
              <div className="bg-gradient-to-br from-card/80 to-card/50 rounded-xl p-5 shadow-md border border-border/50 hover:shadow-lg transition-all duration-300">
                <h3 className="text-sm font-medium mb-4 text-center flex items-center justify-center bg-primary/10 py-2 rounded-lg">
                  <svg
                    className="w-4 h-4 mr-2 text-primary"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 8h6m-6 4h6m-6 4h6M7 3v18m10-18v18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="font-semibold">Crypto Distribution</span>
                </h3>
                <div className="h-64 w-full">
                  {currencyDistribution && currencyDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={currencyDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius="70%"
                          innerRadius="45%"
                          fill="#8884d8"
                          dataKey="value"
                          paddingAngle={3}
                          cornerRadius={6}
                          animationBegin={0}
                          animationDuration={1500}
                          animationEasing="ease-out"
                        >
                          {currencyDistribution.map((entry, index) => (
                            <Cell
                              key={`crypto-cell-${index}`}
                              fill={entry.color}
                              stroke="#fff"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [`${value}%`, name]}
                          contentStyle={{
                            borderRadius: "8px",
                            backgroundColor: "rgba(255, 255, 255, 0.98)",
                            boxShadow:
                              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                            border: "none",
                            padding: "8px 12px",
                            fontSize: "13px",
                          }}
                        />
                        <Legend
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                          iconSize={12}
                          iconType="circle"
                          wrapperStyle={{
                            fontSize: "12px",
                            paddingTop: "15px",
                            fontWeight: 500,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center bg-muted/20 rounded-lg border border-dashed border-muted">
                      <svg
                        className="w-12 h-12 text-muted-foreground/50 mb-2"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9 8h6m-6 4h6m-6 4h6M7 3v18m10-18v18"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      <p className="text-muted-foreground font-medium">
                        No Data Available
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        Crypto distribution data will appear here
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Fiat Currency Distribution */}
              <div className="bg-gradient-to-br from-card/80 to-card/50 rounded-xl p-5 shadow-md border border-border/50 hover:shadow-lg transition-all duration-300">
                <h3 className="text-sm font-medium mb-4 text-center flex items-center justify-center bg-primary/10 py-2 rounded-lg">
                  <DollarSign className="w-4 h-4 mr-2 text-primary" />
                  <span className="font-semibold">
                    Fiat Currency Distribution
                  </span>
                </h3>
                <div className="h-64 w-full">
                  {currencyData && currencyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={currencyData}
                          cx="50%"
                          cy="50%"
                          outerRadius="70%"
                          innerRadius="45%"
                          fill="#8884d8"
                          dataKey="value"
                          paddingAngle={3}
                          cornerRadius={6}
                          animationBegin={0}
                          animationDuration={1500}
                          animationEasing="ease-out"
                        >
                          {currencyData.map((entry, index) => (
                            <Cell
                              key={`fiat-cell-${index}`}
                              fill={entry.color}
                              stroke="#fff"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [`${value}%`, name]}
                          contentStyle={{
                            borderRadius: "8px",
                            backgroundColor: "rgba(255, 255, 255, 0.98)",
                            boxShadow:
                              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                            border: "none",
                            padding: "8px 12px",
                            fontSize: "13px",
                          }}
                        />
                        <Legend
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                          iconSize={12}
                          iconType="circle"
                          wrapperStyle={{
                            fontSize: "12px",
                            paddingTop: "15px",
                            fontWeight: 500,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center bg-muted/20 rounded-lg border border-dashed border-muted">
                      <DollarSign className="w-12 h-12 text-muted-foreground/50 mb-2" />
                      <p className="text-muted-foreground font-medium">
                        No Data Available
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        Fiat currency distribution data will appear here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Responsive Recent Transactions */}
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">
            {t("admin.transactions.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">
                      {t("admin.transactions.transactionId")}
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      {t("admin.transactions.date")}
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      {t("admin.transactions.amount")}
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      {t("admin.transactions.status")}
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      {t("admin.transactions.commission")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getPaginatedTransactions().map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {tx.id}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {tx.amount} {tx.currency}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(tx.status) as any}>
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        ${tx.commission.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Transactions Pagination */}
          {transactions.length > 0 && (
            <CommonPagination
              currentPage={transactionsPagination.currentPage}
              totalPages={transactionsPagination.totalPages}
              totalItems={transactions.length}
              pageSize={transactionsPagination.pageSize}
              onPageChange={transactionsPagination.setCurrentPage}
            />
          )}
        </CardContent>
      </Card>

      {/* Responsive Audit Log Section */}
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary flex-shrink-0" />
              <CardTitle className="text-base sm:text-lg">
                {t("admin.dashboard.auditLog")}
              </CardTitle>
            </div>
            <Badge variant="outline" className="text-xs w-fit">
              {filteredAuditLogs.length} {t("admin.dashboard.entries")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Responsive Filters */}
          <div className="mb-4 sm:mb-6 p-4 bg-muted/30 rounded-lg shadow-sm">
            {/* Filters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Search className="h-4 w-4 text-primary" />
                  {t("admin.dashboard.search")}
                </Label>
                <Input
                  placeholder={t("admin.dashboard.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-9 text-sm"
                />
              </div>

              {/* User Filter */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <User className="h-4 w-4 text-primary" />
                  {t("admin.dashboard.user")}
                </Label>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder={t("admin.dashboard.allUsers")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("admin.dashboard.allUsers")}
                    </SelectItem>
                    {uniqueUsers.map((user) => (
                      <SelectItem key={user} value={user}>
                        {user}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Filter */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Filter className="h-4 w-4 text-primary" />
                  {t("admin.dashboard.action")}
                </Label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue
                      placeholder={t("admin.dashboard.allActions")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("admin.dashboard.allActions")}
                    </SelectItem>
                    {uniqueActions.map((action) => (
                      <SelectItem key={action} value={action}>
                        {action}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time Filter */}
              <div className="space-y-1.5">
                <TimeFilter
                  mode="relative"
                  value={auditLogTimeFilter.value}
                  onChange={auditLogTimeFilter.handleRelativeChange}
                  relativeOptions={getRelativeTimeOptions("short")}
                  label={t("admin.dashboard.timeRange")}
                  placeholder={t("admin.dashboard.last24Hours")}
                  variant="compact"
                  showIcon={true}
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-xs hover:bg-muted"
              >
                {t("admin.dashboard.clearFilters")}
              </Button>
            </div>
          </div>

          {/* Responsive Audit Log Table */}
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">
                      {t("admin.dashboard.timestamp")}
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      {t("admin.dashboard.user")}
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      {t("admin.dashboard.action")}
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      {t("admin.dashboard.resource")}
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      {t("admin.dashboard.status")}
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      {t("admin.dashboard.severity")}
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      {t("admin.dashboard.ipAddress")}
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      {t("admin.dashboard.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getPaginatedAuditLogs().map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap">
                        {log.user}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {log.action}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {log.resource}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            log.status === "success"
                              ? "default"
                              : log.status === "failed"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            log.severity === "critical"
                              ? "destructive"
                              : log.severity === "high"
                              ? "destructive"
                              : log.severity === "medium"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {log.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs whitespace-nowrap">
                        {log.ipAddress}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Audit Logs Pagination */}
          {filteredAuditLogs.length > 0 && (
            <CommonPagination
              currentPage={auditLogsPagination.currentPage}
              totalPages={auditLogsPagination.totalPages}
              totalItems={filteredAuditLogs.length}
              pageSize={auditLogsPagination.pageSize}
              onPageChange={auditLogsPagination.setCurrentPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
