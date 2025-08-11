import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMutation } from "@tanstack/react-query";
import { updateAdminCommissionCurrency } from "@/service/adminservices";
import { useToast } from "@/hooks/use-toast";
import { EditIcon } from "lucide-react";

export type CurrencyCommission = {
  id: string;
  currency: string;
  rate: number;
  is_active: boolean;
};

export default function EditCurrencyModal({
  commission,
  onUpdated,
}: {
  commission: CurrencyCommission;
  onUpdated?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [rate, setRate] = useState(String(commission.rate ?? 0));
  const [active, setActive] = useState(!!commission.is_active);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: () =>
      updateAdminCommissionCurrency(commission.id, {
        rate: parseFloat(rate),
        is_active: active,
      }),
    onSuccess: () => {
      toast({ title: "Currency commission updated" });
      setOpen(false);
      onUpdated?.();
    },
    onError: (err: any) => {
      toast({
        title: "Update failed",
        description: err?.message ?? "Please try again.",
        variant: "destructive" as any,
      });
    },
  });

  const disabled = isNaN(parseFloat(rate));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <EditIcon className="h-5 w-5 cursor-pointer hover:text-primary transition-colors duration-300 ease-in-out" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Currency Commission</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div>
            <Label>Currency</Label>
            <Input
              value={
                commission.currency?.toUpperCase?.() ?? commission.currency
              }
              disabled
            />
          </div>
          <div>
            <Label>Rate</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={active} onCheckedChange={setActive} />
            <span className="text-sm text-muted-foreground">Active</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={disabled || mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
