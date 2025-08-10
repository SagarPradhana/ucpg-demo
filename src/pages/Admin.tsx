import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
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
  Settings,
  Calculator,
  Percent,
  Coins,
  Building2,
  Plus,
  Trash2,
  Save,
  BarChart3,
  CreditCard,
  QrCode,
  Users,
  TrendingUp,
  Download,
  AlertTriangle,
  Eye,
  Edit,
  X,
  Search,
  RefreshCw,
  FileText,
  Wallet,
  DollarSign,
  Link,
  Lock,
  Crown,
  User,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelector, useDispatch } from "react-redux";
import { useQuery, useMutation } from "@tanstack/react-query";
import { singleUserDetailsActions } from "@/store/singleUserDetailsReducer";
import { getUser } from "@/service/auth";
import UserProfile from "@/components/UserProfile";
import { RootState } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  createUserRole,
  getAllPermissions,
  getErrorLogs,
  getUserRole,
  updateUserRoles,
} from "@/service/adminservices";
import { epochToCustomLocalStringTime } from "@/Common";

// Types
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

interface PromoCode {
  id: string;
  code: string;
  amount: number;
  currency: string;
  createdDate: string;
  expirationDate: string;
  usageStatus: "active" | "used" | "expired";
  qrLink: string;
}

interface Provider {
  id: string;
  name: string;
  type: string;
  apiEndpoint: string;
  redirectLink: string;
  transactionCount: number;
  totalAmount: number;
  isActive: boolean;
  lastActivity: string;
}

interface CommissionPolicy {
  id: string;
  type: "global" | "currency" | "provider";
  name: string;
  value: number;
  currency?: string;
  provider?: string;
  isActive: boolean;
}

interface ExchangeRate {
  symbol: string;
  price: number;
  change24h: number;
  lastUpdated: string;
}

interface ErrorLog {
  id: string;
  timestamp: string;
  errorCode: string;
  message: string;
  endpoint: string;
  severity: "low" | "medium" | "high" | "critical";
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role:
    | "super-admin"
    | "transaction-admin"
    | "provider-admin"
    | "statistics-admin";
  lastLogin: string;
  isActive: boolean;
  permissions: string[];
}

// Form schema for user creation
const createUserSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(
    ["super-admin", "transaction-admin", "provider-admin", "statistics-admin"],
    {
      required_error: "Please select a role",
    }
  ),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface CreateUserWithPermissionsFormData extends CreateUserFormData {
  permissions: string[];
}

