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
import { toast } from "sonner"; // still used for other toasts
import { epochRangeForLabel } from "@/utils/timeFilters";
import { epochToCustomLocalStringTime } from "@/Common";
import {
  Search,
  ArrowLeft,
  Eye,
  Send,
  Download,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { QRCodeSVG } from "qrcode.react";

import { useLanguage } from "@/contexts/LanguageContext";
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
  const { t } = useLanguage();

  // Pagination
  const pagination = usePagination({ initialPage: 1, pageSize: 10 });

  // Filters
  const [rawSearch, setRawSearch] = useState("");
  const [search, setSearch] = useState(""); // debounced
  const [status, setStatus] = useState<string>("all");
  const [transactionType, setTransactionType] = useState<string>("all");
  const [currency, setCurrency] = useState<string>("all");
  const [targetCrypto, setTargetCrypto] = useState<string>("all");
  const [timeLabel, setTimeLabel] = useState<string>("Last 30 Days");
  const [epochRange, setEpochRange] = useState(() =>
    epochRangeForLabel("Last 30 Days")
  ); // Time labels are shown via t() in the dropdown

  // Debounce search input to reduce API calls
  useEffect(() => {
    const t = setTimeout(() => setSearch(rawSearch), 400);
    return () => clearTimeout(t);
  }, [rawSearch]);

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

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["user-transactions-history", params],
    queryFn: async () => {
      try {
        return await getUserTransactionsHistory(params as any);
      } catch (err: any) {
        // Surface a friendly toast but still let react-query manage the error state
        toast.error(err?.message || t("admin.status.failed"));
        throw err;
      }
    },
    enabled: !!authUser?.id,
    retry: 1,
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
    queryFn: async () => {
      try {
        return await getUserTransactionsStats({
          user_id: authUser?.id as string,
          from_date: epochRange.from_date,
          to_date: epochRange.to_date,
        });
      } catch (err: any) {
        toast.error(err?.message || t("admin.status.failed"));
        throw err;
      }
    },
    enabled: !!authUser?.id,
    retry: 1,
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

  // State for details modal
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  const handleView = (tx: any) => {
    setSelectedTx(tx);
    setDetailsOpen(true);
  };

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
              <ArrowLeft className="h-4 w-4 mr-1" /> {t("nav.back")}
            </button>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              {t("roleSelection.user.features.transactionHistory")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enhanced Stats summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Send Card */}
            <div className="relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-b from-background to-muted/30">
              <div className="absolute right-0 -top-6 opacity-10">
                <Send className="h-24 w-24" />
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-md bg-primary/10 text-primary">
                    <Send className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {t("dashboard.send")}
                  </span>
                </div>
                {isStatsLoading ? (
                  <Skeleton className="h-24 w-full" />
                ) : (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-md border p-3 bg-background">
                      <div className="text-[11px] text-muted-foreground">
                        {t("admin.reports.totalRecords")}
                      </div>
                      <div className="text-base font-semibold">
                        {(statsData as any)?.data?.send?.total ?? 0}
                      </div>
                    </div>
                    <div className="rounded-md border p-3 bg-background">
                      <div className="text-[11px] text-muted-foreground">
                        {t("transaction.pending")}
                      </div>
                      <div className="text-base font-semibold flex items-center gap-1">
                        <Clock className="h-4 w-4 text-amber-500" />
                        {(statsData as any)?.data?.send?.pending ?? 0}
                      </div>
                    </div>
                    <div className="rounded-md border p-3 bg-background col-span-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[11px] text-muted-foreground">
                            {t("transaction.sent")}
                          </div>
                          <div className="text-base font-semibold flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {(statsData as any)?.data?.send?.sent ?? 0}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] text-muted-foreground">
                            {t("admin.dashboard.paymentsAmount")}
                          </div>
                          <div className="text-base font-semibold">
                            {(statsData as any)?.data?.send?.amount_total ?? 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Receive Card */}
            <div className="relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-b from-background to-muted/30">
              <div className="absolute right-0 -top-6 opacity-10">
                <Download className="h-24 w-24" />
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-md bg-primary/10 text-primary">
                    <Download className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Receive
                  </span>
                </div>
                {isStatsLoading ? (
                  <Skeleton className="h-24 w-full" />
                ) : (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-md border p-3 bg-background">
                      <div className="text-[11px] text-muted-foreground">
                        {t("admin.reports.totalRecords")}
                      </div>
                      <div className="text-base font-semibold">
                        {(statsData as any)?.data?.receive?.total ?? 0}
                      </div>
                    </div>
                    <div className="rounded-md border p-3 bg-background">
                      <div className="text-[11px] text-muted-foreground">
                        {t("transaction.pending")}
                      </div>
                      <div className="text-base font-semibold flex items-center gap-1">
                        <Clock className="h-4 w-4 text-amber-500" />
                        {(statsData as any)?.data?.receive?.pending ?? 0}
                      </div>
                    </div>
                    <div className="rounded-md border p-3 bg-background">
                      <div className="text-[11px] text-muted-foreground">
                        {t("transaction.failed")}
                      </div>
                      <div className="text-base font-semibold flex items-center gap-1">
                        <XCircle className="h-4 w-4 text-red-500" />
                        {(statsData as any)?.data?.receive?.cancelled ?? 0}
                      </div>
                    </div>
                    <div className="rounded-md border p-3 bg-background">
                      <div className="text-[11px] text-muted-foreground">
                        {t("admin.dashboard.paymentsAmount")}
                      </div>
                      <div className="text-base font-semibold">
                        {(statsData as any)?.data?.receive?.amount_total ?? 0}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Summary Card */}
            <div className="relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-b from-background to-muted/30">
              <div className="absolute right-0 -top-6 opacity-10">
                <Activity className="h-24 w-24" />
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-md bg-primary/10 text-primary">
                    <Activity className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {t("dashboard.overview")}
                  </span>
                </div>
                {isStatsLoading ? (
                  <Skeleton className="h-24 w-full" />
                ) : (
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-md border p-3 bg-background">
                        <div className="text-[11px] text-muted-foreground">
                          {t("admin.transactions.active")}
                        </div>
                        <div className="text-base font-semibold">
                          {(statsData as any)?.data?.derived?.active_payments ??
                            0}
                        </div>
                      </div>
                      <div className="rounded-md border p-3 bg-background">
                        <div className="text-[11px] text-muted-foreground">
                          {t("transaction.completed")}
                        </div>
                        <div className="text-base font-semibold">
                          {(statsData as any)?.data?.derived
                            ?.completed_payments ?? 0}
                        </div>
                      </div>
                    </div>
                    <div className="rounded-md border p-3 bg-background">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-emerald-500" />
                          <div className="text-[11px] text-muted-foreground">
                            Total Balance
                          </div>
                        </div>
                        <div className="text-base font-semibold">
                          {(statsData as any)?.data?.derived?.total_balance ??
                            0}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                {t("admin.dashboard.search")}
              </Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("admin.transactions.search")}
                  className="pl-8 h-9 text-sm"
                  value={rawSearch}
                  onChange={(e) => setRawSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                {t("admin.transactions.status")}
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder={t("common.all")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  <SelectItem value="sent">{t("transaction.sent")}</SelectItem>
                  <SelectItem value="pending">
                    {t("transaction.pending")}
                  </SelectItem>
                  <SelectItem value="cancelled">
                    {t("transaction.cancelled")}
                  </SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                {t("admin.providers.type")}
              </Label>
              <Select
                value={transactionType}
                onValueChange={setTransactionType}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder={t("common.all")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  <SelectItem value="send">{t("dashboard.send")}</SelectItem>
                  <SelectItem value="receive">
                    {t("dashboard.receive")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                {t("receive.currency")}
              </Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder={t("common.all")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="BTC">BTC</SelectItem>
                  <SelectItem value="ETH">ETH</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                {t("admin.reports.providerPerformance")}
              </Label>
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
              <Label className="text-sm font-medium">
                {t("history.filters.time")}
              </Label>
              <Select
                value={timeLabel}
                onValueChange={(label) => {
                  setTimeLabel(label);
                  setEpochRange(epochRangeForLabel(label));
                }}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder={t("time.selectRange")} />
                </SelectTrigger>
                <SelectContent>
                  {[
                    { key: "Today", label: t("time.today") },
                    { key: "Yesterday", label: t("time.yesterday") },
                    { key: "Last 7 Days", label: t("time.last7") },
                    { key: "Last 30 Days", label: t("time.last30") },
                    { key: "This Week", label: t("time.thisWeek") },
                    { key: "Last Week", label: t("time.lastWeek") },
                    { key: "This Month", label: t("time.thisMonth") },
                    { key: "Last Month", label: t("time.lastMonth") },
                  ].map((opt) => (
                    <SelectItem key={opt.key} value={opt.key}>
                      {opt.label}
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
          <CardTitle>{t("dashboard.transactions")}</CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Label className="text-sm">{t("common.perPage")}</Label>
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: pagination.pageSize }).map((_, idx) => (
                    <TableRow key={`hist-skel-${idx}`}>
                      <TableCell colSpan={9}>
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
                    <TableCell colSpan={9} className="text-center py-6">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-red-600">
                          {(error as any)?.message || t("admin.status.failed")}
                        </span>
                        <Button size="sm" onClick={() => refetch()}>
                          {t("common.refresh")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
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
                        {tx.transaction_name}
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
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            title={t("admin.actions.view")}
                            onClick={() => handleView(tx)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {pagination.totalItems > 0 && (
            <CommonPagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              pageSize={pagination.pageSize}
              onPageChange={(page) =>
                !isLoading && pagination.setCurrentPage(page)
              }
              className="mt-3"
              disabled={isLoading}
            />
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={(o) => setDetailsOpen(o)}>
        <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto z-[60]">
          <DialogHeader className="sticky top-0 bg-background z-10 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              {t("admin.actions.view")}
            </DialogTitle>
            <DialogDescription>
              {t("support.chatbot.quickHelp")}
            </DialogDescription>
          </DialogHeader>

          {selectedTx && (
            <div className="space-y-6">
              {/* Top summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border bg-card">
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="text-lg font-semibold truncate">
                    {selectedTx.original_amount} {selectedTx.currency}
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className="w-fit mt-1">{selectedTx.status}</Badge>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-lg font-semibold capitalize truncate">
                    {selectedTx.transaction_type || "-"}
                  </p>
                </div>
              </div>

              {/* Middle details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Identifiers */}
                <div className="p-4 rounded-lg border bg-card space-y-2">
                  <p className="text-sm font-medium">Identifiers</p>
                  <dl className="text-xs space-y-1 text-muted-foreground">
                    <div>
                      <dt className="font-semibold inline text-foreground">
                        ID:
                      </dt>{" "}
                      <dd className="ml-2 inline">{selectedTx.id}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold inline text-foreground">
                        3rd Party TX ID:
                      </dt>{" "}
                      <dd className="ml-2 inline">
                        {selectedTx.third_party_transaction_id || "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold inline text-foreground">
                        User ID:
                      </dt>{" "}
                      <dd className="ml-2 inline">
                        {selectedTx.user_id || "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold inline text-foreground">
                        Transaction Name:
                      </dt>{" "}
                      <dd className="ml-2 inline">
                        {selectedTx.transaction_name || "-"}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Amounts */}
                <div className="p-4 rounded-lg border bg-card space-y-2">
                  <p className="text-sm font-medium">Amounts</p>
                  <dl className="text-xs space-y-1 text-muted-foreground">
                    <div>
                      <dt className="font-semibold inline text-foreground">
                        Original:
                      </dt>{" "}
                      <dd className="ml-2 inline">
                        {selectedTx.original_amount} {selectedTx.currency}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold inline text-foreground">
                        Net Amount:
                      </dt>{" "}
                      <dd className="ml-2 inline">
                        {selectedTx.net_amount ?? "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold inline text-foreground">
                        Commission:
                      </dt>{" "}
                      <dd className="ml-2 inline">
                        {selectedTx.commission_amount ?? "-"} (
                        {selectedTx.commission_rate ?? "-"}%)
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold inline text-foreground">
                        {t("dashboard.receive")}d:
                      </dt>{" "}
                      <dd className="ml-2 inline">
                        {selectedTx.received_amount ?? "-"}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Payment */}
                <div className="p-4 rounded-lg border bg-card space-y-2">
                  <p className="text-sm font-medium">Payment</p>
                  <dl className="text-xs space-y-1 text-muted-foreground">
                    <div>
                      <dt className="font-semibold inline text-foreground">
                        Method:
                      </dt>{" "}
                      <dd className="ml-2 inline">
                        {selectedTx.payment_method || "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold inline text-foreground">
                        3rd Party Site:
                      </dt>{" "}
                      <dd className="ml-2 inline">
                        {selectedTx.third_party_site_name || "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold inline text-foreground">
                        Target Crypto:
                      </dt>{" "}
                      <dd className="ml-2 inline">
                        {selectedTx.target_crypto_currency || "-"}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* QR & Links */}
                <div className="p-4 rounded-lg border bg-card space-y-2">
                  <p className="text-sm font-medium">QR & Links</p>
                  <dl className="text-xs space-y-2 text-muted-foreground">
                    <div>
                      <dt className="font-semibold inline text-foreground">
                        Payment Link:
                      </dt>{" "}
                      <dd className="ml-2 inline break-all">
                        {selectedTx.payment_link || "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold inline text-foreground">
                        QR Expires:
                      </dt>{" "}
                      <dd className="ml-2 inline">
                        {selectedTx.qr_expires_at
                          ? epochToCustomLocalStringTime(
                              selectedTx.qr_expires_at
                            )
                          : "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold inline text-foreground">
                        QR Status:
                      </dt>{" "}
                      <dd className="ml-2 inline">
                        {selectedTx.qr_status ? "Active" : "Inactive"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* QR code */}
              {selectedTx.qr_code_url && (
                <div className="p-4 rounded-lg border bg-card">
                  <p className="text-sm font-medium mb-3">Payment QR</p>
                  <div className="flex items-center gap-6 flex-wrap">
                    <QRCodeSVG
                      value={selectedTx.payment_link || selectedTx.qr_code_url}
                      size={160}
                    />
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Scan to open payment page.</p>
                      {selectedTx.payment_link && (
                        <p className="break-all">
                          <span className="font-semibold text-foreground">
                            Link:
                          </span>
                          <span className="ml-2">
                            {selectedTx.payment_link}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Metadata & raw JSON */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border bg-card space-y-2">
                  <p className="text-sm font-medium">Metadata</p>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-48">
                    {JSON.stringify(
                      selectedTx.transaction_metadata || {},
                      null,
                      2
                    )}
                  </pre>
                </div>
                <div className="p-4 rounded-lg border bg-card space-y-2">
                  <p className="text-sm font-medium">Raw Transaction</p>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-48">
                    {JSON.stringify(selectedTx, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default History;
