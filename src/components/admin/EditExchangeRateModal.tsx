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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { EditIcon } from "lucide-react";

// Placeholder for the actual update function
const updateExchangeRate = async (symbol: string, data: { price: number }) => {
  console.log(`Updating ${symbol} with price ${data.price}`);
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // In a real app, you would make an API call here
  // For example:
  // await axios.put(`/api/exchange-rates/${symbol}`, data);
  return { ...data, symbol };
};

export type ExchangeRate = {
  symbol: string;
  price: number;
};

export default function EditExchangeRateModal({
  rate,
  onUpdated,
}: {
  rate: ExchangeRate;
  onUpdated?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState(String(rate.price ?? 0));
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newPrice: number) =>
      updateExchangeRate(rate.symbol, { price: newPrice }),
    onSuccess: () => {
      toast({ title: "Exchange rate updated successfully" });
      setOpen(false);
      // Invalidate and refetch the exchange rates query to see the changes
      queryClient.invalidateQueries({ queryKey: ["admin-exchange-settings"] });
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

  const disabled = isNaN(parseFloat(price));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <EditIcon className="h-5 w-5 cursor-pointer hover:text-primary transition-colors duration-300 ease-in-out" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Exchange Rate</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div>
            <Label>Currency Pair</Label>
            <Input
              value={rate.symbol?.toUpperCase?.() ?? rate.symbol}
              disabled
            />
          </div>
          <div>
            <Label>Price</Label>
            <Input
              type="number"
              step="0.000001"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate(parseFloat(price))}
            disabled={disabled || mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
