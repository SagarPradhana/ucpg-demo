import React, { useMemo, useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, Eye, X, Loader2, RefreshCw, Edit } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import EnhancedAuditLogsPagination from "@/components/ui/enhanced-audit-logs-pagination";
import { usePagination } from "@/hooks/usePagination";
import {
  getAdminTransactions,
  cancelAdminTransaction,
} from "@/service/adminservices";
import { TimeFilter } from "@/components/ui/time-filter";
import { useTimeFilter, dateToEpoch } from "@/hooks/useTimeFilter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PermissionGuard } from "@/components/PermissionGuard";
import { epochToCustomLocalStringTime } from "@/Common";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { Copy, ExternalLink } from "lucide-react";

interface TransactionFilters {
  status: string;
  currency: string;
  search: string;
}

const AdminTransactions: React.FC = () => {
  const { t } = useLanguage();

  // Helper function for status badges (moved from props)
  const getStatusBadge = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status?.toLowerCase()) {
      case "sent":
      case "completed":
      case "success":
        return "default";
      case "received":
      case "pending":
        return "secondary";
      case "expired":
      case "cancelled":
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Cancel transaction mutation
  const cancelMutation = useMutation({
    mutationFn: ({
      transactionId,
      reason,
    }: {
      transactionId: string;
      reason: string;
    }) => cancelAdminTransaction(transactionId, { reason }),
    onSuccess: () => {
      toast.success("Transaction cancelled successfully");
      // Invalidate and refetch transactions
      queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });
      // Reset modal state
      setCancelModalOpen(false);
      setSelectedTransactionId("");
      setCancelReason("");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to cancel transaction");
    },
  });

  // Handle cancel button click
  const handleTransactionCancel = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setCancelModalOpen(true);
  };

  // Handle cancel confirmation
  const handleCancelConfirm = () => {
    if (!selectedTransactionId || !cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }
    cancelMutation.mutate({
      transactionId: selectedTransactionId,
      reason: cancelReason.trim(),
    });
  };

  // Local state for filters (replacing legacy props)
  const [localFilters, setLocalFilters] = useState<TransactionFilters>({
    status: "all",
    currency: "all",
    search: "",
  });

  // Pagination hook
  const pagination = usePagination({
    initialPage: 1,
    pageSize: 10,
  });

  // Time filter using unified hook with support for custom range
  const timeFilter = useTimeFilter({ mode: "epoch", defaultValue: "Today" });
  const [relativeAnchorSec, setRelativeAnchorSec] = useState<number>(() =>
    Math.floor(Date.now() / 1000)
  );

  useEffect(() => {
    if (timeFilter.mode === "relative") {
      setRelativeAnchorSec(Math.floor(Date.now() / 1000));
    }
  }, [timeFilter.mode, timeFilter.value]);

  const from_date =
    timeFilter.mode === "custom"
      ? dateToEpoch(timeFilter.dateFrom!)
      : timeFilter.mode === "relative" && timeFilter.state.relativeTimeMs
      ? relativeAnchorSec - Math.floor(timeFilter.state.relativeTimeMs / 1000)
      : timeFilter.epochRange.from_date;

  const to_date =
    timeFilter.mode === "custom"
      ? dateToEpoch(timeFilter.dateTo!) + 86399 // include end date fully
      : timeFilter.mode === "relative"
      ? relativeAnchorSec
      : timeFilter.epochRange.to_date;

  // Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] =
    useState<string>("");
  const [cancelReason, setCancelReason] = useState("");

  // Query client for cache invalidation
  const queryClient = useQueryClient();

  // Build server query params from filters
  const params = useMemo(() => {
    // Clamp page size to API constraints [1, 100]
    const clampedPageSize = Math.max(1, Math.min(100, pagination.pageSize));

    const page_no = pagination.currentPage; // 1-based per transactions API requirement
    return {
      // Primary API params (1-based for Transactions API)
      page_no,
      page_size: clampedPageSize,
      // Legacy support (keep if backend accepts page/limit as 1-based)
      page: pagination.currentPage,
      limit: clampedPageSize,

      transaction_status:
        localFilters.status !== "all" ? localFilters.status : undefined,
      currency:
        localFilters.currency !== "all" ? localFilters.currency : undefined,
      date_from: from_date,
      date_to: to_date,
      search: localFilters.search?.trim() || undefined,
      // transaction_type, currency_type, target_crypto_currency, user_id can be added later
    } as const;
  }, [
    pagination.currentPage,
    pagination.pageSize,
    localFilters.status,
    localFilters.currency,
    localFilters.search,
    from_date,
    to_date,
    timeFilter.mode,
  ]);

  const {
    data: txResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-transactions", params],
    queryFn: () => getAdminTransactions(params),
    gcTime: 60000,
    staleTime: 60000,
  });

  const serverItems: any[] = txResponse
    ? (txResponse as any)?.data ??
      (txResponse as any)?.items ??
      (txResponse as any)?.results ??
      []
    : [];
  const totalCount: number = txResponse
    ? (txResponse as any)?.total_count ??
      (txResponse as any)?.total ??
      serverItems.length
    : 0;

  console.log("totalCount", totalCount);

  // Update pagination when data changes and reset on filter/time change
  useEffect(() => {
    pagination.setTotalItems(totalCount);
  }, [totalCount, pagination]);

  useEffect(() => {
    // Reset page when filters or time range change to avoid out-of-range page
    pagination.setCurrentPage(1);
  }, [
    localFilters.status,
    localFilters.currency,
    localFilters.search,
    from_date,
    to_date,
    pagination,
  ]);

  // State for details modal
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  const handleView = (tx: any) => {
    console.log("VIEW CLICK", tx);
    setSelectedTx(tx);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="shadow-sm border border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            {t("admin.transactions.filters")}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Filter by text, status, currency and time. Use Custom to choose a
            specific date range.
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                {t("admin.dashboard.search")}
              </Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("admin.transactions.search")}
                  className="pl-8 h-9 text-sm"
                  value={localFilters.search}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      search: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                {t("admin.transactions.status")}
              </Label>
              <Select
                value={localFilters.status}
                onValueChange={(value) =>
                  setLocalFilters((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("admin.transactions.allStatus")}
                  </SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Currency */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                {t("admin.transactions.currency")}
              </Label>
              <Select
                value={localFilters.currency}
                onValueChange={(value) =>
                  setLocalFilters((prev) => ({ ...prev, currency: value }))
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="All currencies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("admin.transactions.allCurrencies")}
                  </SelectItem>
                  <SelectItem value="BTC">Bitcoin</SelectItem>
                  <SelectItem value="ETH">Ethereum</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Empty space on larger screens */}
            <div className="hidden md:block"></div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setLocalFilters({
                    status: "all",
                    currency: "all",
                    search: "",
                  });
                  timeFilter.handleEpochChange("Today");
                  pagination.setCurrentPage(1);
                }}
                className="w-full h-9 text-sm"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Time Filter Section */}
          <div className="border-t pt-4 space-y-3">
            <Label className="text-sm font-medium">Time Range</Label>
            <Tabs
              value={timeFilter.mode}
              onValueChange={(m) => timeFilter.switchMode(m as any)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="epoch">Quick</TabsTrigger>
                <TabsTrigger value="relative">Relative</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>
              <TabsContent value="epoch" className="pt-3">
                <TimeFilter
                  mode="epoch"
                  value={timeFilter.value}
                  onChange={timeFilter.handleEpochChange}
                  epochRange={timeFilter.epochRange}
                  onEpochRangeChange={() => {}}
                  label="Quick ranges"
                  placeholder="Select time range"
                  variant="compact"
                  showIcon={true}
                />
              </TabsContent>
              <TabsContent value="relative" className="pt-3">
                <TimeFilter
                  mode="relative"
                  value={timeFilter.value}
                  onChange={timeFilter.handleRelativeChange}
                  label="Relative window"
                  placeholder="Select window"
                  variant="compact"
                  showIcon={true}
                />
              </TabsContent>
              <TabsContent value="custom" className="pt-3">
                <TimeFilter
                  mode="custom"
                  dateFrom={timeFilter.dateFrom}
                  dateTo={timeFilter.dateTo}
                  onDateFromChange={timeFilter.handleDateFromChange}
                  onDateToChange={timeFilter.handleDateToChange}
                  label="Custom range"
                  variant="compact"
                  showIcon={true}
                />
                {!timeFilter.isValidRange && (
                  <div className="text-xs text-destructive mt-2">
                    End date must be after start date.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">
            {t("dashboard.transactions")}
          </CardTitle>
          <div className="flex items-center gap-3">
            {/* Refresh */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => {
                // Force refetch by invalidating cache for current params
                const key = ["admin-transactions", params] as const;
                queryClient.invalidateQueries({ queryKey: key });
              }}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            {/* Page size selector */}
            <div className="flex items-center gap-2 text-sm">
              <Label className="text-sm">{t("common.perPage")}</Label>
              <Select
                value={String(pagination.pageSize)}
                onValueChange={(v) => pagination.setPageSize(Number(v))}
              >
                <SelectTrigger className="h-8 w-[90px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map((s) => (
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
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
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center">
                    <div className="flex items-center justify-center text-muted-foreground">
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Loading...
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && !isError && serverItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <svg
                        className="w-12 h-12 text-muted-foreground/50 mb-2"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3 9h18M9 3v18M14 3v18"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      <p className="text-muted-foreground font-medium">
                        No Data Available
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        No transactions match your current filters
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && isError && (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center">
                    <div className="flex flex-col items-center justify-center text-destructive">
                      <svg
                        className="w-12 h-12 text-destructive/70 mb-2"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="text-destructive font-medium">
                        Error Loading Data
                      </p>
                      <p className="text-xs text-destructive/70 mt-1">
                        {error instanceof Error
                          ? error.message
                          : "Failed to load transactions"}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => window.location.reload()}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                serverItems?.map((tx: any) => (
                  <TableRow key={tx.id ?? tx.transaction_id}>
                    <TableCell className="font-medium">
                      {tx.transaction_name ?? tx.id ?? "-"}
                    </TableCell>
                    <TableCell>
                      {tx.created_date
                        ? epochToCustomLocalStringTime(tx.created_date)
                        : tx.created_at
                        ? new Date(tx.created_at).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {tx.amount ?? tx.original_amount ?? "-"}
                    </TableCell>
                    <TableCell>
                      {tx.currency ?? tx.currency_code ?? "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadge(
                          (tx.transaction_status ??
                            tx.status ??
                            tx.tx_status) as string
                        )}
                      >
                        {tx.transaction_status ?? tx.status ?? "-"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {tx.commission_amount ?? tx.commission ?? "-"}
                    </TableCell>
                    <TableCell>
                      {tx.net_amount ?? tx.netAmount ?? "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          tx.qr_status === "active" ? "default" : "secondary"
                        }
                      >
                        {tx.qr_status ?? "inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <PermissionGuard permission="TRV">
                          <Button
                            size="sm"
                            variant="ghost"
                            title="View transaction details"
                            onClick={() => handleView(tx)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>

                        <PermissionGuard permission="TRC">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleTransactionCancel(
                                tx.id ?? tx.transaction_id
                              )
                            }
                            disabled={
                              (tx.transaction_status ??
                                tx.status ??
                                tx.tx_status) === "cancelled" ||
                              cancelMutation.isPending
                            }
                            title="Cancel transaction"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Enhanced Pagination */}
      {totalCount > 0 && (
        <EnhancedAuditLogsPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={totalCount}
          pageSize={pagination.pageSize}
          onPageChange={(p) => !isLoading && pagination.setCurrentPage(p)}
          disabled={isLoading}
        />
      )}

      {/* Details Modal - Enhanced Design */}
      <Dialog open={detailsOpen} onOpenChange={(o) => setDetailsOpen(o)}>
        <DialogContent className="max-w-5xl h-[90vh] overflow-hidden z-[60]">
          <DialogHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-4 border-b border-border/50">
            <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
              <div className="w-2 h-8 bg-primary rounded-full"></div>
              Transaction Details
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Comprehensive view of the selected transaction with all relevant
              information
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 px-1">
            {selectedTx && (
              <div className="space-y-8 py-6">
                {/* Enhanced Top Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-6 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="relative">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Transaction Amount
                      </p>
                      <p className="text-2xl font-bold text-foreground truncate">
                        {selectedTx.original_amount} {selectedTx.currency}
                      </p>
                    </div>
                  </div>

                  <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-6 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-secondary/10 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="relative">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Current Status
                      </p>
                      <Badge
                        variant={getStatusBadge(selectedTx.status)}
                        className="text-sm px-3 py-1 font-medium"
                      >
                        {selectedTx.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-6 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-accent/10 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="relative">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Transaction Type
                      </p>
                      <p className="text-2xl font-bold text-foreground capitalize truncate">
                        {selectedTx.transaction_type || "Standard"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enhanced Detail Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Identifiers Section */}
                  <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                    <div className="p-6 border-b border-border/30">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                        Identifiers
                      </h3>
                    </div>
                    <div className="p-6 space-y-4">
                      {[
                        { label: "Transaction ID", value: selectedTx.id },
                        {
                          label: "3rd Party TX ID",
                          value: selectedTx.third_party_transaction_id,
                        },
                        { label: "User ID", value: selectedTx.user_id },
                        {
                          label: "Transaction Name",
                          value: selectedTx.transaction_name,
                        },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-start py-2 border-b border-border/20 last:border-b-0"
                        >
                          <dt className="text-sm font-medium text-muted-foreground min-w-0 flex-1">
                            {item.label}
                          </dt>
                          <dd className="text-sm text-foreground font-mono ml-4 text-right break-all">
                            {item.value || "-"}
                          </dd>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Amounts Section */}
                  <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                    <div className="p-6 border-b border-border/30">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-green-500 rounded-full"></div>
                        Financial Details
                      </h3>
                    </div>
                    <div className="p-6 space-y-4">
                      {[
                        {
                          label: "Original Amount",
                          value: `${selectedTx.original_amount} ${selectedTx.currency}`,
                        },
                        { label: "Net Amount", value: selectedTx.net_amount },
                        {
                          label: "Commission",
                          value: `${selectedTx.commission_amount ?? "-"} (${
                            selectedTx.commission_rate ?? "-"
                          }%)`,
                        },
                        {
                          label: "Received Amount",
                          value: selectedTx.received_amount,
                        },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-start py-2 border-b border-border/20 last:border-b-0"
                        >
                          <dt className="text-sm font-medium text-muted-foreground min-w-0 flex-1">
                            {item.label}
                          </dt>
                          <dd className="text-sm text-foreground font-mono ml-4 text-right">
                            {item.value || "-"}
                          </dd>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                    <div className="p-6 border-b border-border/30">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                        Payment Information
                      </h3>
                    </div>
                    <div className="p-6 space-y-4">
                      {[
                        {
                          label: "Payment Method",
                          value: selectedTx.payment_method,
                        },
                        {
                          label: "3rd Party Site",
                          value: selectedTx.third_party_site_name,
                        },
                        {
                          label: "Target Cryptocurrency",
                          value: selectedTx.target_crypto_currency,
                        },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-start py-2 border-b border-border/20 last:border-b-0"
                        >
                          <dt className="text-sm font-medium text-muted-foreground min-w-0 flex-1">
                            {item.label}
                          </dt>
                          <dd className="text-sm text-foreground ml-4 text-right">
                            {item.value || "-"}
                          </dd>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* QR & Links Section */}
                  <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                    <div className="p-6 border-b border-border/30">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
                        QR & Links
                      </h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start py-2">
                          <dt className="text-sm font-medium text-muted-foreground">
                            Payment Link
                          </dt>
                          <dd className="text-sm text-foreground ml-4 text-right max-w-xs">
                            {selectedTx.payment_link ? (
                              <div className="flex items-center gap-2">
                                <span className="truncate font-mono text-xs">
                                  {selectedTx.payment_link.substring(0, 30)}...
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() =>
                                    navigator.clipboard.writeText(
                                      selectedTx.payment_link
                                    )
                                  }
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              "-"
                            )}
                          </dd>
                        </div>

                        <div className="flex justify-between items-start py-2 border-b border-border/20">
                          <dt className="text-sm font-medium text-muted-foreground">
                            QR Expires
                          </dt>
                          <dd className="text-sm text-foreground ml-4 text-right">
                            {selectedTx.qr_expires_at
                              ? epochToCustomLocalStringTime(
                                  selectedTx.qr_expires_at
                                )
                              : "-"}
                          </dd>
                        </div>

                        <div className="flex justify-between items-start py-2">
                          <dt className="text-sm font-medium text-muted-foreground">
                            QR Status
                          </dt>
                          <dd className="ml-4">
                            <Badge
                              variant={
                                selectedTx.qr_status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {selectedTx.qr_status ? "Active" : "Inactive"}
                            </Badge>
                          </dd>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced QR Code Section */}
                {selectedTx.qr_code_url && (
                  <div className="rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/30 shadow-lg">
                    <div className="p-6 border-b border-border/30">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                        Payment QR Code
                      </h3>
                    </div>
                    <div className="p-8">
                      <div className="flex flex-col lg:flex-row items-center gap-8">
                        <div className="relative">
                          <div className="p-4 bg-white rounded-2xl shadow-lg">
                            <QRCodeSVG
                              value={
                                selectedTx.payment_link ||
                                selectedTx.qr_code_url
                              }
                              size={180}
                              level="M"
                              includeMargin={true}
                            />
                          </div>
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>

                        <div className="flex-1 space-y-4 text-center lg:text-left">
                          <div>
                            <h4 className="text-lg font-semibold text-foreground mb-2">
                              Scan to Pay
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Use your mobile device to scan this QR code and
                              complete the payment process.
                            </p>
                          </div>

                          {selectedTx.payment_link && (
                            <div className="p-4 bg-muted/50 rounded-lg border border-border/30">
                              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                                Payment URL
                              </p>
                              <div className="flex items-center gap-2">
                                <code className="text-xs bg-background px-2 py-1 rounded border flex-1 truncate">
                                  {selectedTx.payment_link}
                                </code>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    navigator.clipboard.writeText(
                                      selectedTx.payment_link
                                    )
                                  }
                                  className="shrink-0"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    window.open(
                                      selectedTx.payment_link,
                                      "_blank"
                                    )
                                  }
                                  className="shrink-0"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Collapsible Technical Details */}
                <div className="space-y-6">
                  <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm">
                    <div className="p-6">
                      <CollapsibleSection
                        title="Transaction Metadata"
                        defaultOpen={false}
                      >
                        <div className="rounded-lg border border-border/30 bg-muted/30 p-4">
                          <pre className="text-xs text-muted-foreground overflow-auto max-h-64 font-mono leading-relaxed">
                            {JSON.stringify(
                              selectedTx.transaction_metadata || {},
                              null,
                              2
                            )}
                          </pre>
                        </div>
                      </CollapsibleSection>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm">
                    <div className="p-6">
                      <CollapsibleSection
                        title="Raw Transaction Data"
                        defaultOpen={false}
                      >
                        <div className="rounded-lg border border-border/30 bg-muted/30 p-4">
                          <pre className="text-xs text-muted-foreground overflow-auto max-h-64 font-mono leading-relaxed">
                            {JSON.stringify(selectedTx, null, 2)}
                          </pre>
                        </div>
                      </CollapsibleSection>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Transaction Confirmation Modal */}
      <AlertDialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this transaction? This action
              cannot be undone. Please provide a reason for cancellation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="cancel-reason" className="text-sm font-medium">
              Reason for cancellation *
            </Label>
            <Textarea
              id="cancel-reason"
              placeholder="Enter the reason for cancelling this transaction..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setCancelModalOpen(false);
                setCancelReason("");
                setSelectedTransactionId("");
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              disabled={!cancelReason.trim() || cancelMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelMutation.isPending ? "Cancelling..." : "Apply"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminTransactions;
