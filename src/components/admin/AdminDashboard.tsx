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
  getStatusBadge: (status: string) => string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  dashboardStats,
  transactions,
  transactionChartData,
  currencyDistribution,
  getStatusBadge,
}) => {
  const { t } = useLanguage();

  // Audit log state
  const [searchTerm, setSearchTerm] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("24h");

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

      // Time filter
      const logTime = new Date(log.timestamp).getTime();
      const now = Date.now();
      let matchesTime = true;

      switch (timeFilter) {
        case "1h":
          matchesTime = now - logTime <= 60 * 60 * 1000;
          break;
        case "24h":
          matchesTime = now - logTime <= 24 * 60 * 60 * 1000;
          break;
        case "7d":
          matchesTime = now - logTime <= 7 * 24 * 60 * 60 * 1000;
          break;
        case "30d":
          matchesTime = now - logTime <= 30 * 24 * 60 * 60 * 1000;
          break;
        case "all":
          matchesTime = true;
          break;
      }

      return matchesSearch && matchesUser && matchesAction && matchesTime;
    });
  }, [auditLogs, searchTerm, userFilter, actionFilter, timeFilter]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setUserFilter("all");
    setActionFilter("all");
    setTimeFilter("24h");
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("admin.dashboard.todayPayments")}
                </p>
                <p className="text-2xl font-bold">
                  {dashboardStats.todayPayments.count}
                </p>
                <p className="text-xs text-muted-foreground">
                  ${dashboardStats.todayPayments.amount.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("admin.dashboard.activePromoLinks")}
                </p>
                <p className="text-2xl font-bold">
                  {dashboardStats.last24Hours.activePromoLinks}
                </p>
                <p className="text-xs text-green-600">+12% from yesterday</p>
              </div>
              <QrCode className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("admin.dashboard.commissionIncome")} (
                  {t("admin.dashboard.daily")})
                </p>
                <p className="text-2xl font-bold">
                  ${dashboardStats.commissionIncome.daily.toLocaleString()}
                </p>
                <p className="text-xs text-green-600">+8.2% from yesterday</p>
              </div>
              <Percent className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Unclaimed Funds
                </p>
                <p className="text-2xl font-bold">
                  ${dashboardStats.last24Hours.unclaimedFunds.toLocaleString()}
                </p>
                <p className="text-xs text-orange-600">Requires attention</p>
              </div>
              <Wallet className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.dashboard.transactionVolume")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={transactionChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sent" fill="#8884d8" />
                <Bar dataKey="received" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.dashboard.currencyDistribution")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={currencyDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {currencyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.transactions.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.transactions.transactionId")}</TableHead>
                <TableHead>{t("admin.transactions.date")}</TableHead>
                <TableHead>{t("admin.transactions.amount")}</TableHead>
                <TableHead>{t("admin.transactions.status")}</TableHead>
                <TableHead>{t("admin.transactions.commission")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.slice(0, 5).map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{tx.id}</TableCell>
                  <TableCell>
                    {new Date(tx.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {tx.amount} {tx.currency}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadge(tx.status) as any}>
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell>${tx.commission.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Audit Log Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Audit Log</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs">
              {filteredAuditLogs.length} entries
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 p-4 bg-muted/30 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  <Search className="h-4 w-4 inline mr-1" />
                  Search
                </Label>
                <Input
                  placeholder="Search actions, users, resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  <User className="h-4 w-4 inline mr-1" />
                  User
                </Label>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All users</SelectItem>
                    {uniqueUsers.map((user) => (
                      <SelectItem key={user} value={user}>
                        {user}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  <Filter className="h-4 w-4 inline mr-1" />
                  Action
                </Label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All actions</SelectItem>
                    {uniqueActions.map((action) => (
                      <SelectItem key={action} value={action}>
                        {action}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Time Range
                </Label>
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Last 24 hours" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last 1 hour</SelectItem>
                    <SelectItem value="24h">Last 24 hours</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Audit Log Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAuditLogs.slice(0, 10).map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium">{log.user}</TableCell>
                  <TableCell>{log.action}</TableCell>
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
                  <TableCell className="font-mono text-xs">
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

          {filteredAuditLogs.length > 10 && (
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm">
                Load More ({filteredAuditLogs.length - 10} remaining)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
