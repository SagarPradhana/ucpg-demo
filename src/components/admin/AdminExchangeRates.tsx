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
import { AlertTriangle, Eye, Loader2, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAdminExchangeSettings } from "@/service/adminservices";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

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
          <div className="space-y-4">
            {/* Settings */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Auto-refresh rates</p>
                <p className="text-sm text-muted-foreground">
                  Update rates every {systemSettings.rateUpdateInterval} minutes
                </p>
              </div>
              <Switch
                checked={systemSettings.exchangeRateMonitoring}
                onCheckedChange={(checked) =>
                  setSystemSettings((prev) => ({
                    ...prev,
                    exchangeRateMonitoring: checked,
                  }))
                }
              />
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
                        <p className="text-muted-foreground font-medium">No Exchange Rates Found</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">No exchange rate data is currently available</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                
                {!isLoading && isError && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center">
                      <div className="flex flex-col items-center justify-center text-destructive">
                        <AlertTriangle className="w-12 h-12 text-destructive/70 mb-2" />
                        <p className="text-destructive font-medium">Error Loading Exchange Rates</p>
                        <p className="text-xs text-destructive/70 mt-1">{error instanceof Error ? error.message : 'Failed to load exchange rate data'}</p>
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
                
                {!isLoading && !isError && exchangeRates?.length > 0 &&
                  exchangeRates.map((rate, index) => (
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
          </div>
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Exchange rates details</DialogTitle>
          </DialogHeader>
          <pre className="p-4 bg-muted rounded-md overflow-auto text-xs">
            {JSON.stringify(selectedLog, null, 2)}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminExchangeRates;
