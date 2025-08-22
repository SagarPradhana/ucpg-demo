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
  QrCode,
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

// RevenueOps dashboard: time-filtered view of dashboard metrics excluding audit logs
const RevenueOps: React.FC = () => {
  // Use the same epoch-based presets as Reports (e.g., Today, Last 7 Days)
  const timeFilter = useTimeFilter({ mode: "epoch", defaultValue: "Today" });

  // Compute epoch seconds for API from selected preset label
  const from_date = timeFilter.epochRange.from_date;
  const to_date = timeFilter.epochRange.to_date;

  // Pagination for transactions list
  const txPagination = usePagination({ initialPage: 1, pageSize: 10 });

  // Queries
  const { data: txResp, isLoading: isTxLoading } = useQuery({
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

  const { data: commissionIncomeResp, isLoading: isCommissionLoading } =
    useQuery({
      queryKey: ["revops-commission-income", from_date, to_date],
      queryFn: () => getAdminCommissionIncome({ from_date, to_date }),
      gcTime: 60000,
      staleTime: 60000,
    });

  const { data: currencyDistributionResp, isLoading: isDistLoading } = useQuery(
    {
      queryKey: ["revops-currency-distribution", from_date, to_date],
      queryFn: () => getAdminCurrencyDistribution({ from_date, to_date }),
      gcTime: 60000,
      staleTime: 60000,
    }
  );

  const { data: fundsResp, isLoading: isFundsLoading } = useQuery({
    queryKey: ["revops-funds", from_date, to_date],
    queryFn: () => getAdminUnclaimedFunds({ from_date, to_date }),
    gcTime: 60000,
    staleTime: 60000,
  });

  const { data: promoLinksActive } = useQuery({
    queryKey: ["revops-promo-links-active", from_date, to_date],
    queryFn: () => getAdminPromoLinksActive({ from_date, to_date }),
    gcTime: 60000,
    staleTime: 60000,
  });

  const { data: promoLinksUsed } = useQuery({
    queryKey: ["revops-promo-links-used", from_date, to_date],
    queryFn: () => getAdminPromoLinksUsed({ from_date, to_date }),
    gcTime: 60000,
    staleTime: 60000,
  });

  // Derive totals and lists
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

  // Helper function to safely extract numeric values
  const safeNumber = (value: any): number => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Debug logging to understand API response structure
  React.useEffect(() => {
    if (commissionIncomeResp) {
      console.log("Commission Income Response:", commissionIncomeResp);
    }
    if (fundsResp) {
      console.log("Funds Response:", fundsResp);
    }
    if (currencyDistributionResp) {
      console.log("Currency Distribution Response:", currencyDistributionResp);
    }
  }, [commissionIncomeResp, fundsResp, currencyDistributionResp]);

  const commissionTotal = safeNumber(
    (commissionIncomeResp as any)?.data?.total ??
      (commissionIncomeResp as any)?.total ??
      0
  );

  // Map API response (by_currency/by_crypto) to a flat list for display
  const distItems: Array<{ name: string; value: number; color?: string }> =
    (() => {
      const resp = currencyDistributionResp as any;
      const data = resp?.data;
      if (!data) return [];

      // Prefer by_currency; fallback to by_crypto
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

  // Color mapping similar to Admin page (use function declaration for hoisting)
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

  const claimed = safeNumber(
    (fundsResp as any)?.data?.claimed ?? (fundsResp as any)?.claimed ?? 0
  );
  const unclaimed = safeNumber(
    (fundsResp as any)?.data?.unclaimed ?? (fundsResp as any)?.unclaimed ?? 0
  );

  return (
    <PermissionGuard
      section="revenue-ops"
      fallback={
        <div className="text-sm text-muted-foreground">Access denied</div>
      }
      showFallback
    >
      <div className="space-y-6">
        {/* Header + Time Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xl font-semibold">Revenue Operations</h2>
          <div className="w-full sm:w-auto">
            <TimeFilter
              mode="epoch"
              value={timeFilter.value}
              onChange={timeFilter.handleEpochChange}
              epochRange={timeFilter.epochRange}
              onEpochRangeChange={() => {
                /* epochRange is derived from label via hook */
              }}
              label="Time Range"
              placeholder="Select time range"
              variant="compact"
              showIcon={true}
            />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Transactions
                  </p>
                  <p className="text-2xl font-bold">{txTotal}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Commission Income
                  </p>
                  <p className="text-2xl font-bold">
                    $
                    {typeof commissionTotal === "number"
                      ? commissionTotal.toLocaleString()
                      : commissionTotal}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Claimed Funds</p>
                  <p className="text-2xl font-bold">
                    $
                    {typeof claimed === "number"
                      ? claimed.toLocaleString()
                      : claimed}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Unclaimed Funds
                  </p>
                  <p className="text-2xl font-bold">
                    $
                    {typeof unclaimed === "number"
                      ? unclaimed.toLocaleString()
                      : unclaimed}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Promo Codes (Active/Used) */}
        <Card className="border-l-4 border-l-teal-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Promo Codes
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  {/* Active Promo Links */}
                  <div className="rounded-xl p-4 bg-white/70 border shadow-sm">
                    <div className="text-xs text-muted-foreground mb-1">
                      Active Promo Links
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl sm:text-3xl font-bold text-teal-700">
                        {(() => {
                          const d: any = promoLinksActive as any;
                          if (!d) return 0;
                          const num = (x: any) => {
                            if (typeof x === "number") return x;
                            if (typeof x === "string") {
                              const n = parseInt(x, 10);
                              return Number.isNaN(n) ? 0 : n;
                            }
                            return 0;
                          };
                          const v: any = (d as any)?.data ?? d;
                          if (typeof v === "number" || typeof v === "string")
                            return num(v);
                          if (Array.isArray(v)) return v.length;
                          if (
                            v &&
                            (typeof v?.count === "number" ||
                              typeof v?.count === "string")
                          )
                            return num(v.count);
                          if (
                            v &&
                            (typeof v?.active === "number" ||
                              typeof v?.active === "string")
                          )
                            return num(v.active);
                          if (
                            v &&
                            (typeof v?.active_links === "number" ||
                              typeof v?.active_links === "string")
                          )
                            return num(v.active_links);
                          if (
                            typeof (d as any)?.count === "number" ||
                            typeof (d as any)?.count === "string"
                          )
                            return num((d as any).count);
                          return 0;
                        })()}
                      </p>
                      <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                        <QrCode className="h-5 w-5 text-teal-700" />
                      </div>
                    </div>
                  </div>

                  {/* Used Promo Links */}
                  <div className="rounded-xl p-4 bg-white/70 border shadow-sm">
                    <div className="text-xs text-muted-foreground mb-1">
                      Used Promo Links
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl sm:text-3xl font-bold text-amber-700">
                        {(() => {
                          const d: any = promoLinksUsed as any;
                          if (!d) return 0;
                          const num = (x: any) => {
                            if (typeof x === "number") return x;
                            if (typeof x === "string") {
                              const n = parseInt(x, 10);
                              return Number.isNaN(n) ? 0 : n;
                            }
                            return 0;
                          };
                          const v: any = (d as any)?.data ?? d;
                          if (typeof v === "number" || typeof v === "string")
                            return num(v);
                          if (Array.isArray(v)) return v.length;
                          if (
                            v &&
                            (typeof v?.count === "number" ||
                              typeof v?.count === "string")
                          )
                            return num(v.count);
                          if (
                            v &&
                            (typeof v?.used === "number" ||
                              typeof v?.used === "string")
                          )
                            return num(v.used);
                          if (
                            v &&
                            (typeof v?.used_links === "number" ||
                              typeof v?.used_links === "string")
                          )
                            return num(v.used_links);
                          if (
                            typeof (d as any)?.count === "number" ||
                            typeof (d as any)?.count === "string"
                          )
                            return num((d as any).count);
                          return 0;
                        })()}
                      </p>
                      <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <QrCode className="h-5 w-5 text-amber-700" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Currency Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" /> Currency Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isDistLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : distItems.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No data for selected range.
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distItems}
                      cx="50%"
                      cy="50%"
                      outerRadius="70%"
                      innerRadius="45%"
                      dataKey="value"
                      paddingAngle={3}
                      cornerRadius={6}
                      animationBegin={0}
                      animationDuration={1200}
                      animationEasing="ease-out"
                    >
                      {distItems.map((entry, index) => (
                        <Cell
                          key={`dist-cell-${index}`}
                          fill={
                            entry.color || getCurrencyColor(entry.name, index)
                          }
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [
                        String(value),
                        name as string,
                      ]}
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isTxLoading ? (
                    Array.from({ length: txPagination.pageSize }).map(
                      (_, idx) => (
                        <TableRow key={`tx-skel-${idx}`}>
                          <TableCell colSpan={5}>
                            <Skeleton className="h-6 w-full" />
                          </TableCell>
                        </TableRow>
                      )
                    )
                  ) : txItems.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-sm text-muted-foreground py-6"
                      >
                        No data available.
                      </TableCell>
                    </TableRow>
                  ) : (
                    txItems.map((tx: any) => (
                      <TableRow key={tx?.id}>
                        <TableCell className="font-mono text-xs">
                          {tx?.id}
                        </TableCell>
                        <TableCell>
                          {new Date(
                            (tx?.created_date ?? 0) * 1000
                          ).toLocaleString()}
                        </TableCell>
                        <TableCell>{tx?.amount}</TableCell>
                        <TableCell>{tx?.currency}</TableCell>
                        <TableCell>{tx?.transaction_status}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {txTotal > 0 && (
              <CommonPagination
                currentPage={txPagination.currentPage}
                totalPages={txPagination.totalPages}
                totalItems={txTotal}
                pageSize={txPagination.pageSize}
                onPageChange={txPagination.setCurrentPage}
              />
            )}
          </CardContent>
        </Card>

        {/* Commission Income */}
        <Card>
          <CardHeader>
            <CardTitle>Commission Income</CardTitle>
          </CardHeader>
          <CardContent>
            {isCommissionLoading ? (
              <Skeleton className="h-6 w-48" />
            ) : (
              <div className="text-lg font-semibold">
                $
                {typeof commissionTotal === "number"
                  ? commissionTotal.toLocaleString()
                  : commissionTotal}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Claimed / Unclaimed Funds */}
        <Card>
          <CardHeader>
            <CardTitle>Funds</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Claimed</div>
              {isFundsLoading ? (
                <Skeleton className="h-6 w-48" />
              ) : (
                <div className="text-lg font-semibold">
                  $
                  {typeof claimed === "number"
                    ? claimed.toLocaleString()
                    : claimed}
                </div>
              )}
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                Unclaimed
              </div>
              {isFundsLoading ? (
                <Skeleton className="h-6 w-48" />
              ) : (
                <div className="text-lg font-semibold">
                  $
                  {typeof unclaimed === "number"
                    ? unclaimed.toLocaleString()
                    : unclaimed}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
};

export default RevenueOps;
