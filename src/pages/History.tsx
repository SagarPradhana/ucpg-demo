import React, { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/types";
import { useQuery } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CommonPagination from "@/components/ui/common-pagination";
import { usePagination } from "@/hooks/usePagination";
import {
  getUserTransactionsHistory,
  getUserTransactionsStats,
} from "@/service/adminservices";
import { epochRangeForLabel } from "@/utils/timeFilters";
import { epochToCustomLocalStringTime } from "@/Common";
import { Loader2, RefreshCw, Search, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const statusBadgeColor = (status?: string) => {
  switch ((status || "").toLowerCase()) {
    case "sent":
    case "completed":
    case "success":
      return "bg-green-100 text-green-700 border-green-200";
    case "pending":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "cancelled":
    case "expired":
    case "failed":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const History: React.FC = () => {
  const authUser = useSelector((state: RootState) => state.auth.userDetails);

  // Pagination
  const pagination = usePagination({ initialPage: 1, pageSize: 10 });

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [transactionType, setTransactionType] = useState<string>("all");
  const [currency, setCurrency] = useState<string>("all");
  const [targetCrypto, setTargetCrypto] = useState<string>("all");
  const [timeLabel, setTimeLabel] = useState<string>("Last 30 Days");
  const [epochRange, setEpochRange] = useState(() =>
    epochRangeForLabel("Last 30 Days")
  );

  // Build params
  const params = useMemo(() => {
    const page_size = Math.max(1, Math.min(200, pagination.pageSize));
    return {
      user_id: authUser?.id || "",
      transaction_type: transactionType !== "all" ? transactionType : undefined,
      status: status !== "all" ? status : undefined,
      currency: currency !== "all" ? currency : undefined,
      target_crypto_currency: targetCrypto !== "all" ? targetCrypto : undefined,
      search: search?.trim() || undefined,
      from_date: epochRange.from_date,
      to_date: epochRange.to_date,
      sort_by: "created_date",
      sort_order: "desc",
      page_size,
      page_no: pagination.currentPage,
    } as const;
  }, [
    authUser?.id,
    transactionType,
    status,
    currency,
    targetCrypto,
    search,
    epochRange.from_date,
    epochRange.to_date,
    pagination.currentPage,
    pagination.pageSize,
  ]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["user-transactions-history", params],
    queryFn: () => getUserTransactionsHistory(params as any),
    enabled: !!authUser?.id,
    gcTime: 60000,
    staleTime: 60000,
  });

  // Stats query
  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: [
      "user-transactions-stats",
      authUser?.id,
      epochRange.from_date,
      epochRange.to_date,
    ],
    queryFn: () =>
      getUserTransactionsStats({
        user_id: authUser?.id as string,
        from_date: epochRange.from_date,
        to_date: epochRange.to_date,
      }),
    enabled: !!authUser?.id,
    gcTime: 60000,
    staleTime: 60000,
  });

  const items: any[] = data
    ? (data as any)?.data ?? (data as any)?.items ?? []
    : [];
  const totalCount: number = data
    ? (data as any)?.total_count ??
      (data as any)?.data?.[0]?.total_count ??
      items.length
    : 0;

  useEffect(() => {
    pagination.setTotalItems(totalCount);
  }, [totalCount]);

  // Reset to page 1 on filter/time change
  useEffect(() => {
    pagination.setCurrentPage(1);
  }, [
    status,
    transactionType,
    currency,
    targetCrypto,
    search,
    epochRange.from_date,
    epochRange.to_date,
  ]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card className="shadow-sm border border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <button
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
              onClick={() => history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </button>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              Transaction History
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="border rounded-md p-3">
              <div className="text-xs text-muted-foreground mb-1">Send</div>
              {isStatsLoading ? (
                <Skeleton className="h-6 w-40" />
              ) : (
                <div className="text-sm space-y-1">
                  <div>Total: {(statsData as any)?.data?.send?.total ?? 0}</div>
                  <div>
                    Pending: {(statsData as any)?.data?.send?.pending ?? 0}
                  </div>
                  <div>Sent: {(statsData as any)?.data?.send?.sent ?? 0}</div>
                  <div>
                    Amount: {(statsData as any)?.data?.send?.amount_total ?? 0}
                  </div>
                </div>
              )}
            </div>
            <div className="border rounded-md p-3">
              <div className="text-xs text-muted-foreground mb-1">Receive</div>
              {isStatsLoading ? (
                <Skeleton className="h-6 w-40" />
              ) : (
                <div className="text-sm space-y-1">
                  <div>
                    Total: {(statsData as any)?.data?.receive?.total ?? 0}
                  </div>
                  <div>
                    Pending: {(statsData as any)?.data?.receive?.pending ?? 0}
                  </div>
                  <div>
                    Cancelled:{" "}
                    {(statsData as any)?.data?.receive?.cancelled ?? 0}
                  </div>
                  <div>
                    Amount:{" "}
                    {(statsData as any)?.data?.receive?.amount_total ?? 0}
                  </div>
                </div>
              )}
            </div>
            <div className="border rounded-md p-3">
              <div className="text-xs text-muted-foreground mb-1">Summary</div>
              {isStatsLoading ? (
                <Skeleton className="h-6 w-40" />
              ) : (
                <div className="text-sm space-y-1">
                  <div>
                    Active:{" "}
                    {(statsData as any)?.data?.derived?.active_payments ?? 0}
                  </div>
                  <div>
                    Completed:{" "}
                    {(statsData as any)?.data?.derived?.completed_payments ?? 0}
                  </div>
                  <div>
                    Total Balance:{" "}
                    {(statsData as any)?.data?.derived?.total_balance ?? 0}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Transaction ID or Name..."
                  className="pl-8 h-9 text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Type</Label>
              <Select
                value={transactionType}
                onValueChange={setTransactionType}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="send">Send</SelectItem>
                  <SelectItem value="receive">Receive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="BTC">BTC</SelectItem>
                  <SelectItem value="ETH">ETH</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Target Crypto</Label>
              <Select value={targetCrypto} onValueChange={setTargetCrypto}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="BTC">BTC</SelectItem>
                  <SelectItem value="ETH">ETH</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Time</Label>
              <Select
                value={timeLabel}
                onValueChange={(label) => {
                  setTimeLabel(label);
                  setEpochRange(epochRangeForLabel(label));
                }}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Today",
                    "Yesterday",
                    "Last 7 Days",
                    "Last 30 Days",
                    "This Week",
                    "Last Week",
                    "This Month",
                    "Last Month",
                  ].map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Transactions</CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Label className="text-sm">Per page</Label>
              <Select
                value={String(pagination.pageSize)}
                onValueChange={(v) => pagination.setPageSize(Number(v))}
              >
                <SelectTrigger className="h-9 w-[90px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100, 200].map((s) => (
                    <SelectItem key={s} value={String(s)}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Original</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Target Crypto</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: pagination.pageSize }).map((_, idx) => (
                    <TableRow key={`hist-skel-${idx}`}>
                      <TableCell colSpan={8}>
                        <div className="flex items-center gap-3 py-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-48" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-6 text-red-600"
                    >
                      Failed to load history.
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((tx: any) => (
                    <TableRow key={tx.id}>
                      <TableCell
                        className="font-mono text-xs max-w-[220px] truncate"
                        title={tx.id}
                      >
                        {tx.id}
                      </TableCell>
                      <TableCell className="capitalize">
                        {tx.transaction_type ?? "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusBadgeColor(tx.status)}
                        >
                          {tx.status ?? "-"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {tx.original_amount ?? 0} {tx.currency ?? ""}
                      </TableCell>
                      <TableCell>{tx.net_amount ?? 0}</TableCell>
                      <TableCell>{tx.currency ?? "-"}</TableCell>
                      <TableCell>{tx.target_crypto_currency ?? "-"}</TableCell>
                      <TableCell>
                        {tx.created_date
                          ? epochToCustomLocalStringTime(tx.created_date)
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <CommonPagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            pageSize={pagination.pageSize}
            onPageChange={(page) => pagination.setCurrentPage(page)}
            className="mt-3"
            disabled={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default History;
