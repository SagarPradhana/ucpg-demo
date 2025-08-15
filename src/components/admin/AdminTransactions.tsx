import React, { useMemo, useState } from "react";
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
import { Search, Eye, X, Loader2, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { getAdminTransactions } from "@/service/adminservices";
import { epochRangeForLabel } from "@/utils/timeFilters";

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

interface TransactionFilters {
  status: string;
  currency: string;
  search: string;
}

interface AdminTransactionsProps {
  // legacy props (not used with server data)
  transactions: Transaction[];
  transactionFilters: TransactionFilters;
  setTransactionFilters: React.Dispatch<
    React.SetStateAction<TransactionFilters>
  >;
  getStatusBadge: (status: string) => string;
  handleTransactionCancel: (transactionId: string) => void;
}

const AdminTransactions: React.FC<AdminTransactionsProps> = ({
  transactions,
  transactionFilters,
  setTransactionFilters,
  getStatusBadge,
  handleTransactionCancel,
}) => {
  // Local pagination state for server-side calls
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Time filter state - same as AdminReports
  const [timeLabel, setTimeLabel] = useState<string>("Today");
  const [epochRange, setEpochRange] = useState(() =>
    epochRangeForLabel("Today")
  );

  // Custom date range state
  const [showCustomDates, setShowCustomDates] = useState(false);
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");

  // Build server query params from filters
  const params = useMemo(() => {
    return {
      page,
      limit: pageSize,
      transaction_status:
        transactionFilters.status !== "all"
          ? transactionFilters.status
          : undefined,
      currency:
        transactionFilters.currency !== "all"
          ? transactionFilters.currency
          : undefined,
      date_from: epochRange.from_date,
      date_to: epochRange.to_date,
      // transaction_type, currency_type, target_crypto_currency, user_id can be added later
    } as const;
  }, [
    page,
    pageSize,
    transactionFilters,
    epochRange.from_date,
    epochRange.to_date,
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
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Transaction ID..."
                  className="pl-8"
                  value={transactionFilters.search}
                  onChange={(e) =>
                    setTransactionFilters((prev) => ({
                      ...prev,
                      search: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={transactionFilters.status}
                onValueChange={(value) =>
                  setTransactionFilters((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Currency</Label>
              <Select
                value={transactionFilters.currency}
                onValueChange={(value) =>
                  setTransactionFilters((prev) => ({
                    ...prev,
                    currency: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All currencies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All currencies</SelectItem>
                  <SelectItem value="BTC">Bitcoin</SelectItem>
                  <SelectItem value="ETH">Ethereum</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setTransactionFilters({
                    status: "all",
                    currency: "all",
                    search: "",
                  });
                  setTimeLabel("Today");
                  setEpochRange(epochRangeForLabel("Today"));
                  setShowCustomDates(false);
                  setCustomDateFrom("");
                  setCustomDateTo("");
                }}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Time Filter Section */}
          <div className="border-t pt-4">
            <div className="flex-1">
              <Label className="mb-1 block">Time range</Label>
              <Select
                value={timeLabel}
                onValueChange={(label: string) => {
                  setTimeLabel(label);
                  if (label === "Custom") {
                    setShowCustomDates(true);
                    // Don't update epochRange yet, wait for custom dates
                  } else {
                    setShowCustomDates(false);
                    setEpochRange(epochRangeForLabel(label));
                  }
                }}
              >
                <SelectTrigger className="w-full">
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
                    "Custom",
                  ].map((label) => (
                    <SelectItem key={label} value={label}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Custom Date Inputs */}
              {showCustomDates && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">From Date</Label>
                    <Input
                      type="date"
                      value={customDateFrom}
                      onChange={(e) => {
                        setCustomDateFrom(e.target.value);
                        if (e.target.value && customDateTo) {
                          const fromEpoch = Math.floor(
                            new Date(e.target.value).getTime() / 1000
                          );
                          const toEpoch =
                            Math.floor(
                              new Date(customDateTo).getTime() / 1000
                            ) + 86399; // End of day
                          setEpochRange({
                            from_date: fromEpoch,
                            to_date: toEpoch,
                          });
                        }
                      }}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">To Date</Label>
                    <Input
                      type="date"
                      value={customDateTo}
                      onChange={(e) => {
                        setCustomDateTo(e.target.value);
                        if (customDateFrom && e.target.value) {
                          const fromEpoch = Math.floor(
                            new Date(customDateFrom).getTime() / 1000
                          );
                          const toEpoch =
                            Math.floor(
                              new Date(e.target.value).getTime() / 1000
                            ) + 86399; // End of day
                          setEpochRange({
                            from_date: fromEpoch,
                            to_date: toEpoch,
                          });
                        }
                      }}
                      className="text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground mt-1">
                from_date: {epochRange.from_date} | to_date:{" "}
                {epochRange.to_date}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
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
                serverItems.map((tx: any) => (
                  <TableRow key={tx.id ?? tx.transaction_id}>
                    <TableCell className="font-medium">
                      {tx.id ?? tx.transaction_id}
                    </TableCell>
                    <TableCell>
                      {tx.date
                        ? new Date(tx.date).toLocaleString()
                        : tx.created_at
                        ? new Date(tx.created_at).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell>{tx.amount ?? tx.total_amount ?? "-"}</TableCell>
                    <TableCell>
                      {tx.currency ?? tx.currency_code ?? "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          getStatusBadge(
                            (tx.status ?? tx.tx_status) as string
                          ) as any
                        }
                      >
                        {tx.status ?? tx.tx_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {tx.commission ?? tx.platform_fee ?? "-"}
                    </TableCell>
                    <TableCell>
                      {tx.netAmount ?? tx.net_amount ?? "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          getStatusBadge(
                            (tx.qrStatus ?? tx.qr_status) as string
                          ) as any
                        }
                      >
                        {tx.qrStatus ?? tx.qr_status ?? "-"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleTransactionCancel(tx.id ?? tx.transaction_id)
                          }
                          disabled={(tx.status ?? tx.tx_status) === "cancelled"}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.max(1, p - 1));
                }}
              />
            </PaginationItem>
            <PaginationItem>
              <div className="px-3 py-2 text-sm text-muted-foreground">
                {page} of {totalPages}
              </div>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.min(totalPages, p + 1));
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default AdminTransactions;
