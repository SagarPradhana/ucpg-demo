import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { deleteAdminCommissionCurrency } from "@/service/adminservices";
import { useToast } from "@/hooks/use-toast";
import { DeleteIcon } from "lucide-react";

export default function DeleteCurrencyAction({
  commissionId,
  onDeleted,
}: {
  commissionId: string;
  onDeleted?: () => void;
}) {
  const { toast } = useToast();
  const mutation = useMutation({
    mutationFn: () => deleteAdminCommissionCurrency(commissionId),
    onSuccess: () => {
      toast({ title: "Currency commission deleted" });
      onDeleted?.();
    },
    onError: (err: any) =>
      toast({
        title: "Delete failed",
        description: err?.message ?? "Please try again.",
        variant: "destructive" as any,
      }),
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DeleteIcon className="h-5 w-5 cursor-pointer hover:text-destructive transition-colors duration-300 ease-in-out" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Delete currency commission?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete this
          currency commission.
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => mutation.mutate()}>
            {mutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
