import React, { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calculator, Percent, Coins, Save } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminCommissionCurrencies,
  getAdminCommissionGlobal,
  postAdminCommissionCalculate,
  updateAdminCommissionCurrency,
  postAdminCommissionGlobal,
} from "@/service/adminservices";
import { useToast } from "@/hooks/use-toast";
import AddCurrencyModal from "./AddCurrencyModal";
import DeleteCurrencyAction from "./DeleteCurrencyAction";
import EditCurrencyModal from "./EditCurrencyModal";

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
  const { data: globalCommission, isLoading: isLoadingGlobal } = useQuery({
    queryKey: ["admin-commission-global"],
    queryFn: () => getAdminCommissionGlobal(),
    gcTime: 60000,
    staleTime: 60000,
  });

  const { data: currencyCommission, isLoading: isLoadingCurrencies } = useQuery(
    {
      queryKey: ["admin-commission-currencies"],
      queryFn: () => getAdminCommissionCurrencies(),
      gcTime: 60000,
      staleTime: 60000,
    }
  );

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Sync fetched global commission rate into local state so the input is editable
  React.useEffect(() => {
    const rate =
      (globalCommission as any)?.data?.rate ?? (globalCommission as any)?.rate;
    if (typeof rate === "number" && !isNaN(rate)) {
      setGlobalPercentage(Number(rate));
    }
  }, [globalCommission, setGlobalPercentage]);

  const updateCurrencyMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { rate?: number; is_active?: boolean };
    }) => updateAdminCommissionCurrency(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-commission-currencies"],
      });
      toast({
        title: "Commission updated",
        description: "Currency commission updated successfully.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Update failed",
        description: err?.message ?? "Please try again.",
        variant: "destructive" as any,
      });
    },
  });

  // Local state for inline percentage edits
  const [editingPercentages, setEditingPercentages] = useState<
    Record<string, number>
  >({});

  // Calculator form state and mutation
  const [calcAmount, setCalcAmount] = useState<string>("");
  const [calcCurrency, setCalcCurrency] = useState<string>("");
  const [calcType, setCalcType] = useState<string>("send");
  const [calcResult, setCalcResult] = useState<any>(null);

  const calcMutation = useMutation({
    mutationFn: (payload: {
      amount: number;
      currency?: string;
      transaction_type?: string;
    }) => postAdminCommissionCalculate(payload),
    onSuccess: (res: any) => {
      const result = res?.data ?? res;
      setCalcResult(result);
      toast({
        title: "Commission calculated",
        description: "Calculation completed successfully.",
      });
    },
    onError: (err: any) =>
      toast({
        title: "Calculation failed",
        description: err?.message ?? "Please try again.",
        variant: "destructive" as any,
      }),
  });

  const updateGlobalMutation = useMutation({
    mutationFn: (payload: { rate: number }) =>
      postAdminCommissionGlobal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-commission-global"] });
      toast({ title: "Global commission saved" });
    },
    onError: (err: any) =>
      toast({
        title: "Save failed",
        description: err?.message ?? "Please try again.",
        variant: "destructive" as any,
      }),
  });

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
              <Button
                onClick={() => {
                  if (isNaN(globalPercentage)) return;
                  updateGlobalMutation.mutate({
                    rate: Number(globalPercentage),
                  });
                }}
              >
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
        {/* Commission Calculator */}
        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>Calculate Commission</span>
            </CardTitle>
            <CardDescription>
              Quickly estimate commission for a transaction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="e.g. 100"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(e.target.value)}
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Input
                  placeholder="e.g. BTC"
                  value={calcCurrency}
                  onChange={(e) => setCalcCurrency(e.target.value)}
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={calcType} onValueChange={setCalcType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="send">Send</SelectItem>
                    <SelectItem value="receive">Receive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  className="w-full"
                  onClick={() => {
                    const amountNum = parseFloat(calcAmount);
                    if (isNaN(amountNum)) {
                      toast({
                        title: "Enter a valid amount",
                        variant: "destructive" as any,
                      });
                      return;
                    }
                    calcMutation.mutate({
                      amount: amountNum,
                      currency: calcCurrency || undefined,
                      transaction_type: calcType || undefined,
                    });
                  }}
                  disabled={calcMutation.isPending}
                >
                  {calcMutation.isPending ? "Calculating..." : "Calculate"}
                </Button>
              </div>
            </div>

            {calcResult && (
              <div className="mt-4 text-sm text-muted-foreground">
                <div>Result:</div>
                <pre className="mt-2 p-3 bg-muted rounded-md overflow-auto">
                  {JSON.stringify(calcResult, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </Card>

      {/* Currency-Specific Settings */}
      <Card className="animate-scale-in">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Coins className="h-5 w-5" />
              <span>Currency-Specific Commission</span>
            </div>
            <AddCurrencyModal
              onCreated={() =>
                queryClient.invalidateQueries({
                  queryKey: ["admin-commission-currencies"],
                })
              }
            />
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
              {(currencyCommission as any)?.data?.map((setting: any) => (
                <TableRow key={setting.id ?? setting.currency}>
                  <TableCell className="font-medium">
                    {setting.currency}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {editingPercentages[
                        String(setting.id ?? setting.currency)
                      ] ??
                        setting.rate ??
                        setting.percentage ??
                        setting.value ??
                        0}
                      <Percent className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          setting.is_active ?? setting.isActive
                            ? "default"
                            : "secondary"
                        }
                      >
                        {setting.is_active ?? setting.isActive
                          ? "Active"
                          : "Inactive"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <EditCurrencyModal
                        commission={{
                          id: String(setting.id ?? setting.currency),
                          currency: setting.currency,
                          rate: Number(
                            setting.rate ??
                              setting.percentage ??
                              setting.value ??
                              0
                          ),
                          is_active: !!(setting.is_active ?? setting.isActive),
                        }}
                        onUpdated={() =>
                          queryClient.invalidateQueries({
                            queryKey: ["admin-commission-currencies"],
                          })
                        }
                      />
                      <DeleteCurrencyAction
                        commissionId={String(setting.id ?? setting.currency)}
                        onDeleted={() =>
                          queryClient.invalidateQueries({
                            queryKey: ["admin-commission-currencies"],
                          })
                        }
                      />
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
