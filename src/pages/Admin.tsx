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
  Menu,
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
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelector, useDispatch } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { singleUserDetailsActions } from "@/store/singleUserDetailsReducer";
import { getUser } from "@/service/auth";
import UserProfile from "@/components/UserProfile";
import { RootState } from "@/types";
import {
  createUserRole,
  getAllPermissions,
  getErrorLogs,
  getUserRole,
  updateUserRoles,
  getAdminCurrencyDistribution,
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

  // Set loading state when query starts
  useEffect(() => {
    if (isLoadingProfile && !singleUserDetails.loading) {
      console.log("🔄 Admin: Setting loading state in Redux");
      dispatch(singleUserDetailsActions.setLoading(true));
    }
  }, [isLoadingProfile, singleUserDetails.loading, dispatch]);

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
    { id: "dashboard", label: t("admin.dashboard"), icon: BarChart3 },
    { id: "transactions", label: t("admin.transactions"), icon: CreditCard },
    { id: "promo-codes", label: t("admin.promoCodes"), icon: QrCode },
    { id: "providers", label: t("admin.providers"), icon: Building2 },
    { id: "exchange-rates", label: t("admin.exchangeRates"), icon: TrendingUp },
    { id: "user-roles", label: t("admin.userRoles"), icon: Users },
    { id: "commission", label: t("admin.commission"), icon: Percent },
    { id: "settings", label: t("admin.settings"), icon: Settings },
    { id: "error-logs", label: t("admin.errorLogs"), icon: AlertTriangle },
    { id: "reports", label: t("admin.reports"), icon: Download },
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

  // Helper function to get today's date range in epoch format
  const getTodayDateRange = () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    
    return {
      from_date: Math.floor(startOfDay.getTime() / 1000), // Convert to epoch seconds
      to_date: Math.floor(endOfDay.getTime() / 1000), // Convert to epoch seconds
    };
  };

  // Fetch currency distribution data
  const { data: currencyDistributionData } = useQuery({
    queryKey: ["admin-currency-distribution"],
    queryFn: () => getAdminCurrencyDistribution(getTodayDateRange()),
    gcTime: 60000,
    staleTime: 60000,
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

  // Process currency distribution data from API or use fallback
  const processCurrencyDistribution = () => {
    if ((currencyDistributionData as any)?.data) {
      const { by_currency, by_crypto } = (currencyDistributionData as any).data;
      
      // Process by_currency data
      const currencyData = by_currency.map((item: any, index: number) => ({
        name: item.currency,
        value: item.percentage || item.value,
        color: getCurrencyColor(item.currency, index),
      }));
      
      // Process by_crypto data
      const cryptoData = by_crypto.map((item: any, index: number) => ({
        name: item.currency,
        value: item.percentage || item.value,
        color: getCurrencyColor(item.currency, index),
      }));
      
      return { currencyData, cryptoData };
    }
    
    // Fallback data if API response is not available
    return {
      currencyData: [
        { name: "USD", value: 40, color: "#4CAF50" },
        { name: "EUR", value: 30, color: "#2196F3" },
        { name: "GBP", value: 20, color: "#9C27B0" },
        { name: "Others", value: 10, color: "#607D8B" },
      ],
      cryptoData: [
        { name: "BTC", value: 35, color: "#F7931A" },
        { name: "ETH", value: 28, color: "#627EEA" },
        { name: "USDT", value: 25, color: "#26A17B" },
        { name: "Others", value: 12, color: "#8884d8" },
      ],
    };
  };
  
  // Helper function to get color for currency
  const getCurrencyColor = (currency: string, index: number) => {
    const colorMap: Record<string, string> = {
      BTC: "#F7931A",
      ETH: "#627EEA",
      USDT: "#26A17B",
      USD: "#4CAF50",
      EUR: "#2196F3",
      GBP: "#9C27B0",
    };
    
    const fallbackColors = [
      "#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d", "#a4de6c",
      "#d0ed57", "#ffc658", "#ff8042", "#ff6361", "#bc5090",
    ];
    
    return colorMap[currency] || fallbackColors[index % fallbackColors.length];
  };
  
  // Get processed currency distribution data
  const { currencyData, cryptoData } = processCurrencyDistribution();
  
  // Use cryptoData for the currency distribution in the dashboard
  const currencyDistribution = cryptoData;

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
            currencyData={currencyData}
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
            currencyData={currencyData}
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
      <div className="flex items-center justify-center min-h-screen px-4">
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
      <div className="flex items-center justify-center min-h-screen px-4">
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
    <SidebarProvider>
      {/* Responsive main container */}
      <div className="min-h-screen w-full bg-background">
        <div className="flex min-h-screen w-full relative">
          {/* Responsive Sidebar */}
          <Sidebar className="flex-shrink-0 hidden lg:flex lg:w-64 xl:w-72 border-r border-border">
            <SidebarContent className="flex flex-col h-full bg-card">
              <SidebarHeader className="flex-shrink-0 p-4 border-b border-border">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
                    <Crown className="h-5 w-5 xl:h-6 xl:w-6 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base xl:text-lg font-semibold truncate">
                      {t("admin.title")}
                    </h2>
                    <p className="text-xs text-muted-foreground truncate">
                      {t("admin.subtitle")}
                    </p>
                  </div>
                </div>
              </SidebarHeader>
              <div className="flex-1 overflow-y-auto py-2">
                <SidebarMenu className="px-2">
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id} className="mb-1">
                      <SidebarMenuButton
                        onClick={() => setActiveSection(item.id)}
                        isActive={activeSection === item.id}
                        className={`w-full justify-start p-3 rounded-lg transition-colors ${
                          activeSection === item.id
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-muted"
                        }`}
                      >
                        <item.icon
                          className={`h-4 w-4 mr-3 flex-shrink-0 ${
                            activeSection === item.id ? "text-primary" : ""
                          }`}
                        />
                        <span className="truncate text-sm xl:text-base">
                          {item.label}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </div>
            </SidebarContent>
          </Sidebar>

          {/* Main content area with responsive design */}
          <SidebarInset className="flex-1 min-w-0 w-full lg:w-auto">
            <div className="flex flex-col h-screen">
              {/* Responsive header */}
              <div className="flex-shrink-0 bg-card border-b">
                <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                  <div className="flex items-center justify-between gap-2 sm:gap-4">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      {/* Mobile sidebar trigger */}
                      <SidebarTrigger className="flex-shrink-0 lg:hidden p-2 border border-border rounded-md hover:bg-muted">
                        <Menu className="h-5 w-5" />
                      </SidebarTrigger>

                      <div className="min-w-0 flex-1">
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold capitalize truncate">
                          {menuItems.find((item) => item.id === activeSection)
                            ?.label || "Dashboard"}
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate hidden sm:block">
                          Manage your {activeSection.replace("-", " ")} settings
                        </p>
                      </div>
                    </div>

                    {/* User profile - responsive */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <UserProfile
                        userProfileData={userProfileData}
                        refetchProfile={refetchProfile}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Responsive main content area */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <div className="h-full w-full overflow-y-auto">
                  <div className="p-3 sm:p-4 lg:p-6 xl:p-8">
                    <div className="w-full max-w-none">
                      <div className="space-y-4 sm:space-y-6">
                        {renderSection()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
