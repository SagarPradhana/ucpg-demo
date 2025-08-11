import React, { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, Settings } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminSettings, updateAdminSettings } from "@/service/adminservices";
import { useToast } from "@/hooks/use-toast";

interface SystemSettings {
  defaultQRExpiration: number;
  maxDailyTransactionLimit: number;
  maintenanceMode: boolean;
  telegramNotifications: boolean;
  exchangeRateMonitoring: boolean;
  rateUpdateInterval: number;
}

interface AdminSettingsProps {
  systemSettings: SystemSettings;
  setSystemSettings: React.Dispatch<React.SetStateAction<SystemSettings>>;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({
  systemSettings,
  setSystemSettings,
}) => {
  const { data: serverSettings } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => getAdminSettings(),
    gcTime: 60000,
    staleTime: 60000,
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const settingsId: string | undefined =
    (serverSettings as any)?.data?.id ?? (serverSettings as any)?.id;

  const saveMutation = useMutation({
    mutationFn: (payload: {
      qr_expiration_minutes?: number;
      max_daily_transaction_limit?: number;
      maintenance_mode?: boolean;
      maintenance_message?: string;
      telegram_notifications_enabled?: boolean;
      telegram_bot_token?: string;
      telegram_chat_id?: string;
    }) => updateAdminSettings(String(settingsId), payload),
    onSuccess: () => {
      toast({ title: "Settings saved" });
      queryClient.invalidateQueries({
        queryKey: ["admin-settings"],
        exact: true,
      });
    },
    onError: (err: any) =>
      toast({
        title: "Save failed",
        description: err?.message ?? "Please try again.",
        variant: "destructive" as any,
      }),
  });

  useEffect(() => {
    const s = (serverSettings as any)?.data ?? serverSettings;
    if (!s) return;
    setSystemSettings((prev) => ({
      ...prev,
      defaultQRExpiration: s?.defaultQRExpiration ?? prev.defaultQRExpiration,
      maxDailyTransactionLimit:
        s?.maxDailyTransactionLimit ?? prev.maxDailyTransactionLimit,
      maintenanceMode: s?.maintenanceMode ?? prev.maintenanceMode,
      telegramNotifications:
        s?.telegramNotifications ?? prev.telegramNotifications,
      exchangeRateMonitoring:
        s?.exchangeRateMonitoring ?? prev.exchangeRateMonitoring,
      rateUpdateInterval: s?.rateUpdateInterval ?? prev.rateUpdateInterval,
    }));
  }, [serverSettings, setSystemSettings]);
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>
            Configure system-wide settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Transaction Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <h3 className="text-lg font-medium">Transaction Settings</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qr-expiration">
                  Default QR Code Expiration (hours)
                </Label>
                <Input
                  id="qr-expiration"
                  type="number"
                  value={systemSettings.defaultQRExpiration}
                  onChange={(e) =>
                    setSystemSettings((prev) => ({
                      ...prev,
                      defaultQRExpiration: parseInt(e.target.value) || 24,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="daily-limit">
                  Max Daily Transaction Limit ($)
                </Label>
                <Input
                  id="daily-limit"
                  type="number"
                  value={systemSettings.maxDailyTransactionLimit}
                  onChange={(e) =>
                    setSystemSettings((prev) => ({
                      ...prev,
                      maxDailyTransactionLimit:
                        parseInt(e.target.value) || 50000,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* System Controls */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">System Controls</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable maintenance mode to restrict user access
                  </p>
                </div>
                <Switch
                  checked={systemSettings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setSystemSettings((prev) => ({
                      ...prev,
                      maintenanceMode: checked,
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Telegram Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send notifications to Telegram channels
                  </p>
                </div>
                <Switch
                  checked={systemSettings.telegramNotifications}
                  onCheckedChange={(checked) =>
                    setSystemSettings((prev) => ({
                      ...prev,
                      telegramNotifications: checked,
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Exchange Rate Monitoring</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically monitor and update exchange rates
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
            </div>

            <Separator />

            {/* Telegram Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Telegram Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telegram-bot-token">Telegram Bot Token</Label>
                  <Input
                    id="telegram-bot-token"
                    type="text"
                    placeholder="e.g. 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                    value={(systemSettings as any).telegramBotToken ?? ""}
                    onChange={(e) =>
                      setSystemSettings((prev: any) => ({
                        ...prev,
                        telegramBotToken: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telegram-chat-id">Telegram Chat ID</Label>
                  <Input
                    id="telegram-chat-id"
                    type="text"
                    placeholder="e.g. -1001234567890"
                    value={(systemSettings as any).telegramChatId ?? ""}
                    onChange={(e) =>
                      setSystemSettings((prev: any) => ({
                        ...prev,
                        telegramChatId: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Exchange Rate Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Exchange Rate Settings</h3>
            <div className="space-y-2">
              <Label htmlFor="rate-interval">
                Rate Update Interval (minutes)
              </Label>
              <Input
                id="rate-interval"
                type="number"
                value={systemSettings.rateUpdateInterval}
                onChange={(e) =>
                  setSystemSettings((prev) => ({
                    ...prev,
                    rateUpdateInterval: parseInt(e.target.value) || 10,
                  }))
                }
              />
            </div>
          </div>

          <Separator />

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={() => {
                if (!settingsId) return;
                const payload = {
                  qr_expiration_minutes:
                    systemSettings.defaultQRExpiration * 60,
                  max_daily_transaction_limit:
                    systemSettings.maxDailyTransactionLimit,
                  maintenance_mode: systemSettings.maintenanceMode,
                  maintenance_message: undefined,
                  telegram_notifications_enabled:
                    systemSettings.telegramNotifications,
                  telegram_bot_token:
                    (systemSettings as any).telegramBotToken || undefined,
                  telegram_chat_id:
                    (systemSettings as any).telegramChatId || undefined,
                };
                saveMutation.mutate(payload);
              }}
            >
              <Save className="h-4 w-4 mr-2" />
              {saveMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
