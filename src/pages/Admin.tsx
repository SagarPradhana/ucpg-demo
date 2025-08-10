import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  CreditCard,
  QrCode,
  Users,
  TrendingUp,
  Download,
  AlertTriangle,
  Building2,
  Percent,
  Settings,
  RefreshCw,
  Crown,
} from "lucide-react";
import {
  AdminDashboard,
  AdminTransactions,
  AdminPromoCodes,
  AdminProviders,
  AdminExchangeRates,
  AdminUserRoles,
  AdminSettings,
  AdminErrorLogs,
  AdminReports,
  AdminCommissionSettings,
} from "@/components/admin";
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
  // Menu items for navigation
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "transactions", label: "Transactions", icon: CreditCard },
    { id: "promo-codes", label: "Promo Codes", icon: QrCode },
    { id: "providers", label: "Providers", icon: Building2 },
    { id: "exchange-rates", label: "Exchange Rates", icon: TrendingUp },
    { id: "user-roles", label: "User Roles", icon: Users },
    { id: "commission", label: "Commission", icon: Percent },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "error-logs", label: "Error Logs", icon: AlertTriangle },
    { id: "reports", label: "Reports", icon: Download },
  ];

  // Form for creating new user

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

  // Time filter state for error logs

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

  // Helper functions
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
      case "active":
        return "default";
      case "received":
        return "secondary";
      case "expired":
        return "destructive";
      case "cancelled":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "secondary";
    }
  };

  const handleTransactionCancel = (transactionId: string) => {
    toast({
      title: "Transaction Cancelled",
      description: `Transaction ${transactionId} has been cancelled.`,
    });
  };

  const exportData = (type: string, format: string) => {
    toast({
      title: "Export Started",
      description: `Exporting ${type} data in ${format} format...`,
    });
  };

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

  // All render functions have been moved to separate components

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <AdminDashboard
            dashboardStats={dashboardStats}
            transactions={transactions}
            transactionChartData={transactionChartData}
            currencyDistribution={currencyDistribution}
            getStatusBadge={getStatusBadge}
          />
        );
      case "transactions":
        return (
          <AdminTransactions
            transactions={transactions}
            transactionFilters={transactionFilters}
            setTransactionFilters={setTransactionFilters}
            getStatusBadge={getStatusBadge}
            handleTransactionCancel={handleTransactionCancel}
          />
        );
      case "promo-codes":
        return (
          <AdminPromoCodes
            promoCodes={promoCodes}
            getStatusBadge={getStatusBadge}
          />
        );
      case "providers":
        return <AdminProviders providers={providers} />;
      case "commission":
        return (
          <AdminCommissionSettings
            globalPercentage={globalPercentage}
            setGlobalPercentage={setGlobalPercentage}
            currencySettings={currencySettings}
            setCurrencySettings={setCurrencySettings}
          />
        );
      case "exchange-rates":
        return (
          <AdminExchangeRates
            exchangeRates={exchangeRates}
            systemSettings={systemSettings}
            setSystemSettings={setSystemSettings}
          />
        );
      case "user-roles":
        return <AdminUserRoles />;
      case "settings":
        return (
          <AdminSettings
            systemSettings={systemSettings}
            setSystemSettings={setSystemSettings}
          />
        );
      case "error-logs":
        return <AdminErrorLogs getSeverityBadge={getSeverityBadge} />;
      case "reports":
        return <AdminReports exportData={exportData} />;
      default:
        return (
          <AdminDashboard
            dashboardStats={dashboardStats}
            transactions={transactions}
            transactionChartData={transactionChartData}
            currencyDistribution={currencyDistribution}
            getStatusBadge={getStatusBadge}
          />
        );
    }
  };

  // Show loading state while user profile is being fetched
  if (
    (singleUserDetails.loading || isLoadingProfile) &&
    !singleUserDetails.userDetails
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Show error state if user profile failed to load
  if (singleUserDetails.error && !singleUserDetails.userDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">Failed to load admin panel</p>
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
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r shadow-sm">
          {/* Sidebar Header */}
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{t("admin.title")}</h2>
                <p className="text-xs text-muted-foreground">
                  {t("admin.subtitle")}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar Navigation */}
          <div className="p-4">
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                    activeSection === item.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <div className="bg-card border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div>
                  <h1 className="text-xl font-semibold capitalize">
                    {menuItems.find((item) => item.id === activeSection)
                      ?.label || "Dashboard"}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Manage your {activeSection.replace("-", " ")} settings
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <UserProfile />
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto">{renderSection()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
