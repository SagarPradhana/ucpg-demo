import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Coins,
  Send,
  Download,
  History,
  Settings,
  LogOut,
  TrendingUp,
  Shield,
  Globe,
  Copy,
  QrCode,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Menu,
  MoreVertical,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  CreditCard,
  Link,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Clock,
  User,
  Network,
  Upload,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSelector, useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { useMutation } from "@tanstack/react-query";
import { loginActions } from "@/store/loginReducer";
import { Input } from "@/components/ui/input";

import { RootState } from "@/types";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import UserProfile from "@/components/UserProfile";
import { debugToken } from "@/utils/debugToken";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const userProfile = useSelector((store: RootState) => store.auth.userDetails);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("overview");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [totalBalance, setTotalBalance] = useState(2350.0);
  const [activePayments, setActivePayments] = useState(7);
  const [pendingCount, setPendingCount] = useState(3);
  const [balanceChange, setBalanceChange] = useState(12.5);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [expandedTransaction, setExpandedTransaction] = useState<number | null>(
    null
  );
  const [isActionProcessing, setIsActionProcessing] = useState<string | null>(
    null
  );

  // Mock API for refreshing balance data
  const mockRefreshBalance = (): Promise<{
    totalBalance: number;
    activePayments: number;
    pendingCount: number;
    balanceChange: number;
  }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const variation = (Math.random() - 0.5) * 100;
        const newBalance = Math.max(1000, totalBalance + variation);
        const newPayments = Math.max(
          1,
          activePayments + Math.floor((Math.random() - 0.5) * 3)
        );
        const newPending = Math.max(0, Math.floor(Math.random() * 5));
        const newChange = ((newBalance - totalBalance) / totalBalance) * 100;

        resolve({
          totalBalance: Number(newBalance.toFixed(2)),
          activePayments: newPayments,
          pendingCount: newPending,
          balanceChange: Number(newChange.toFixed(1)),
        });
      }, 1000);
    });
  };

  // Refresh balance mutation
  const refreshBalanceMutation = useMutation({
    mutationFn: () => mockRefreshBalance(),
    onSuccess: (result: {
      totalBalance: number;
      activePayments: number;
      pendingCount: number;
      balanceChange: number;
    }) => {
      setTotalBalance(result.totalBalance);
      setActivePayments(result.activePayments);
      setPendingCount(result.pendingCount);
      setBalanceChange(result.balanceChange);
      setLastUpdated(new Date());

      toast({
        title: "Data Refreshed",
        description: "Balance and transactions updated successfully",
      });
    },
    onError: (error) => {
      console.error("Refresh failed:", error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const token = localStorage.getItem("sessionToken");
    if (!token) {
      navigate("/login");
    } else {
      setSessionToken(token);
    }
  }, [navigate]);

  // Load user data from token when component mounts if Redux state is empty
  useEffect(() => {
    const loadUserFromToken = () => {
      // If userProfile is already loaded, don't reload
      if (userProfile) return;

      const token = localStorage.getItem("sessionToken");
      if (token) {
        try {
          const decodedUser = jwtDecode<any>(token);

          // Check if token is still valid
          const currentTime = Date.now() / 1000;
          if (decodedUser.exp > currentTime) {
            // Dispatch user details to Redux store
            dispatch(loginActions.setUserDetails(decodedUser));
          } else {
            // Token is expired, remove it
            localStorage.removeItem("sessionToken");
            navigate("/login");
          }
        } catch (error) {
          console.error("Error decoding token:", error);
          localStorage.removeItem("sessionToken");
          navigate("/login");
        }
      }
    };

    loadUserFromToken();

    // Debug token info in development
    if (import.meta.env.MODE === "development") {
      debugToken();
    }
  }, [dispatch, navigate, userProfile]);

  // Auto-update balance every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!refreshBalanceMutation.isPending) {
        refreshBalanceMutation.mutate();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshBalanceMutation]);

  const handleRefresh = () => {
    refreshBalanceMutation.mutate();
  };

  // Mock API for quick actions
  const mockQuickAction = (
    action: string
  ): Promise<{ action: string; redirectTo: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ action, redirectTo: `/${action}` });
      }, 500);
    });
  };

  // Quick action mutation
  const quickActionMutation = useMutation({
    mutationFn: (action: string) => mockQuickAction(action),
    onSuccess: (result: { action: string; redirectTo: string }) => {
      navigate(result.redirectTo);
      setIsActionProcessing(null);
    },
    onError: (error) => {
      console.error("Quick action failed:", error);
      setIsActionProcessing(null);
      toast({
        title: "Action Failed",
        description: "Failed to navigate. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Quick Action handlers with feedback
  const handleQuickAction = (action: string) => {
    setIsActionProcessing(action);
    quickActionMutation.mutate(action);
  };

  const toggleTransactionDetails = (txId: number) => {
    setExpandedTransaction(expandedTransaction === txId ? null : txId);
  };

  const mockTransactions = [
    {
      id: 1,
      type: "received",
      amount: "0.0045 BTC",
      fiat: "$180.00 USD",
      status: "completed",
      time: "2 min ago",
      sender: "anonymous-abc123@example.com",
      recipient: "Your Wallet",
      transactionHash: "0x1234567890abcdef",
      network: "Bitcoin",
      fee: "$0.25 USD",
    },
    {
      id: 2,
      type: "sent",
      amount: "0.0023 ETH",
      fiat: "$95.50 EUR",
      status: "pending",
      time: "1 hour ago",
      sender: "Your Wallet",
      recipient: "anonymous-xyz789@example.com",
      transactionHash: "0xabcdef1234567890",
      network: "Ethereum",
      fee: "$1.45 EUR",
    },
    {
      id: 3,
      type: "received",
      amount: "0.0156 BTC",
      fiat: "$625.00 GBP",
      status: "completed",
      time: "3 hours ago",
      sender: "anonymous-def456@example.com",
      recipient: "Your Wallet",
      transactionHash: "0x567890abcdef1234",
      network: "Bitcoin",
      fee: "$0.85 GBP",
    },
  ];

  const walletAddress = "1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S";

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    // Removed non-API copy toast
  };

  const [paymentAmount, setPaymentAmount] = useState("");
  const [localCurrency, setLocalCurrency] = useState("USD");
  const [cryptoCurrency, setCryptoCurrency] = useState("USDT");
  const [paymentLink, setPaymentLink] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [convertedAmount, setConvertedAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState("idle"); // idle, processing, completed
  const [singleUseLink, setSingleUseLink] = useState("");
  const [singleUseQR, setSingleUseQR] = useState("");
  const [transactionId, setTransactionId] = useState("");

  // Mock exchange rates (in real app, this would come from an API)
  const exchangeRates = {
    USD: { USDT: 1, BTC: 0.000023, ETH: 0.0004 },
    EUR: { USDT: 1.08, BTC: 0.000025, ETH: 0.00043 },
    UZS: { USDT: 0.000082, BTC: 0.0000000019, ETH: 0.000000033 },
    KZT: { USDT: 0.0021, BTC: 0.000000048, ETH: 0.00000084 },
    GBP: { USDT: 1.26, BTC: 0.000029, ETH: 0.0005 },
  };

  const calculateConversion = (amount: string) => {
    if (!amount || isNaN(Number(amount))) {
      setConvertedAmount("");
      return;
    }

    const rate =
      exchangeRates[localCurrency as keyof typeof exchangeRates]?.[
        cryptoCurrency as keyof typeof exchangeRates.USD
      ] || 1;
    const converted = Number(amount) * rate;
    setConvertedAmount(converted.toFixed(8));
    setExchangeRate(rate);
  };

  const generateAnonymousContactInfo = () => {
    const contactId = Math.random().toString(36).substr(2, 9);
    return `anonymous-${contactId}@example.com`;
  };

  const handleSendPayment = async () => {
    if (!paymentAmount || !convertedAmount) {
      // Removed non-API validation toast - this is client-side validation
      return;
    }

    setPaymentStatus("processing");

    // Simulate payment processing
    const newTransactionId = Math.random()
      .toString(36)
      .substr(2, 12)
      .toUpperCase();
    setTransactionId(newTransactionId);

    // Simulate processing delay
    setTimeout(() => {
      // Generate single-use link and QR code
      const singleUseId = Math.random().toString(36).substr(2, 16);
      const link = `${window.location.origin}/claim/${singleUseId}`;
      const qrData = JSON.stringify({
        id: singleUseId,
        amount: convertedAmount,
        currency: cryptoCurrency,
        expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        singleUse: true,
      });

      setSingleUseLink(link);
      setSingleUseQR(qrData);
      setPaymentStatus("completed");

      const anonymousContact = generateAnonymousContactInfo();

      // Removed mock payment completion toast - not a real API call
    }, 3000);
  };

  const copySingleUseLink = () => {
    navigator.clipboard.writeText(singleUseLink);
    // Removed non-API copy toast
  };

  const mockStatistics = {
    totalCommissionToday: 250.75,
    incomeLastWeek: [
      { day: "Mon", amount: 120 },
      { day: "Tue", amount: 200 },
      { day: "Wed", amount: 150 },
      { day: "Thu", amount: 300 },
      { day: "Fri", amount: 250 },
      { day: "Sat", amount: 180 },
      { day: "Sun", amount: 220 },
    ],
    topProviders: [
      { name: "Provider A", commission: 500 },
      { name: "Provider B", commission: 450 },
      { name: "Provider C", commission: 400 },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Coins className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{t("dashboard.title")}</h1>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshBalanceMutation.isPending}
              className="flex items-center space-x-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshBalanceMutation.isPending ? "animate-spin" : ""
                }`}
              />
              <span className="hidden sm:inline">
                {refreshBalanceMutation.isPending
                  ? t("common.refreshing")
                  : t("common.refresh")}
              </span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/send")}>
                  <Send className="h-4 w-4 mr-2" />
                  {t("dashboard.send")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/receive")}>
                  <Download className="h-4 w-4 mr-2" />
                  {t("dashboard.receive")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("history")}>
                  <History className="h-4 w-4 mr-2" />
                  {t("dashboard.history")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/services")}>
                  <Settings className="h-4 w-4 mr-2" />
                  {t("dashboard.services")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <UserProfile />
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Anonymity Disclaimer */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              {t("dashboard.anonymityDisclaimer")}
            </p>
          </CardContent>
        </Card>

        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Total Balance Card */}
          <Card className="animate-fade-in border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base font-bold text-green-700 dark:text-green-400">
                {t("dashboard.totalBalance")}
              </CardTitle>
              <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                <Wallet className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-extrabold text-green-600 dark:text-green-400">
                ${totalBalance.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground flex items-center space-x-1">
                <TrendingUp className="h-3 w-3" />
                <span
                  className={`font-semibold ${
                    balanceChange >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {balanceChange >= 0 ? "+" : ""}
                  {balanceChange}%
                </span>
                <span>{t("dashboard.fromLastMonth")}</span>
              </p>
            </CardContent>
          </Card>

          {/* Active Payments Card */}
          <Card className="animate-fade-in border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base font-bold text-blue-700 dark:text-blue-400">
                {t("dashboard.activePayments")}
              </CardTitle>
              <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                {activePayments}
              </div>
              <p className="text-sm text-muted-foreground flex items-center space-x-1">
                <AlertCircle className="h-3 w-3" />
                <span className="bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-full text-xs font-semibold">
                  {pendingCount} {t("dashboard.pendingConfirmations")}
                </span>
              </p>
            </CardContent>
          </Card>

          {/* Countries Served Card */}
          <Card className="animate-fade-in border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base font-bold text-purple-700 dark:text-purple-400">
                {t("dashboard.countriesServed")}
              </CardTitle>
              <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full">
                <Globe className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
                24
              </div>
              <p className="text-sm text-muted-foreground flex items-center space-x-1">
                <CheckCircle className="h-3 w-3" />
                <span>{t("dashboard.globalCoverage")}</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Last Updated Indicator */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
            <RefreshCw className="h-3 w-3" />
            <span>
              {t("common.lastUpdated")}: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          {/* <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="send">Send</TabsTrigger>
            <TabsTrigger value="receive">Receive</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList> */}

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold">
                    {t("dashboard.quickActions")}
                  </CardTitle>
                  <CardDescription>
                    {t("dashboard.quickActionsDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Button
                    className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                    onClick={() => handleQuickAction("send")}
                    disabled={isActionProcessing === "send"}
                  >
                    {isActionProcessing === "send" ? (
                      <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5 mr-3" />
                    )}
                    <span className="text-base">
                      {t("dashboard.sendPayment")}
                    </span>
                  </Button>

                  <Button
                    className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                    onClick={() => handleQuickAction("receive")}
                    disabled={isActionProcessing === "receive"}
                  >
                    {isActionProcessing === "receive" ? (
                      <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    ) : (
                      <Download className="h-5 w-5 mr-3" />
                    )}
                    <span className="text-base">
                      {t("dashboard.requestPayment")}
                    </span>
                  </Button>

                  <Button
                    className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                    onClick={() => handleQuickAction("services")}
                    disabled={isActionProcessing === "services"}
                  >
                    {isActionProcessing === "services" ? (
                      <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    ) : (
                      <Settings className="h-5 w-5 mr-3" />
                    )}
                    <span className="text-base">{t("dashboard.services")}</span>
                  </Button>
                </CardContent>
              </Card>
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold">
                    {t("dashboard.recentTransactions")}
                  </CardTitle>
                  <CardDescription>
                    {t("transaction.expandDetails")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockTransactions.slice(0, 3).map((tx) => (
                      <div
                        key={tx.id}
                        className="border rounded-lg p-4 transition-all duration-200 hover:shadow-md"
                      >
                        <div
                          className="flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded-md p-2 -m-2 transition-colors"
                          onClick={() => toggleTransactionDetails(tx.id)}
                          aria-label={`${
                            expandedTransaction === tx.id
                              ? "Collapse"
                              : "Expand"
                          } transaction details for ${tx.amount}`}
                        >
                          <div className="flex items-center space-x-4">
                            <div
                              className={`p-3 rounded-full ${
                                tx.type === "received"
                                  ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                                  : "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                              }`}
                            >
                              {tx.type === "received" ? (
                                <Download className="h-5 w-5" />
                              ) : (
                                <Upload className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <p className="text-base font-semibold">
                                {tx.amount}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {tx.fiat} • {tx.network}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <Badge
                                variant={
                                  tx.status === "completed"
                                    ? "default"
                                    : "secondary"
                                }
                                className={
                                  tx.status === "pending"
                                    ? "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                                    : tx.status === "completed"
                                    ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                                    : ""
                                }
                              >
                                {tx.status === "completed"
                                  ? t("transaction.completed")
                                  : tx.status === "pending"
                                  ? t("transaction.pending")
                                  : t(`transaction.${tx.status}`)}
                              </Badge>
                              <p className="text-sm text-muted-foreground mt-1">
                                {tx.time}
                              </p>
                            </div>
                            {expandedTransaction === tx.id ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>

                        {/* Collapsible Transaction Details */}
                        {expandedTransaction === tx.id && (
                          <div className="mt-4 pt-4 border-t space-y-3 animate-in slide-in-from-top-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">
                                    {t("transaction.from")}:
                                  </span>
                                  <span className="text-muted-foreground font-mono text-xs">
                                    {tx.sender}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">
                                    {t("transaction.to")}:
                                  </span>
                                  <span className="text-muted-foreground font-mono text-xs">
                                    {tx.recipient}
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Network className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">
                                    {t("transaction.network")}:
                                  </span>
                                  <span className="text-muted-foreground">
                                    {tx.network}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Coins className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">
                                    {t("transaction.fee")}:
                                  </span>
                                  <span className="text-muted-foreground">
                                    {tx.fee}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 pt-2">
                              <ExternalLink className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {t("transaction.hash")}:
                              </span>
                              <span className="text-muted-foreground font-mono text-xs break-all">
                                {tx.transactionHash}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    tx.transactionHash
                                  );
                                  // Removed non-API copy toast
                                }}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => setActiveTab("history")}
                    >
                      {t("dashboard.viewAllTransactions")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Statistics Section */}
            {/* <StatisticsSection /> */}
          </TabsContent>

          {/* <TabsContent value="send" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Send Payment</CardTitle>
                <CardDescription>
                  Send cryptocurrency anonymously
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendPayment();
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      placeholder="Enter amount"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="localCurrency">Local Currency</Label>
                    <Select
                      value={localCurrency}
                      onValueChange={setLocalCurrency}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="UZS">UZS</SelectItem>
                        <SelectItem value="KZT">KZT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cryptoCurrency">Cryptocurrency</Label>
                    <Select
                      value={cryptoCurrency}
                      onValueChange={setCryptoCurrency}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select cryptocurrency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USDT">USDT</SelectItem>
                        <SelectItem value="BTC">BTC</SelectItem>
                        <SelectItem value="ETH">ETH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">
                    Initiate Anonymous Payment
                  </Button>
                </form>

                {(qrCode || paymentLink) && (
                  <div className="mt-6 space-y-4">
                    <Separator />
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">
                        Payment Details
                      </h3>
                      {qrCode && (
                        <div className="mb-4">
                          <img
                            src={qrCode}
                            alt="Payment QR Code"
                            className="mx-auto"
                          />
                        </div>
                      )}
                      {paymentLink && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Use this link to complete your payment:
                          </p>
                          <div className="flex items-center space-x-2">
                            <Input value={paymentLink} readOnly />
                            <Button
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(paymentLink);
                                // Removed non-API copy toast
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent> */}

          {/* <TabsContent value="receive" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Receive Payment</CardTitle>
                <CardDescription>
                  Generate an anonymous one-time use link or QR code to receive
                  payment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="receiveAmount">Amount</Label>
                  <Input
                    id="receiveAmount"
                    placeholder="Enter amount"
                    value={receiveAmount}
                    onChange={(e) => setReceiveAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receiveCurrency">Currency</Label>
                  <Select
                    value={receiveCurrency}
                    onValueChange={setReceiveCurrency}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="UZS">UZS</SelectItem>
                      <SelectItem value="KZT">KZT</SelectItem>
                      <SelectItem value="BTC">BTC</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={generateReceiveLink} className="w-full">
                  Generate Payment Link
                </Button>
                {receiveLink && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Input value={receiveLink} readOnly />
                      <Button
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(receiveLink);
                          // Removed non-API copy toast
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex justify-center">
                      <QRCodeSVG value={receiveQRCode} size={200} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent> */}

          {/* <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  View all your payment transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-2 rounded-full ${
                            tx.type === "received"
                              ? "bg-green-100 text-green-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {tx.type === "received" ? (
                            <ArrowDownLeft className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{tx.amount}</p>
                          <p className="text-sm text-muted-foreground">
                            {tx.fiat}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            tx.status === "completed" ? "default" : "secondary"
                          }
                        >
                          {tx.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {tx.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent> */}

          {/* <TabsContent value="services">
            <ServicesSection />
          </TabsContent> */}
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