const Admin = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const { toast } = useToast();
  const { t } = useLanguage();

  // Redux state
  const dispatch = useDispatch();
  const authUser = useSelector((store: RootState) => store.auth.userDetails);
  const singleUserDetails = useSelector(
    (store: RootState) => store.singleUserDetails
  );
  const { data: getRoleUserResponse, refetch } = useQuery({
    queryKey: ["userRole"],
    queryFn: () => getUserRole(),
    gcTime: 60000,
    staleTime: 60000,
  });

  const { data: getAllPermissionResponse } = useQuery({
    queryKey: ["allPermissions"],
    queryFn: () => getAllPermissions(),
    gcTime: 60000,
    staleTime: 60000,
  });

  console.log("getAllPermissionResponse", getAllPermissionResponse);

  // Fetch user profile from API when Admin mounts
  const {
    data: userProfileData,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["adminUserProfile", authUser?.id],
    queryFn: () => {
      console.log("🔄 Admin: Fetching user profile for ID:", authUser?.id);
      return getUser(authUser?.id);
    },
    enabled: !!authUser?.id,
  });

  // Handle user profile data when it's fetched
  useEffect(() => {
    if (userProfileData && !singleUserDetails.userDetails) {
      console.log("✅ Admin: Storing user profile in Redux:", userProfileData);
      dispatch(
        singleUserDetailsActions.setSingleUserDetails(userProfileData as any)
      );
    }
  }, [userProfileData, singleUserDetails.userDetails, dispatch]);

  // Handle profile fetch errors
  useEffect(() => {
    if (profileError) {
      console.error("❌ Admin: Profile fetch error:", profileError);
      dispatch(
        singleUserDetailsActions.setSingleUserError(
          (profileError as any)?.message || "Failed to fetch user profile"
        )
      );
    }
  }, [profileError, dispatch]);

  // Dashboard data
  const [dashboardStats, setDashboardStats] = useState({
    todayPayments: { count: 145, amount: 25684.5 },
    last24Hours: {
      activePromoLinks: 23,
      usedPromoCodes: 87,
      claimedFunds: 15420,
      unclaimedFunds: 8930,
    },
    commissionIncome: { daily: 1284.3, weekly: 8950.75 },
  });

  // State for create user modal
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [errorLogsTime, SetErrorLogsTime] = useState<string>("24h");

  console.log("selectedPermissions", selectedPermissions);

  // Form for creating new user
  const createUserForm = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: undefined,
    },
  });
  const [isEdit, setIsEdit] = useState<boolean>(false);

  // Mutation for creating new user
  const createUserMutation = useMutation({
    mutationFn: isEdit ? updateUserRoles : createUserRole,
    onSuccess: (data: any) => {
      toast({
        title: isEdit
          ? "✅ User Updated Successfully"
          : "✅ User Created Successfully",
        description: data?.message,
      });

      // Reset form and close modal
      createUserForm.reset();
      setIsCreateUserModalOpen(false);
      refetch();

      // TODO: Add functionality to refresh admin users list
      // You might want to implement a query to fetch admin users and invalidate it here
      // queryClient.invalidateQueries(['adminUsers']);
    },
    onError: (error: any) => {
      console.error("❌ Admin: Failed to create user:", error);

      // Handle specific error cases
      let errorMessage = "Failed to create user. Please try again.";

      if (error.message?.includes("email")) {
        errorMessage = "Email address is already in use.";
      } else if (error.message?.includes("password")) {
        errorMessage = "Password does not meet security requirements.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: isEdit ? "❌ Failed to Update User" : "❌ Failed to Create User",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Handle create user form submission
  const handleCreateUser = () => {
    const addpayload = {
      name: createUserForm.getValues()?.fullName,
      email: createUserForm.getValues()?.email,

      role: createUserForm.getValues()?.role,
    };

    const editPayload = {
      name: createUserForm.getValues()?.fullName,
      user_email: createUserForm.getValues()?.email,
      role: createUserForm.getValues()?.role,
      permissions: selectedPermissions ?? [],
    };

    createUserMutation.mutate(isEdit ? editPayload : addpayload);
  };

  // Sample data for different sections
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "TX001",
      date: "2024-01-15 14:30:25",
      amount: 1500.0,
      currency: "USDT",
      status: "received",
      commission: 30.0,
      netAmount: 1470.0,
      providerFee: 5.0,
      qrStatus: "used",
    },
    {
      id: "TX002",
      date: "2024-01-15 13:15:42",
      amount: 0.025,
      currency: "BTC",
      status: "sent",
      commission: 0.0005,
      netAmount: 0.0245,
      providerFee: 0.0001,
      qrStatus: "active",
    },
    {
      id: "TX003",
      date: "2024-01-15 12:45:18",
      amount: 2.5,
      currency: "ETH",
      status: "expired",
      commission: 0.05,
      netAmount: 2.45,
      providerFee: 0.02,
      qrStatus: "expired",
    },
  ]);

  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([
    {
      id: "PC001",
      code: "CRYPTO2024",
      amount: 500,
      currency: "USDT",
      createdDate: "2024-01-15 10:30:00",
      expirationDate: "2024-01-17 10:30:00",
      usageStatus: "active",
      qrLink: "https://pay.ucpg.com/qr/PC001",
    },
    {
      id: "PC002",
      code: "WINTER50",
      amount: 50,
      currency: "USD",
      createdDate: "2024-01-14 15:20:00",
      expirationDate: "2024-01-16 15:20:00",
      usageStatus: "used",
      qrLink: "https://pay.ucpg.com/qr/PC002",
    },
  ]);

  const [providers, setProviders] = useState<Provider[]>([
    {
      id: "PRV001",
      name: "Gaming Platform Alpha",
      type: "Gaming",
      apiEndpoint: "https://api.gamingalpha.com/payments",
      redirectLink: "https://gamingalpha.com/success",
      transactionCount: 1245,
      totalAmount: 89500.75,
      isActive: true,
      lastActivity: "2024-01-15 14:25:00",
    },
    {
      id: "PRV002",
      name: "VPN SecureNet",
      type: "VPN Service",
      apiEndpoint: "https://api.securenet.vpn/billing",
      redirectLink: "https://securenet.vpn/payment-success",
      transactionCount: 890,
      totalAmount: 34200.25,
      isActive: true,
      lastActivity: "2024-01-15 13:45:00",
    },
  ]);

  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([
    {
      symbol: "BTC/USD",
      price: 42850.75,
      change24h: 2.45,
      lastUpdated: "2024-01-15 14:30:00",
    },
    {
      symbol: "ETH/USD",
      price: 2650.3,
      change24h: -1.2,
      lastUpdated: "2024-01-15 14:30:00",
    },
    {
      symbol: "USDT/USD",
      price: 1.0001,
      change24h: 0.01,
      lastUpdated: "2024-01-15 14:30:00",
    },
  ]);

  // Calculate epoch dates based on time filter
  const calculateEpochDates = (
    filter: string
  ): { from: number; to: number } => {
    const now = Math.floor(Date.now() / 1000);
    let from = now;
    let to = now;

    switch (filter) {
      case "1h":
        from = now - 3600;
        break;
      case "6h":
        from = now - 21600;
        break;
      case "24h":
        from = now - 86400;
        break;
      case "7d":
        from = now - 604800;
        break;
      case "30d":
        from = now - 2592000;
        break;
      case "90d":
        from = now - 7776000;
        break;
      case "custom":
        // Use custom dates set by user
        from = errorLogFromDate;
        to = errorLogToDate;
        break;
      default:
        from = now - 86400;
    }

    return { from, to };
  };

  // Time filter state for error logs
  const { from, to } = calculateEpochDates("24h");
  const [errorLogFromDate, setErrorLogFromDate] = useState<number>(from);
  const [errorLogToDate, setErrorLogToDate] = useState<number>(to);

  // Update error logs query with time filter
  const { data: getErrorLogResponse } = useQuery<any>({
    queryKey: ["errorLogs", errorLogFromDate, errorLogToDate],
    queryFn: () => {
      const payload = {
        from_date: errorLogFromDate,
        to_date: errorLogToDate,
      };
      return getErrorLogs(payload);
    },
    gcTime: 60000,
    staleTime: 60000,
  });

  console.log("getErrorLogResponse", getErrorLogResponse);

  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);

  useEffect(() => {
    if (getErrorLogResponse) {
      const FilteredErrorLogs = getErrorLogResponse?.data?.map((item) => ({
        id: item?.id,
        timestamp: epochToCustomLocalStringTime(item?.created_date),
        errorCode: item?.error_code,
        message: item?.error,
        endpoint: item?.endpoint,
        severity: item?.severity,
      }));
      setErrorLogs(FilteredErrorLogs);
    }
  }, [getErrorLogResponse]);

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  useEffect(() => {
    if (getRoleUserResponse) {
      const filterUserDetails = ((getRoleUserResponse as any)?.data ?? [])?.map(
        (user: any) => ({
          id: user?.id,
          name: user?.name,
          email: user?.email,
          role: user?.role,
          lastLogin: epochToCustomLocalStringTime(user?.last_login),
          isActive: user?.is_active,
          permissions: user?.permissions ?? [],
        })
      );
      setAdminUsers(filterUserDetails);
    }
  }, [getRoleUserResponse]);

  // Commission settings (existing)
  const [globalPercentage, setGlobalPercentage] = useState<number>(2.5);
  const [currencySettings, setCurrencySettings] = useState<CommissionPolicy[]>([
    {
      id: "1",
      type: "currency",
      name: "Bitcoin Commission",
      value: 1.5,
      currency: "BTC",
      isActive: true,
    },
    {
      id: "2",
      type: "currency",
      name: "Ethereum Commission",
      value: 2.0,
      currency: "ETH",
      isActive: true,
    },
    {
      id: "3",
      type: "currency",
      name: "USDT Commission",
      value: 1.0,
      currency: "USDT",
      isActive: true,
    },
  ]);

  // Settings
  const [systemSettings, setSystemSettings] = useState({
    defaultQRExpiration: 24,
    maxDailyTransactionLimit: 50000,
    maintenanceMode: false,
    telegramNotifications: true,
    exchangeRateMonitoring: true,
    rateUpdateInterval: 10,
  });

  // Chart data
  const transactionChartData = [
    { name: "Mon", sent: 45, received: 38 },
    { name: "Tue", sent: 52, received: 41 },
    { name: "Wed", sent: 48, received: 45 },
    { name: "Thu", sent: 61, received: 52 },
    { name: "Fri", sent: 55, received: 48 },
    { name: "Sat", sent: 42, received: 35 },
    { name: "Sun", sent: 38, received: 32 },
  ];

  const currencyDistribution = [
    { name: "BTC", value: 35, color: "#F7931A" },
    { name: "ETH", value: 28, color: "#627EEA" },
    { name: "USDT", value: 25, color: "#26A17B" },
    { name: "Others", value: 12, color: "#8884d8" },
  ];

  // Filters
  const [transactionFilters, setTransactionFilters] = useState({
    status: "all",
    currency: "all",
    dateFrom: "",
    dateTo: "",
    search: "",
  });

  // Sidebar navigation
  const sidebarItems = [
    { id: "dashboard", label: t("admin.dashboard"), icon: BarChart3 },
    { id: "transactions", label: t("admin.transactions"), icon: CreditCard },
    { id: "promo-codes", label: t("admin.promoCodes"), icon: QrCode },
    { id: "providers", label: t("admin.providers"), icon: Building2 },
    { id: "commission", label: t("admin.commission"), icon: Percent },
    { id: "exchange-rates", label: t("admin.exchangeRates"), icon: TrendingUp },
    { id: "user-roles", label: t("admin.userRoles"), icon: Users },
    { id: "settings", label: t("admin.settings"), icon: Settings },
    { id: "error-logs", label: t("admin.errorLogs"), icon: AlertTriangle },
    { id: "reports", label: t("admin.reports"), icon: Download },
  ];

  // Functions
  const getStatusBadge = (status: string) => {
    const variants = {
      sent: "default",
      received: "default",
      expired: "secondary",
      cancelled: "destructive",
      active: "default",
      used: "secondary",
      inactive: "outline",
    };
    return variants[status as keyof typeof variants] || "outline";
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      low: "secondary",
      medium: "outline",
      high: "destructive",
      critical: "destructive",
    };
    return variants[severity as keyof typeof variants] || "outline";
  };

  const exportData = (type: string, format: string) => {
    // Removed non-API export toast
  };

  const handleTransactionCancel = (transactionId: string) => {
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.id === transactionId ? { ...tx, status: "cancelled" as const } : tx
      )
    );
    // Removed non-API transaction cancel toast
  };

  const renderDashboard = () => (
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
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Transaction ID..."
                  className="pl-8"
                  value={transactionFilters.search}
                  onChange={(e) =>
                    setTransactionFilters((prev) => ({
                      ...prev,
                      search: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={transactionFilters.status}
                onValueChange={(value) =>
                  setTransactionFilters((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Currency</Label>
              <Select
                value={transactionFilters.currency}
                onValueChange={(value) =>
                  setTransactionFilters((prev) => ({
                    ...prev,
                    currency: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All currencies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All currencies</SelectItem>
                  <SelectItem value="BTC">Bitcoin</SelectItem>
                  <SelectItem value="ETH">Ethereum</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date From</Label>
              <Input
                type="date"
                value={transactionFilters.dateFrom}
                onChange={(e) =>
                  setTransactionFilters((prev) => ({
                    ...prev,
                    dateFrom: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label>Date To</Label>
              <Input
                type="date"
                value={transactionFilters.dateTo}
                onChange={(e) =>
                  setTransactionFilters((prev) => ({
                    ...prev,
                    dateTo: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Net Amount</TableHead>
                <TableHead>QR Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{tx.id}</TableCell>
                  <TableCell>{new Date(tx.date).toLocaleString()}</TableCell>
                  <TableCell>{tx.amount}</TableCell>
                  <TableCell>{tx.currency}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadge(tx.status) as any}>
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{tx.commission}</TableCell>
                  <TableCell>{tx.netAmount}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadge(tx.qrStatus) as any}>
                      {tx.qrStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleTransactionCancel(tx.id)}
                        disabled={tx.status === "cancelled"}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderPromoCodes = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Promo Codes Management</CardTitle>
          <CardDescription>Manage QR links and promo codes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Add New Promo Code */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/20">
              <Input placeholder="Code" />
              <Input placeholder="Amount" type="number" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTC">Bitcoin</SelectItem>
                  <SelectItem value="ETH">Ethereum</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Code
              </Button>
            </div>

            {/* Promo Codes Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>QR Link</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promoCodes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell className="font-medium">{code.code}</TableCell>
                    <TableCell>{code.amount}</TableCell>
                    <TableCell>{code.currency}</TableCell>
                    <TableCell>
                      {new Date(code.createdDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(code.expirationDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(code.usageStatus) as any}>
                        {code.usageStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost">
                        <Link className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProviders = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Service Providers</CardTitle>
          <CardDescription>
            Manage connected services and providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Add New Provider */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/20">
              <div>
                <Label>Provider Name</Label>
                <Input placeholder="Enter provider name" />
              </div>
              <div>
                <Label>Service Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gaming">Gaming</SelectItem>
                    <SelectItem value="vpn">VPN Service</SelectItem>
                    <SelectItem value="digital">Digital Services</SelectItem>
                    <SelectItem value="sms">SMS Gateway</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Provider
                </Button>
              </div>
            </div>

            {/* Providers Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Transactions</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium">
                      {provider.name}
                    </TableCell>
                    <TableCell>{provider.type}</TableCell>
                    <TableCell>
                      {provider.transactionCount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      ${provider.totalAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={provider.isActive ? "default" : "secondary"}
                      >
                        {provider.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(provider.lastActivity).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderExchangeRates = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Currency Exchange Monitoring
            <Button
              size="sm"
              onClick={() => {
                // Removed non-API rates update toast
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
          <CardDescription>Real-time exchange rate monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Settings */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Auto-refresh rates</p>
                <p className="text-sm text-muted-foreground">
                  Update rates every {systemSettings.rateUpdateInterval} minutes
                </p>
              </div>
              <Switch
                checked={systemSettings.exchangeRateMonitoring}
                onCheckedChange={(checked) =>
                  setSystemSettings((prev) => ({
                    ...prev,
                    exchangeRateMonitoring: checked,
                  }))
                }
              />
            </div>

            {/* Exchange Rates Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Currency Pair</TableHead>
                  <TableHead>Current Price</TableHead>
                  <TableHead>24h Change</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exchangeRates.map((rate, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{rate.symbol}</TableCell>
                    <TableCell>${rate.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <span
                        className={
                          rate.change24h >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {rate.change24h >= 0 ? "+" : ""}
                        {rate.change24h}%
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(rate.lastUpdated).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">Live</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUserRoles = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Roles and Permissions</CardTitle>
              <CardDescription>
                Manage admin users and their access levels
              </CardDescription>
            </div>
            <Dialog
              open={isCreateUserModalOpen}
              onOpenChange={setIsCreateUserModalOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[500px] p-0 flex flex-col max-h-[90vh] overflow-visible">
                {/* HEADER */}
                <div className="p-4 border-b">
                  <DialogHeader>
                    <DialogTitle>Create New Admin User</DialogTitle>
                    <DialogDescription>
                      Add a new admin user with specific role permissions.
                    </DialogDescription>
                  </DialogHeader>
                </div>

                {/* BODY - scrollable */}
                <div className="flex-1 overflow-y-auto p-4">
                  <Form {...createUserForm}>
                    <form id="create-user-form" className="space-y-5">
                      {/* Full Name */}
                      <FormField
                        control={createUserForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Email */}
                      <FormField
                        control={createUserForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Enter email address"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Role */}
                      <FormField
                        control={createUserForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="super_admin">
                                  <div className="flex items-center">
                                    <Crown className="h-4 w-4 mr-2 text-yellow-600" />
                                    Super Admin
                                  </div>
                                </SelectItem>
                                <SelectItem value="transaction_admin">
                                  <div className="flex items-center">
                                    <CreditCard className="h-4 w-4 mr-2 text-blue-600" />
                                    Transaction Admin
                                  </div>
                                </SelectItem>
                                <SelectItem value="provider_admin">
                                  <div className="flex items-center">
                                    <Building2 className="h-4 w-4 mr-2 text-green-600" />
                                    Provider Admin
                                  </div>
                                </SelectItem>
                                <SelectItem value="statistics_admin">
                                  <div className="flex items-center">
                                    <BarChart3 className="h-4 w-4 mr-2 text-purple-600" />
                                    Statistics Admin
                                  </div>
                                </SelectItem>
                                <SelectItem value="user">
                                  <div className="flex items-center">
                                    <User className="h-4 w-4 mr-2 text-gray-600" />
                                    User
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Permissions Accordion */}
                      {isEdit &&
                        singleUserDetails?.userDetails?.data?.role !==
                          "user" && (
                          <div className="space-y-2">
                            <Accordion
                              type="single"
                              collapsible
                              className="border rounded-md"
                            >
                              <AccordionItem value="permissions">
                                <AccordionTrigger className="px-4">
                                  User Permissions
                                </AccordionTrigger>
                                <AccordionContent className="px-4 py-2 space-y-4">
                                  {(getAllPermissionResponse as any)?.data &&
                                    Object.entries(
                                      (
                                        getAllPermissionResponse as any
                                      )?.data.reduce((acc: any, p: any) => {
                                        const category =
                                          p.category || "General";
                                        (acc[category] =
                                          acc[category] || []).push(p);
                                        return acc;
                                      }, {})
                                    )?.map(
                                      ([category, permissions]: [
                                        string,
                                        any
                                      ]) => (
                                        <div
                                          key={category}
                                          className="space-y-2"
                                        >
                                          <h4 className="font-medium text-sm">
                                            {category}
                                          </h4>
                                          {permissions?.map(
                                            (permission: any) => (
                                              <div
                                                key={permission.code}
                                                className="flex items-center space-x-2"
                                              >
                                                <Checkbox
                                                  id={permission.code}
                                                  checked={selectedPermissions?.includes(
                                                    permission.code
                                                  )}
                                                  onCheckedChange={(checked) =>
                                                    checked
                                                      ? setSelectedPermissions(
                                                          (prev) => [
                                                            ...prev,
                                                            permission.code,
                                                          ]
                                                        )
                                                      : setSelectedPermissions(
                                                          (prev) =>
                                                            prev.filter(
                                                              (p) =>
                                                                p !==
                                                                permission.code
                                                            )
                                                        )
                                                  }
                                                />
                                                <Label
                                                  htmlFor={permission.code}
                                                  className="text-sm"
                                                >
                                                  {permission.label}
                                                </Label>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )
                                    )}
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </div>
                        )}
                    </form>
                  </Form>
                </div>

                {/* FOOTER */}
                <div className="p-4 border-t flex justify-end space-x-2 bg-white">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      createUserForm.reset();
                      setIsCreateUserModalOpen(false);
                      setSelectedPermissions([]);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    form="create-user-form"
                    onClick={handleCreateUser}
                    disabled={createUserMutation.isPending}
                  >
                    {createUserMutation.isPending ? "Creating..." : "Save"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Role Descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Crown className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-medium">Super Admin</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Full access to all modules, commission management, user
                    management
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium">Transaction Admin</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    View and manage transactions, cancel payments
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Building2 className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium">Provider Admin</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Add, edit, and delete service providers
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <h4 className="font-medium">Statistics Admin</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    View-only access to dashboard, charts, and reports
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Admin Users Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminUsers?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            createUserForm.reset({
                              fullName: user.name,
                              email: user.email,
                              role: user.role,
                            });
                            setSelectedPermissions(user?.permissions);
                            setIsCreateUserModalOpen(true);
                            setIsEdit(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Lock className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>
            Configure system parameters and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* QR Settings */}
            <div>
              <h4 className="font-medium mb-4">QR Code Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Default QR Expiration (hours)</Label>
                  <Input
                    type="number"
                    value={systemSettings.defaultQRExpiration}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        defaultQRExpiration: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Max Daily Transaction Limit ($)</Label>
                  <Input
                    type="number"
                    value={systemSettings.maxDailyTransactionLimit}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        maxDailyTransactionLimit: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* System Status */}
            <div>
              <h4 className="font-medium mb-4">System Status</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Maintenance Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Show maintenance banner to users
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings.maintenanceMode}
                    onCheckedChange={(checked) =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        maintenanceMode: checked,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Telegram Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Send notifications to Telegram channel
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings.telegramNotifications}
                    onCheckedChange={(checked) =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        telegramNotifications: checked,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Notification Settings */}
            <div>
              <h4 className="font-medium mb-4">Notification Settings</h4>
              <div className="space-y-4">
                <div>
                  <Label>Telegram Bot Token</Label>
                  <Input placeholder="Enter bot token" type="password" />
                </div>
                <div>
                  <Label>Telegram Channel ID</Label>
                  <Input placeholder="Enter channel ID" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderErrorLogs = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Error Logs</span>
            <Badge variant="outline" className="ml-2">
              {getErrorLogResponse?.data?.length ?? 0} entries
            </Badge>
          </CardTitle>
          <CardDescription>
            System errors and API failures with time-based filtering
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Time Filter Controls */}
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Time Range
                </Label>
                <Select
                  value={errorLogsTime}
                  onValueChange={(value) => {
                    SetErrorLogsTime(value);
                    const { from, to } = calculateEpochDates(value);
                    setErrorLogFromDate(from);
                    setErrorLogToDate(to);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last 1 hour</SelectItem>
                    <SelectItem value="6h">Last 6 hours</SelectItem>
                    <SelectItem value="24h">Last 24 hours</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Error Code</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errorLogs?.map((error: any) => (
                <TableRow key={error.id}>
                  <TableCell>{error?.timestamp}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{error?.errorCode}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {error?.message}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {error?.endpoint}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getSeverityBadge(error.severity) as any}>
                      {error?.severity}
                    </Badge>
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
        </CardContent>
      </Card>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reports & Export</CardTitle>
          <CardDescription>Generate and export various reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Transaction Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Transaction Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => exportData("transactions", "csv")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export Transactions (CSV)
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => exportData("transactions", "xlsx")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export Transactions (Excel)
                </Button>
              </CardContent>
            </Card>

            {/* Commission Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Commission Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => exportData("commissions", "csv")}
                >
                  <Percent className="h-4 w-4 mr-2" />
                  Export Commissions (CSV)
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => exportData("commissions", "xlsx")}
                >
                  <Percent className="h-4 w-4 mr-2" />
                  Export Commissions (Excel)
                </Button>
              </CardContent>
            </Card>

            {/* Provider Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Provider Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => exportData("providers", "csv")}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Export Provider Stats (CSV)
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => exportData("providers", "xlsx")}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Export Provider Stats (Excel)
                </Button>
              </CardContent>
            </Card>

            {/* Date Range Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Date Range Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Input type="date" placeholder="From" />
                  <Input type="date" placeholder="To" />
                </div>
                <Button className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Custom Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCommissionSettings = () => (
    <div className="space-y-6">
      {/* Global Percentage */}
      <Card className="animate-scale-in">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Percent className="h-5 w-5" />
            <span>Global Commission Settings</span>
          </CardTitle>
          <CardDescription>
            Default commission rate applied when no specific currency or
            provider rate is set
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <Label htmlFor="global-percentage">Global Percentage (%)</Label>
              <Input
                id="global-percentage"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={globalPercentage}
                onChange={(e) =>
                  setGlobalPercentage(parseFloat(e.target.value) || 0)
                }
                className="transition-all duration-200 focus:scale-[1.02]"
              />
            </div>
            <Button
              onClick={() => {
                // Removed non-API global commission update toast
              }}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>Commission Calculator</span>
          </CardTitle>
          <CardDescription>Test commission calculations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Input placeholder="Amount" type="number" />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BTC">Bitcoin</SelectItem>
                <SelectItem value="ETH">Ethereum</SelectItem>
                <SelectItem value="USDT">USDT</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="binance">Binance</SelectItem>
                <SelectItem value="coinbase">Coinbase</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Calculator className="h-4 w-4 mr-2" />
              Calculate
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return renderDashboard();
      case "transactions":
        return renderTransactions();
      case "promo-codes":
        return renderPromoCodes();
      case "providers":
        return renderProviders();
      case "commission":
        return renderCommissionSettings();
      case "exchange-rates":
        return renderExchangeRates();
      case "user-roles":
        return renderUserRoles();
      case "settings":
        return renderSettings();
      case "error-logs":
        return renderErrorLogs();
      case "reports":
        return renderReports();
      default:
        return renderDashboard();
    }
  };

  // Show loading state while user profile is being fetched
  if (
    (singleUserDetails.loading || isLoadingProfile) &&
    !singleUserDetails.userDetails
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading admin profile...</p>
          <p className="text-sm text-muted-foreground">
            Please wait while we prepare your admin panel
          </p>
        </div>
      </div>
    );
  }

  // Show error state if user profile failed to load
  if (
    (singleUserDetails.error || profileError) &&
    !singleUserDetails.userDetails
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium">Failed to load admin profile</p>
            <p className="text-sm text-muted-foreground">
              {singleUserDetails.error ||
                (profileError as any)?.message ||
                "Failed to load user profile"}
            </p>
          </div>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-card border-r">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-xl font-bold">Admin Panel</h1>
            </div>

            <nav className="space-y-2">
              {sidebarItems?.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item?.id}
                    onClick={() => setActiveSection(item?.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === item.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header with User Profile */}
          <div className="bg-card border-b px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Crown className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-xl font-semibold">{t("admin.title")}</h2>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.subtitle")}
                  </p>
                </div>
              </div>
              <UserProfile />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">{renderSection()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
