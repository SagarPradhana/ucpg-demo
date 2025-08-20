import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  RevenueOps,
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
import { canAccessSection, getAccessibleSections } from "@/utils/permissions";
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
import { epochToCustomLocalStringTime, getTodayDateRange } from "@/Common";
import { jwtDecode } from "jwt-decode";

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
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  // Redux state
  const dispatch = useDispatch();
  const authUser = useSelector((store: RootState) => store.auth.userDetails);
  const singleUserDetails = useSelector(
    (store: RootState) => store.singleUserDetails
  );

  // Fetch user profile from API when Admin mounts
  // Determine effective user ID from Redux or JWT token
  const tokenUserId = (() => {
    const token = localStorage.getItem("sessionToken");
    if (!token) return undefined;
    try {
      const decoded: any = jwtDecode<any>(token);
      return decoded?.id || decoded?.user_id || decoded?.userId || decoded?.sub;
    } catch {
      return undefined;
    }
  })();
  const userIdForProfile =
    authUser?.id || singleUserDetails.userDetails?.id || tokenUserId;

  const {
    data: userProfileData,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["adminUserProfile", userIdForProfile],
    queryFn: () => {
      console.log("🔄 Admin: Fetching user profile for ID:", userIdForProfile);
      return getUser(userIdForProfile as string);
    },
    enabled: !!userIdForProfile,
  });

  // Set loading state when query starts
  useEffect(() => {
    if (isLoadingProfile && !singleUserDetails.loading) {
      console.log("🔄 Admin: Setting loading state in Redux");
      dispatch(singleUserDetailsActions.setLoading(true));
    }
  }, [isLoadingProfile, singleUserDetails.loading, dispatch]);

  // Handle user profile data when it's fetched and normalize
  useEffect(() => {
    if (userProfileData) {
      const normalizedUser =
        (userProfileData as any)?.data?.user ||
        (userProfileData as any)?.data ||
        userProfileData;
      dispatch(
        singleUserDetailsActions.setSingleUserDetails(normalizedUser as any)
      );
    }
  }, [userProfileData, dispatch]);

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

  // Safety: clear loading if profile doesn't resolve in time
  useEffect(() => {
    if (
      (singleUserDetails.loading || isLoadingProfile) &&
      !userProfileData &&
      !profileError
    ) {
      const timer = setTimeout(() => {
        console.warn("⏱️ Admin: Profile load timeout, clearing loading state");
        dispatch(singleUserDetailsActions.setLoading(false));
      }, 12000); // 12s safeguard
      return () => clearTimeout(timer);
    }
  }, [
    singleUserDetails.loading,
    isLoadingProfile,
    userProfileData,
    profileError,
    dispatch,
  ]);

  // State for create user modal
  // All available menu items
  const allMenuItems = [
    { id: "dashboard", label: t("admin.dashboard"), icon: BarChart3 },
    { id: "transactions", label: t("admin.transactions"), icon: CreditCard },
    { id: "promo-codes", label: t("admin.promoCodes"), icon: QrCode },
    { id: "providers", label: t("admin.providers"), icon: Building2 },
    { id: "exchange-rates", label: t("admin.exchangeRates"), icon: TrendingUp },
    { id: "user-roles", label: t("admin.userRoles"), icon: Users },
    {
      id: "commission-settings",
      label: t("admin.commission"),
      icon: Percent,
    },
    { id: "settings", label: t("admin.settings"), icon: Settings },
    { id: "error-logs", label: t("admin.errorLogs"), icon: AlertTriangle },
    { id: "reports", label: t("admin.reports"), icon: Download },
    { id: "revenue-ops", label: "Revenue Operations", icon: TrendingUp },
  ];

  // Filter menu items based on user permissions
  const menuItems = useMemo(() => {
    if (!userProfileData) {
      console.log("🔒 Admin: No user profile data available");
      return [];
    }

    // Handle case where API response might be wrapped in a 'data' property
    const userData = (userProfileData as any)?.data || userProfileData;

    console.log("👤 Admin: User profile data:", {
      originalData: userProfileData,
      extractedData: userData,
      role: userData?.role,
      permissions: userData?.permissions,
      menus: userData?.menus,
    });

    // Check if user has super admin role for full access
    if (userData?.role === "super_admin") {
      console.log("👑 Admin: Super admin detected - showing all menu items");
      return allMenuItems;
    }

    const filteredItems = allMenuItems.filter((item) => {
      const hasAccess = canAccessSection(userProfileData, item.id);
      console.log(`🔑 Admin: Section "${item.id}" access:`, hasAccess);
      return hasAccess;
    });

    console.log(
      "📋 Admin: Accessible menu items:",
      filteredItems.map((item) => item.id)
    );
    return filteredItems;
  }, [userProfileData, allMenuItems]);

  // URL-based routing - sync activeSection with URL
  useEffect(() => {
    // Wait for user profile data to be loaded
    if (!userProfileData) {
      console.log("🔄 Admin: Waiting for user profile data...");
      return;
    }

    // Ensure permissions are available to avoid no-access flicker
    const profile =
      (userProfileData as any)?.data?.user ||
      (userProfileData as any)?.data ||
      userProfileData;
    const isSuperAdmin = profile?.role === "super_admin";
    const hasPermissionsArray = Array.isArray(profile?.permissions);
    if (!isSuperAdmin && !hasPermissionsArray) {
      console.log("⏳ Admin: Permissions not ready yet, delaying access check");
      return;
    }

    const path = location.pathname;
    console.log(
      "🔄 Admin: Processing path:",
      path,
      "with user data:",
      userProfileData
    );

    if (path === "/admin" || path === "/admin/") {
      // If dashboard is accessible, show it by default on first load
      const dashboardAccessible = canAccessSection(profile, "dashboard");
      const accessibleSections = getAccessibleSections(profile);
      console.log(
        "🔑 Admin: Accessible sections:",
        accessibleSections,
        "Dashboard:",
        dashboardAccessible
      );

      if (dashboardAccessible) {
        console.log("🏠 Admin: Showing dashboard by default");
        setActiveSection("dashboard");
      } else if (accessibleSections.length > 0) {
        // Redirect to the first accessible NON-dashboard sidebar section
        const firstNonDashboardFromMenu =
          menuItems && menuItems.length > 0
            ? menuItems.find((m) => m.id !== "dashboard")?.id
            : undefined;
        const firstNonDashboard =
          firstNonDashboardFromMenu ||
          accessibleSections.find((s) => s !== "dashboard");

        if (firstNonDashboard) {
          console.log(
            "➡️ Admin: Redirecting to first NON-dashboard section:",
            firstNonDashboard
          );
          setActiveSection(firstNonDashboard);
          // Avoid redundant navigation if already on target
          if (location.pathname !== `/admin/${firstNonDashboard}`) {
            navigate(`/admin/${firstNonDashboard}`);
          }
        } else {
          console.log("ℹ️ Admin: Only dashboard accessible, showing overview");
          setActiveSection("overview");
        }
      } else {
        // No accessible sections - this shouldn't happen for non-user roles
        console.log("❌ Admin: No accessible sections found");
        setActiveSection("no-access");
      }
    } else if (path.startsWith("/admin/")) {
      const section = path.replace("/admin/", "");
      console.log("🔍 Admin: Checking access to section:", section);

      // Check if user has access to this section
      if (canAccessSection(profile, section)) {
        console.log("✅ Admin: Access granted to section:", section);
        setActiveSection(section);
      } else {
        console.log("❌ Admin: Access denied to section:", section);
        // Redirect to first accessible section
        const accessibleSections = getAccessibleSections(profile);
        if (accessibleSections.length > 0) {
          console.log(
            "🔄 Admin: Redirecting to accessible section:",
            accessibleSections[0]
          );
          navigate(`/admin/${accessibleSections[0]}`);
        } else {
          console.log(
            "🔄 Admin: No accessible sections, redirecting to /admin"
          );
          navigate("/admin");
        }
      }
    }
  }, [location.pathname, userProfileData, navigate, menuItems]);

  // Function to handle section navigation
  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === "dashboard") {
      navigate("/admin");
    } else {
      navigate(`/admin/${sectionId}`);
    }
  };

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
      "#8884d8",
      "#83a6ed",
      "#8dd1e1",
      "#82ca9d",
      "#a4de6c",
      "#d0ed57",
      "#ffc658",
      "#ff8042",
      "#ff6361",
      "#bc5090",
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
    // Show loading state while determining accessible sections
    if (!activeSection) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">Loading...</h3>
          <p className="text-muted-foreground">
            Determining accessible sections...
          </p>
        </div>
      );
    }

    // Check if user has permission to access the current section
    if (!canAccessSection(userProfileData, activeSection)) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground">
            You don't have permission to access this section.
          </p>
        </div>
      );
    }

    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <Crown className="h-16 w-16 text-primary mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">{t("admin.title")}</h1>
              <p className="text-muted-foreground text-lg mb-8">
                {t("admin.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="group cursor-pointer"
                  onClick={() => handleSectionChange(item.id)}
                >
                  <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all duration-200 hover:border-primary/50 group-hover:scale-105">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <item.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                          {item.label}
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Click to access {item.label.toLowerCase()} section
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
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
        return <AdminTransactions />;
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
      case "commission-settings":
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
      case "revenue-ops":
        return <RevenueOps />;
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

  // Show loading state while user profile/permissions are being prepared
  const profileForAccess =
    (userProfileData as any)?.data?.user ||
    (userProfileData as any)?.data ||
    userProfileData;
  const permissionsNotReady =
    !profileForAccess ||
    (!Array.isArray(profileForAccess?.permissions) &&
      profileForAccess?.role !== "super_admin");
  const hasProfileError = !!profileError || !!singleUserDetails.error;

  // Only show spinner when actively loading and no error yet
  if (
    (singleUserDetails.loading || isLoadingProfile) &&
    !singleUserDetails.userDetails &&
    !hasProfileError
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Preparing admin access...</p>
        </div>
      </div>
    );
  }

  // Show error state if user profile failed to load
  if (hasProfileError && !singleUserDetails.userDetails) {
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
                <div
                  className="flex items-center space-x-3 cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
                  onClick={() => {
                    setActiveSection("overview");
                    navigate("/admin");
                  }}
                  title="Return to Admin Overview"
                >
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
                        onClick={() => handleSectionChange(item.id)}
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
                          {activeSection
                            ? menuItems.find(
                                (item) => item.id === activeSection
                              )?.label || activeSection
                            : "Loading..."}
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate hidden sm:block">
                          {activeSection
                            ? `Manage your ${activeSection.replace(
                                "-",
                                " "
                              )} settings`
                            : "Determining accessible sections..."}
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
                        {menuItems.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-64 text-center">
                            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                              No Access
                            </h3>
                            <p className="text-muted-foreground">
                              You don't have permission to access any admin
                              sections. Please contact your administrator.
                            </p>
                          </div>
                        ) : (
                          renderSection()
                        )}
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
