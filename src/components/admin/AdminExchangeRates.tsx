import React, { useEffect, useState } from "react";
import EditExchangeRateModal from "./EditExchangeRateModal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import {
  AlertTriangle,
  Eye,
  Loader2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminExchangeSettings,
  getAdminExchangeConfig,
  updateAdminExchangeConfig,
} from "@/service/adminservices";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import CommonPagination from "@/components/ui/common-pagination";
import { usePagination } from "@/hooks/usePagination";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ExchangeRate {
  symbol: string;
  price: number;
  change24h: number;
  lastUpdated: string;
}

interface SystemSettings {
  defaultQRExpiration: number;
  maxDailyTransactionLimit: number;
  maintenanceMode: boolean;
  telegramNotifications: boolean;
  exchangeRateMonitoring: boolean;
  rateUpdateInterval: number;
}

interface AdminExchangeRatesProps {
  systemSettings: SystemSettings;
  setSystemSettings: React.Dispatch<React.SetStateAction<SystemSettings>>;
}

const AdminExchangeRates: React.FC<AdminExchangeRatesProps> = ({
  systemSettings,
  setSystemSettings,
}) => {
  const [exchangeRates, setExchangeRate] = useState<ExchangeRate[]>([]);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  // Exchange config state (for PATCH body fields)
  const [monitoringEnabled, setMonitoringEnabled] = useState<boolean>(false);
  const [rateLoggingEnabled, setRateLoggingEnabled] = useState<boolean>(false);
  const [updateIntervalMins, setUpdateIntervalMins] = useState<number>(15);
  const [enabledSources, setEnabledSources] = useState<string[]>([]);
  const [trackedSymbols, setTrackedSymbols] = useState<string[]>([]);

  // Pagination hook
  const pagination = usePagination({
    initialPage: 1,
    pageSize: 10,
  });
  const {
    data: exchangeSettings,
    isLoading,
    refetch,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-exchange-settings"],
    queryFn: () => getAdminExchangeSettings(),
    gcTime: 60000,
    staleTime: 60000,
  });

  // Load exchange config
  const {
    data: exchangeConfig,
    isLoading: isConfigLoading,
    refetch: refetchConfig,
  } = useQuery({
    queryKey: ["admin-exchange-config"],
    queryFn: () => getAdminExchangeConfig(),
    gcTime: 60000,
    staleTime: 60000,
  });

  useEffect(() => {
    if (exchangeConfig) {
      const cfg = (exchangeConfig as any)?.data || exchangeConfig;
      setMonitoringEnabled(!!cfg?.monitoring_enabled);
      setRateLoggingEnabled(!!cfg?.rate_logging_enabled);
      setUpdateIntervalMins(Number(cfg?.update_interval_in_mins ?? 15));
      setEnabledSources(
        Array.isArray(cfg?.enabled_sources) ? cfg.enabled_sources : []
      );
      setTrackedSymbols(
        Array.isArray(cfg?.tracked_symbols) ? cfg.tracked_symbols : []
      );
    }
  }, [exchangeConfig]);

  const queryClient = useQueryClient();
  const saveConfigMutation = useMutation({
    mutationFn: () =>
      updateAdminExchangeConfig({
        monitoring_enabled: monitoringEnabled,
        rate_logging_enabled: rateLoggingEnabled,
        update_interval_in_mins: updateIntervalMins,
        enabled_sources: enabledSources,
        tracked_symbols: trackedSymbols,
      }),
    onSuccess: () => {
      toast.success("Exchange settings saved");
      queryClient.invalidateQueries({ queryKey: ["admin-exchange-config"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || "Failed to save exchange settings");
    },
  });

  useEffect(() => {
    if (exchangeSettings) {
      const exchangeData = (exchangeSettings as any)?.data?.rates?.map(
        (item: any) => ({
          ...item,
          symbol: item?.symbol,
          price: item?.current_price,
          change24h: item?.price_change_percent_24h,
          lastUpdated: item?.last_updated_at,
        })
      );
      setExchangeRate(exchangeData);
    }
  }, [exchangeSettings]);

  // Update pagination when data changes
  useEffect(() => {
    pagination.setTotalItems(exchangeRates.length);
  }, [exchangeRates.length, pagination]);

  // Get paginated data
  const getPaginatedData = (data: ExchangeRate[]) => {
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return data.slice(startIndex, endIndex);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Currency Exchange Monitoring
            <Button
              size="sm"
              onClick={() => {
                refetch();
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
          <CardDescription>Real-time exchange rate monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Exchange Settings (PATCH body fields) */}
            <div className="p-4 border rounded-lg space-y-4">
              <p className="font-medium">Exchange Settings</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* monitoring_enabled */}
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <Label>Monitoring Enabled</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically monitor and update exchange rates
                    </p>
                  </div>
                  <Switch
                    checked={monitoringEnabled}
                    onCheckedChange={setMonitoringEnabled}
                    disabled={isConfigLoading || saveConfigMutation.isPending}
                  />
                </div>
                {/* rate_logging_enabled */}
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <Label>Rate Logging Enabled</Label>
                    <p className="text-xs text-muted-foreground">
                      Store rate change logs for analysis
                    </p>
                  </div>
                  <Switch
                    checked={rateLoggingEnabled}
                    onCheckedChange={setRateLoggingEnabled}
                    disabled={isConfigLoading || saveConfigMutation.isPending}
                  />
                </div>
                {/* update_interval_in_mins */}
                <div className="p-3 border rounded-md">
                  <Label htmlFor="interval">Update Interval (mins)</Label>
                  <Input
                    id="interval"
                    type="number"
                    min={0}
                    value={updateIntervalMins}
                    onChange={(e) =>
                      setUpdateIntervalMins(Math.max(0, Number(e.target.value)))
                    }
                    disabled={isConfigLoading || saveConfigMutation.isPending}
                  />
                </div>
                {/* enabled_sources */}
                <div className="p-3 border rounded-md">
                  <Label htmlFor="sources">
                    Enabled Sources (comma separated)
                  </Label>
                  <Input
                    id="sources"
                    placeholder="coingecko,binance"
                    value={enabledSources.join(",")}
                    onChange={(e) =>
                      setEnabledSources(
                        e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean)
                      )
                    }
                    disabled={isConfigLoading || saveConfigMutation.isPending}
                  />
                </div>
                {/* tracked_symbols */}
                <div className="p-3 border rounded-md md:col-span-2">
                  <Label htmlFor="symbols">
                    Tracked Symbols (comma separated)
                  </Label>
                  <Input
                    id="symbols"
                    placeholder="BTCUSDT,ETHUSDT,USDTUSD"
                    value={trackedSymbols.join(",")}
                    onChange={(e) =>
                      setTrackedSymbols(
                        e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean)
                      )
                    }
                    disabled={isConfigLoading || saveConfigMutation.isPending}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => saveConfigMutation.mutate()}
                  disabled={isConfigLoading || saveConfigMutation.isPending}
                >
                  {saveConfigMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving
                    </>
                  ) : (
                    "Save Settings"
                  )}
                </Button>
              </div>
            </div>

            {/* Exchange Rates Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Currency Pair</TableHead>
                  <TableHead>Current Price</TableHead>
                  <TableHead>24h Change</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center">
                      <div className="flex items-center justify-center text-muted-foreground">
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Loading...
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && !isError && exchangeRates?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <RefreshCw className="w-12 h-12 text-muted-foreground/50 mb-2" />
                        <p className="text-muted-foreground font-medium">
                          No Exchange Rates Found
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          No exchange rate data is currently available
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading && isError && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center">
                      <div className="flex flex-col items-center justify-center text-destructive">
                        <AlertTriangle className="w-12 h-12 text-destructive/70 mb-2" />
                        <p className="text-destructive font-medium">
                          Error Loading Exchange Rates
                        </p>
                        <p className="text-xs text-destructive/70 mt-1">
                          {error instanceof Error
                            ? error.message
                            : "Failed to load exchange rate data"}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => refetch()}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Retry
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading &&
                  !isError &&
                  exchangeRates?.length > 0 &&
                  getPaginatedData(exchangeRates).map((rate, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {rate.symbol}
                      </TableCell>
                      <TableCell>${Number(rate?.price)}</TableCell>
                      <TableCell>
                        <span
                          className={
                            rate.change24h >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {rate.change24h >= 0 ? "+" : ""}
                          {rate?.change24h?.toFixed(2)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(rate.lastUpdated).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">Live</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedLog(rate);
                              setOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {exchangeRates?.length > 0 && (
              <CommonPagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={exchangeRates.length}
                pageSize={pagination.pageSize}
                onPageChange={pagination.setCurrentPage}
                disabled={isLoading}
              />
            )}
          </div>
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" /> Exchange Rate Details
            </DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              {/* Header card with symbol and status */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div>
                  <p className="text-sm text-muted-foreground">Currency</p>
                  <p className="text-xl font-semibold">{selectedLog.symbol}</p>
                </div>
                <Badge variant="default">Live</Badge>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Current Price
                    </p>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="mt-2 text-2xl font-bold">
                    ${Number(selectedLog?.price).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">24h Change</p>
                    {selectedLog?.change24h >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <p
                    className={`mt-2 text-2xl font-bold ${
                      selectedLog?.change24h >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedLog?.change24h >= 0 ? "+" : ""}
                    {Number(selectedLog?.change24h).toFixed(2)}%
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Last Updated
                    </p>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="mt-2 text-sm">
                    {new Date(selectedLog?.lastUpdated).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Raw JSON (collapsible) */}
              <details className="rounded-lg border bg-muted/30">
                <summary className="cursor-pointer p-3 text-sm font-medium">
                  Raw data
                </summary>
                <pre className="p-4 text-xs overflow-auto">
                  {JSON.stringify(selectedLog, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminExchangeRates;
