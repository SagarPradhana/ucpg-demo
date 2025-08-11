import React, { useMemo } from "react";
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
import { RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAdminExchangeSettings } from "@/service/adminservices";

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
  exchangeRates: ExchangeRate[];
  systemSettings: SystemSettings;
  setSystemSettings: React.Dispatch<React.SetStateAction<SystemSettings>>;
}

const AdminExchangeRates: React.FC<AdminExchangeRatesProps> = ({
  exchangeRates,
  systemSettings,
  setSystemSettings,
}) => {
  const { data: exchangeSettings } = useQuery({
    queryKey: ["admin-exchange-settings"],
    queryFn: () => getAdminExchangeSettings(),
    gcTime: 60000,
    staleTime: 60000,
  });
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Currency Exchange Monitoring
            <Button
              size="sm"
              onClick={() => {
                // Removed non-API rates update toast
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {exchangeRates.map((rate, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{rate.symbol}</TableCell>
                    <TableCell>${rate.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <span
                        className={
                          rate.change24h >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {rate.change24h >= 0 ? "+" : ""}
                        {rate.change24h}%
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(rate.lastUpdated).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">Live</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminExchangeRates;
