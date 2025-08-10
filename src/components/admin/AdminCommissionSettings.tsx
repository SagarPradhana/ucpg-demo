import React from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Calculator,
  Percent,
  Coins,
  Plus,
  Edit,
  Trash2,
  Save,
} from "lucide-react";

interface CommissionPolicy {
  id: string;
  type: "global" | "currency" | "provider";
  name: string;
  value: number;
  currency?: string;
  provider?: string;
  isActive: boolean;
}

interface AdminCommissionSettingsProps {
  globalPercentage: number;
  setGlobalPercentage: (value: number) => void;
  currencySettings: CommissionPolicy[];
  setCurrencySettings: React.Dispatch<React.SetStateAction<CommissionPolicy[]>>;
}

const AdminCommissionSettings: React.FC<AdminCommissionSettingsProps> = ({
  globalPercentage,
  setGlobalPercentage,
  currencySettings,
  setCurrencySettings,
}) => {
  return (
    <div className="space-y-6">
      {/* Global Percentage */}
      <Card className="animate-scale-in">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>Global Commission Settings</span>
          </CardTitle>
          <CardDescription>
            Set the default commission percentage for all transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Label htmlFor="global-percentage">
                  Global Commission Percentage
                </Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    id="global-percentage"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={globalPercentage}
                    onChange={(e) =>
                      setGlobalPercentage(parseFloat(e.target.value) || 0)
                    }
                    className="w-32"
                  />
                  <Percent className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              This percentage will be applied to all transactions unless
              overridden by currency or provider-specific settings.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Currency-Specific Settings */}
      <Card className="animate-scale-in">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Coins className="h-5 w-5" />
              <span>Currency-Specific Commission</span>
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Currency
            </Button>
          </CardTitle>
          <CardDescription>
            Override global settings for specific cryptocurrencies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Currency</TableHead>
                <TableHead>Commission %</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currencySettings.map((setting) => (
                <TableRow key={setting.id}>
                  <TableCell className="font-medium">
                    {setting.currency}
                  </TableCell>
                  <TableCell>{setting.value}%</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={setting.isActive}
                        onCheckedChange={(checked) =>
                          setCurrencySettings((prev) =>
                            prev.map((s) =>
                              s.id === setting.id
                                ? { ...s, isActive: checked }
                                : s
                            )
                          )
                        }
                      />
                      <Badge
                        variant={setting.isActive ? "default" : "secondary"}
                      >
                        {setting.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCommissionSettings;
