import React from "react";
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
import {
  Save,
  Settings,
} from "lucide-react";

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
                      maxDailyTransactionLimit: parseInt(e.target.value) || 50000,
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
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
