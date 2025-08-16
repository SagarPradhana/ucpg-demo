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
import { DollarSign, PieChart, Activity, TrendingUp } from "lucide-react";
import {
  getAdminTransactions,
  getAdminCommissionIncome,
  getAdminCurrencyDistribution,
  getAdminUnclaimedFunds,
} from "@/service/adminservices";

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

  const commissionTotal = (commissionIncomeResp as any)?.data?.total ?? 0;

  const distItems: Array<{ name: string; value: number; color?: string }> =
    Array.isArray((currencyDistributionResp as any)?.data)
      ? (currencyDistributionResp as any).data
      : [];

  const claimed = (fundsResp as any)?.data?.claimed ?? 0;
  const unclaimed = (fundsResp as any)?.data?.unclaimed ?? 0;

  return (
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
                  ${commissionTotal?.toLocaleString?.() ?? commissionTotal}
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
                  ${claimed?.toLocaleString?.() ?? claimed}
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
                <p className="text-sm text-muted-foreground">Unclaimed Funds</p>
                <p className="text-2xl font-bold">
                  ${unclaimed?.toLocaleString?.() ?? unclaimed}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Currency Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" /> Currency Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isDistLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : distItems.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No data for selected range.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {distItems.map((d, i) => (
                <Badge key={`${d.name}-${i}`} variant="outline">
                  {d.name}: {d.value}
                </Badge>
              ))}
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
              ${commissionTotal?.toLocaleString?.() ?? commissionTotal}
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
                ${claimed?.toLocaleString?.() ?? claimed}
              </div>
            )}
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Unclaimed</div>
            {isFundsLoading ? (
              <Skeleton className="h-6 w-48" />
            ) : (
              <div className="text-lg font-semibold">
                ${unclaimed?.toLocaleString?.() ?? unclaimed}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueOps;
