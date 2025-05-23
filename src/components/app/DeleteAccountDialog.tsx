
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAccounts } from "@/contexts/AccountContext";
import type { Account } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface DeleteAccountDialogProps {
  account: Account | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function DeleteAccountDialog({ account, isOpen, onOpenChange }: DeleteAccountDialogProps) {
  const { deleteAccount } = useAccounts();
  const { toast } = useToast();

  const handleDelete = () => {
    if (account) {
      deleteAccount(account.id);
      toast({ title: "Success", description: `Account "${account.name}" deleted.`});
      onOpenChange(false);
    }
  };

  if (!account) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this account?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will permanently delete the account "{account.name}" with a balance of {account.currency} {account.balance.toLocaleString()}. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={handleDelete}>Delete Account</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
