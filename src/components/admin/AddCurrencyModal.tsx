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
import { useMutation } from "@tanstack/react-query";
import { createAdminCommissionCurrency } from "@/service/adminservices";
import { useToast } from "@/hooks/use-toast";

export default function AddCurrencyModal({
  onCreated,
}: {
  onCreated?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState("");
  const [rate, setRate] = useState("");
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: () =>
      createAdminCommissionCurrency({ currency, rate: parseFloat(rate) }),
    onSuccess: () => {
      toast({ title: "Currency commission added" });
      setOpen(false);
      setCurrency("");
      setRate("");
      onCreated?.();
    },
    onError: (err: any) => {
      toast({
        title: "Add failed",
        description: err?.message ?? "Please try again.",
        variant: "destructive" as any,
      });
    },
  });

  const disabled = !currency || isNaN(parseFloat(rate));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default">
          Add Currency
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Currency Commission</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div>
            <Label>Currency</Label>
            <Input
              placeholder="e.g. BTC"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
          </div>
          <div>
            <Label>Commission</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 5"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
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
