import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeFilter } from "@/components/ui/time-filter";
import { useTimeFilter } from "@/hooks/useTimeFilter";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CommonPagination from "@/components/ui/common-pagination";
import { usePagination } from "@/hooks/usePagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  PieChart as PieChartIcon,
  Activity,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import {
  getAdminTransactions,
  getAdminCommissionIncome,
  getAdminCurrencyDistribution,
  getAdminUnclaimedFunds,
  getAdminPromoLinksActive,
  getAdminPromoLinksUsed,
} from "@/service/adminservices";
import { PermissionGuard } from "@/components/PermissionGuard";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { EnhancedKPICard } from "./revenue-ops/EnhancedKPICard";
import { PromoMetrics } from "./revenue-ops/PromoMetrics";

// RevenueOps dashboard: Enhanced UI with improved data visualization and user experience
const RevenueOps: React.FC = () => {
  const timeFilter = useTimeFilter({ mode: "epoch", defaultValue: "Today" });
  const from_date = timeFilter.epochRange.from_date;
  const to_date = timeFilter.epochRange.to_date;
  const txPagination = usePagination({ initialPage: 1, pageSize: 10 });

  // Queries
  const {
    data: txResp,
    isLoading: isTxLoading,
    refetch: refetchTx,
  } = useQuery({
    queryKey: [
      "revops-transactions",
      from_date,
      to_date,
      txPagination.currentPage,
      txPagination.pageSize,
    ],
    queryFn: () =>
      getAdminTransactions({
        date_from: from_date,
        date_to: to_date,
        page: txPagination.currentPage,
        limit: txPagination.pageSize,
      }),
    gcTime: 60000,
    staleTime: 60000,
  });

  const {
    data: commissionIncomeResp,
    isLoading: isCommissionLoading,
    refetch: refetchCommission,
  } = useQuery({
    queryKey: ["revops-commission-income", from_date, to_date],
    queryFn: () => getAdminCommissionIncome({ from_date, to_date }),
    gcTime: 60000,
    staleTime: 60000,
  });

  const {
    data: currencyDistributionResp,
    isLoading: isDistLoading,
    refetch: refetchDistribution,
  } = useQuery({
    queryKey: ["revops-currency-distribution", from_date, to_date],
    queryFn: () => getAdminCurrencyDistribution({ from_date, to_date }),
    gcTime: 60000,
    staleTime: 60000,
  });

  const {
    data: fundsResp,
    isLoading: isFundsLoading,
    refetch: refetchFunds,
  } = useQuery({
    queryKey: ["revops-funds", from_date, to_date],
    queryFn: () => getAdminUnclaimedFunds({ from_date, to_date }),
    gcTime: 60000,
    staleTime: 60000,
  });

  const { data: promoLinksActive, refetch: refetchPromoActive } = useQuery({
    queryKey: ["revops-promo-links-active", from_date, to_date],
    queryFn: () => getAdminPromoLinksActive({ from_date, to_date }),
    gcTime: 60000,
    staleTime: 60000,
  });

  const { data: promoLinksUsed, refetch: refetchPromoUsed } = useQuery({
    queryKey: ["revops-promo-links-used", from_date, to_date],
    queryFn: () => getAdminPromoLinksUsed({ from_date, to_date }),
    gcTime: 60000,
    staleTime: 60000,
  });

  // Data processing
  const txItems: any[] = Array.isArray((txResp as any)?.data)
    ? (txResp as any).data
    : Array.isArray(txResp)
    ? (txResp as any)
    : [];
  const txTotal = (txResp as any)?.total_count ?? txItems.length ?? 0;

  React.useEffect(() => {
    if (typeof txTotal === "number") {
      txPagination.setTotalItems(txTotal);
    }
  }, [txTotal, txPagination]);

  const safeNumber = (value: any): number => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const commissionTotal = safeNumber(
    (commissionIncomeResp as any)?.data?.total ??
      (commissionIncomeResp as any)?.total ??
      0
  );

  const claimed = safeNumber(
    (fundsResp as any)?.data?.claimed ?? (fundsResp as any)?.claimed ?? 0
  );
  const unclaimed = safeNumber(
    (fundsResp as any)?.data?.unclaimed ?? (fundsResp as any)?.unclaimed ?? 0
  );

  // Currency distribution processing
  const distItems: Array<{ name: string; value: number; color?: string }> =
    (() => {
      const resp = currencyDistributionResp as any;
      const data = resp?.data;
      if (!data) return [];

      const byCurrency = Array.isArray(data.by_currency)
        ? data.by_currency
        : [];
      const byCrypto = Array.isArray(data.by_crypto) ? data.by_crypto : [];

      const items = (byCurrency.length > 0 ? byCurrency : byCrypto).map(
        (it: any, index: number) => ({
          name: it.currency ?? it.crypto,
          value:
            typeof it.total_amount === "number"
              ? it.total_amount
              : it.count ?? 0,
          color: getCurrencyColor(it.currency ?? it.crypto, index),
        })
      );

      return items;
    })();

  function getCurrencyColor(currency: string, index: number): string {
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
  }

  // Helper function to get transaction type badge variant
  const getTransactionTypeBadgeVariant = (type: string) => {
    switch (type?.toLowerCase()) {
      case "deposit":
        return "default";
      case "withdrawal":
        return "secondary";
      case "transfer":
        return "outline";
      case "commission":
        return "default";
      default:
        return "outline";
    }
  };

  // Helper function to get payment method badge variant
  const getPaymentMethodBadgeVariant = (method: string) => {
    switch (method?.toLowerCase()) {
      case "crypto":
      case "bitcoin":
      case "ethereum":
        return "default";
      case "bank_transfer":
      case "wire":
        return "secondary";
      case "card":
      case "credit_card":
      case "debit_card":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <PermissionGuard
      section="revenue-ops"
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-3">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <div className="text-lg font-medium text-muted-foreground">
              Access Denied
            </div>
            <div className="text-sm text-muted-foreground">
              You don't have permission to view revenue operations.
            </div>
          </div>
        </div>
      }
      showFallback
    >
      <div className="space-y-8 p-1">
        {/* Enhanced Header */}
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Revenue Operations
              </h1>
              <p className="text-muted-foreground">
                Monitor and analyze your revenue metrics, transactions, and
                promotional campaigns
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <TimeFilter
                mode="epoch"
                value={timeFilter.value}
                onChange={timeFilter.handleEpochChange}
                epochRange={timeFilter.epochRange}
                onEpochRangeChange={() => {}}
                label="Time Range"
                placeholder="Select time range"
                variant="compact"
                showIcon={true}
              />
            </div>
          </div>
        </div>

        {/* Enhanced KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <EnhancedKPICard
            title="Total Transactions"
            value={txTotal}
            icon={Activity}
            color="blue"
            isLoading={isTxLoading}
            subtitle="All time transactions"
          />

          <EnhancedKPICard
            title="Commission Income"
            value={`$${
              typeof commissionTotal === "number"
                ? commissionTotal.toLocaleString()
                : commissionTotal
            }`}
            icon={DollarSign}
            color="green"
            isLoading={isCommissionLoading}
            subtitle="Total earnings"
          />

          <EnhancedKPICard
            title="Claimed Funds"
            value={`$${
              typeof claimed === "number" ? claimed.toLocaleString() : claimed
            }`}
            icon={TrendingUp}
            color="purple"
            isLoading={isFundsLoading}
            subtitle="Successfully processed"
          />

          <EnhancedKPICard
            title="Unclaimed Funds"
            value={`$${
              typeof unclaimed === "number"
                ? unclaimed.toLocaleString()
                : unclaimed
            }`}
            icon={TrendingUp}
            color="orange"
            isLoading={isFundsLoading}
            subtitle="Pending claims"
          />
        </div>

        {/* Enhanced Promo Metrics */}
        <PromoMetrics
          activeLinks={promoLinksActive}
          usedLinks={promoLinksUsed}
          isLoading={false}
        />

        {/* Charts and Tables Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Currency Distribution - Takes 2 columns on xl screens */}
          <div className="xl:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-indigo-600" />
                  Currency Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isDistLoading ? (
                  <Skeleton className="h-80 w-full" />
                ) : distItems.length === 0 ? (
                  <div className="flex items-center justify-center h-80 text-center">
                    <div className="space-y-3">
                      <PieChartIcon className="h-12 w-12 text-muted-foreground mx-auto" />
                      <div className="text-sm text-muted-foreground">
                        No data available for the selected time range
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={distItems}
                          cx="50%"
                          cy="50%"
                          outerRadius="75%"
                          innerRadius="45%"
                          dataKey="value"
                          paddingAngle={2}
                          cornerRadius={8}
                          animationBegin={0}
                          animationDuration={1000}
                          animationEasing="ease-out"
                        >
                          {distItems.map((entry, index) => (
                            <Cell
                              key={`dist-cell-${index}`}
                              fill={
                                entry.color ||
                                getCurrencyColor(entry.name, index)
                              }
                              stroke="#fff"
                              strokeWidth={3}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [
                            typeof value === "number"
                              ? value.toLocaleString()
                              : String(value),
                            name as string,
                          ]}
                          contentStyle={{
                            borderRadius: "12px",
                            backgroundColor: "rgba(255, 255, 255, 0.98)",
                            boxShadow:
                              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                            border: "none",
                            padding: "12px 16px",
                            fontSize: "14px",
                          }}
                        />
                        <Legend
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                          iconSize={14}
                          iconType="circle"
                          wrapperStyle={{
                            fontSize: "13px",
                            paddingTop: "20px",
                            fontWeight: 500,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary Stats - Takes 1 column */}
          <div className="space-y-6">
            {/* Commission Income Detail */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Commission Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isCommissionLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-3xl font-bold text-green-700">
                      $
                      {typeof commissionTotal === "number"
                        ? commissionTotal.toLocaleString()
                        : commissionTotal}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total commission earned in selected period
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Average per day:
                        </span>
                        <span className="font-medium">
                          ${Math.round(commissionTotal / 7).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Funds Breakdown */}
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Funds Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isFundsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <div className="text-sm font-medium text-green-800">
                          Claimed
                        </div>
                        <div className="text-xs text-green-600">
                          Successfully processed
                        </div>
                      </div>
                      <div className="text-xl font-bold text-green-700">
                        $
                        {typeof claimed === "number"
                          ? claimed.toLocaleString()
                          : claimed}
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div>
                        <div className="text-sm font-medium text-orange-800">
                          Unclaimed
                        </div>
                        <div className="text-xs text-orange-600">
                          Pending processing
                        </div>
                      </div>
                      <div className="text-xl font-bold text-orange-700">
                        $
                        {typeof unclaimed === "number"
                          ? unclaimed.toLocaleString()
                          : unclaimed}
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Total funds:
                        </span>
                        <span className="font-medium">
                          ${(claimed + unclaimed).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-muted-foreground">
                          Claim rate:
                        </span>
                        <span className="font-medium">
                          {claimed + unclaimed > 0
                            ? `${(
                                (claimed / (claimed + unclaimed)) *
                                100
                              ).toFixed(1)}%`
                            : "0%"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Transactions Table */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">
                      Transaction ID
                    </TableHead>
                    <TableHead className="font-semibold">Date & Time</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Currency</TableHead>
                    <TableHead className="font-semibold">
                      Transaction Type
                    </TableHead>
                    <TableHead className="font-semibold">
                      Payment Method
                    </TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isTxLoading ? (
                    Array.from({ length: txPagination.pageSize }).map(
                      (_, idx) => (
                        <TableRow key={`tx-skel-${idx}`}>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-20" />
                          </TableCell>
                        </TableRow>
                      )
                    )
                  ) : txItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="space-y-3">
                          <Activity className="h-12 w-12 text-muted-foreground mx-auto" />
                          <div className="text-lg font-medium text-muted-foreground">
                            No transactions found
                          </div>
                          <div className="text-sm text-muted-foreground">
                            No transactions available for the selected time
                            range
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    txItems.map((tx: any, index: number) => (
                      <TableRow
                        key={tx?.id || `tx-${index}`}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="font-mono text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            {tx?.transaction_name || tx?.id || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="space-y-1">
                            <div className="font-medium">
                              {tx?.created_date
                                ? new Date(
                                    tx.created_date * 1000
                                  ).toLocaleDateString()
                                : "N/A"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {tx?.created_date
                                ? new Date(
                                    tx.created_date * 1000
                                  ).toLocaleTimeString()
                                : "N/A"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {tx?.net_amount || tx?.amount || "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium">
                            {tx?.currency || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getTransactionTypeBadgeVariant(
                              tx?.transaction_type || tx?.type
                            )}
                            className="capitalize font-medium"
                          >
                            {tx?.transaction_type || tx?.type || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getPaymentMethodBadgeVariant(
                              tx?.payment_method || tx?.method
                            )}
                            className="capitalize font-medium"
                          >
                            {tx?.payment_method || tx?.method || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              tx?.transaction_status === "completed" ||
                              tx?.status === "completed"
                                ? "default"
                                : tx?.transaction_status === "pending" ||
                                  tx?.status === "pending"
                                ? "secondary"
                                : tx?.transaction_status === "failed" ||
                                  tx?.status === "failed"
                                ? "destructive"
                                : "outline"
                            }
                            className="capitalize"
                          >
                            {tx?.transaction_status || tx?.status || "Unknown"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {txTotal > 0 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing{" "}
                  {(txPagination.currentPage - 1) * txPagination.pageSize + 1}{" "}
                  to{" "}
                  {Math.min(
                    txPagination.currentPage * txPagination.pageSize,
                    txTotal
                  )}{" "}
                  of {txTotal} transactions
                </div>
                <CommonPagination
                  currentPage={txPagination.currentPage}
                  totalPages={txPagination.totalPages}
                  totalItems={txTotal}
                  pageSize={txPagination.pageSize}
                  onPageChange={txPagination.setCurrentPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
};

export default RevenueOps;
