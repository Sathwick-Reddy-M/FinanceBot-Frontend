
"use client";

import type { Account, InvestmentAccount } from '@/lib/types';
import { ACCOUNT_TYPE_EMOJIS } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit3, Trash2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  const formatCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(amount);
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl flex items-center">
              <span className="text-2xl mr-2">{ACCOUNT_TYPE_EMOJIS[account.type]}</span>
              {account.name}
            </CardTitle>
            <CardDescription>{account.type} Account</CardDescription>
          </div>
          <Badge variant={account.balance >= 0 ? "secondary" : "destructive"} className="whitespace-nowrap">
            {formatCurrency(account.balance, account.currency)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 pt-2">
        {account.type === 'Investment' && (account as InvestmentAccount).holdings && (account as InvestmentAccount).holdings!.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Top Holdings:</h4>
            <div className="space-y-1">
              {(account as InvestmentAccount).holdings!.slice(0, 3).map((holding) => (
                <div key={holding.id || holding.name} className="flex justify-between items-center text-sm">
                  <span>{holding.name}</span>
                  <span className="text-muted-foreground">{holding.percentage.toFixed(1)}%</span>
                </div>
              ))}
               {(account as InvestmentAccount).holdings!.length > 3 && (
                <p className="text-xs text-muted-foreground text-right">...and { (account as InvestmentAccount).holdings!.length - 3} more</p>
              )}
            </div>
          </div>
        )}
        {account.type === 'CreditCard' && account.creditLimit && account.creditLimit > 0 && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Credit Utilized:</span>
              <span>{((Math.abs(account.balance) / account.creditLimit) * 100).toFixed(1)}%</span>
            </div>
            <Progress value={(Math.abs(account.balance) / account.creditLimit) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1 text-right">Limit: {formatCurrency(account.creditLimit, account.currency)}</p>
          </div>
        )}
        {account.type === 'Loan' && account.originalAmount && account.originalAmount > 0 && (
           <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Loan Paid:</span>
              <span>{(((account.originalAmount - Math.abs(account.balance)) / account.originalAmount) * 100).toFixed(1)}%</span>
            </div>
            <Progress value={((account.originalAmount - Math.abs(account.balance)) / account.originalAmount) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1 text-right">Original: {formatCurrency(account.originalAmount, account.currency)}</p>
          </div>
        )}
        {account.type === 'Banking' && account.bankName && (
          <p className="text-sm text-muted-foreground">Bank: {account.bankName}</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" size="sm" onClick={() => onEdit(account)}>
          <Edit3 className="mr-2 h-4 w-4" /> Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(account)}>
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
