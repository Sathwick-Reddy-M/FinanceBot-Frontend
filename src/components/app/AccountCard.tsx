
"use client";

import type { Account, AccountType, TSInvestmentAccount, TSCreditCardAccount, TSLoanAccount, TSCheckingOrSavingsAccount, TSPayrollAccount, TSHSAAccount, TSTraditionalIRAAccount, TSRothIRAAccount, TSRetirement401kAccount, TSRoth401kAccount, TSOtherAccount } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit3, Trash2, TrendingUp, Landmark, Briefcase, CreditCardIcon, Layers, ShieldCheck, PiggyBank, Building2, FileText, FileSpreadsheet, DollarSign } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}

// Updated Visuals to match new Account Types
const AccountTypeVisuals: Record<AccountType, { icon: React.ElementType, emoji: string }> = {
  'Investment': { icon: TrendingUp, emoji: "📈" },
  'HSA': { icon: ShieldCheck, emoji: "🏥" },
  'Traditional IRA': { icon: PiggyBank, emoji: "👴" },
  'Roth IRA': { icon: PiggyBank, emoji: "🌅" }, // Could use a different icon/emoji if desired
  'Retirement 401k': { icon: Briefcase, emoji: "🏢" },
  'Roth 401k': { icon: Building2, emoji: "🏦" },
  'Credit Card': { icon: CreditCardIcon, emoji: "💳" },
  'Checking/Savings': { icon: Landmark, emoji: "💵" },
  'Loan': { icon: FileText, emoji: "📄" },
  'Payroll': { icon: FileSpreadsheet, emoji: "💼" },
  'Other': { icon: Layers, emoji: "🧾" },
};


export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  const formatCurrency = (amount: number | undefined, currencyCode: string) => {
    if (amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(amount);
  };

  const VisualInfo = AccountTypeVisuals[account.type];

  const renderAccountSpecificDetails = () => {
    switch (account.type) {
      case 'Investment':
      case 'HSA':
      case 'Traditional IRA':
      case 'Roth IRA':
      case 'Retirement 401k':
      case 'Roth 401k':
        const invAcc = account as TSInvestmentAccount | TSHSAAccount | TSTraditionalIRAAccount | TSRothIRAAccount | TSRetirement401kAccount | TSRoth401kAccount;
        return (
          <>
            {invAcc.uninvestedAmount !== undefined && <p className="text-sm">Uninvested: {formatCurrency(invAcc.uninvestedAmount, account.currency)}</p>}
            {invAcc.averageMonthlyContribution !== undefined && <p className="text-sm">Avg. Monthly Contrib.: {formatCurrency(invAcc.averageMonthlyContribution, account.currency)}</p>}
            {('employerMatch' in invAcc) && invAcc.employerMatch && <p className="text-sm">Employer Match: {invAcc.employerMatch}</p>}
            {invAcc.holdings && invAcc.holdings.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mt-2 mb-1">Top Holdings:</h4>
                <div className="space-y-0.5">
                  {invAcc.holdings.slice(0, 2).map((holding) => (
                    <div key={holding.id || holding.name} className="flex justify-between items-center text-xs">
                      <span>{holding.name}</span>
                      <span className="text-muted-foreground">{holding.percentage.toFixed(1)}%</span>
                    </div>
                  ))}
                  {invAcc.holdings.length > 2 && (
                    <p className="text-xs text-muted-foreground text-right">...and {invAcc.holdings.length - 2} more</p>
                  )}
                </div>
              </div>
            )}
          </>
        );
      case 'Credit Card':
        const ccAcc = account as TSCreditCardAccount;
        const utilization = ccAcc.totalLimit && ccAcc.outstandingDebt ? (Math.abs(ccAcc.outstandingDebt) / ccAcc.totalLimit) * 100 : 0;
        return (
          <>
            {ccAcc.totalLimit !== undefined && <p className="text-sm">Limit: {formatCurrency(ccAcc.totalLimit, account.currency)}</p>}
            {ccAcc.outstandingDebt !== undefined && ccAcc.totalLimit !== undefined && ccAcc.totalLimit > 0 && (
              <div>
                <div className="flex justify-between text-xs mt-1 mb-0.5">
                  <span className="text-muted-foreground">Utilized:</span>
                  <span>{utilization.toFixed(1)}%</span>
                </div>
                <Progress value={utilization} className="h-1.5" />
              </div>
            )}
            {ccAcc.interestRate !== undefined && <p className="text-sm mt-1">APR: {ccAcc.interestRate}%</p>}
            {ccAcc.dueDate && <p className="text-xs text-muted-foreground">Due: {new Date(ccAcc.dueDate).toLocaleDateString()}</p>}
          </>
        );
      case 'Checking/Savings':
        const csAcc = account as TSCheckingOrSavingsAccount;
        return (
          <>
            {csAcc.bankName && <p className="text-sm">Bank: {csAcc.bankName}</p>}
            {csAcc.interestRate !== undefined && <p className="text-sm">Interest Rate: {csAcc.interestRate}% APY</p>}
            {csAcc.accountNumberLast4 && <p className="text-xs text-muted-foreground">Acc #: ******{csAcc.accountNumberLast4}</p>}
          </>
        );
      case 'Loan':
        const loanAcc = account as TSLoanAccount;
        const loanPaidPercentage = loanAcc.originalAmount && loanAcc.balance ? ((loanAcc.originalAmount - Math.abs(loanAcc.balance)) / loanAcc.originalAmount) * 100 : 0;
        return (
          <>
            {loanAcc.loanType && <p className="text-sm">Type: {loanAcc.loanType}</p>}
            {loanAcc.interestRate !== undefined && <p className="text-sm">Interest Rate: {loanAcc.interestRate}%</p>}
            {loanAcc.originalAmount !== undefined && loanAcc.originalAmount > 0 && (
               <div>
                <div className="flex justify-between text-xs mt-1 mb-0.5">
                  <span className="text-muted-foreground">Loan Paid:</span>
                  <span>{loanPaidPercentage > 0 ? loanPaidPercentage.toFixed(1) : 0}%</span>
                </div>
                <Progress value={loanPaidPercentage > 0 ? loanPaidPercentage : 0} className="h-1.5" />
                <p className="text-xs text-muted-foreground mt-0.5 text-right">Original: {formatCurrency(loanAcc.originalAmount, account.currency)}</p>
              </div>
            )}
            {loanAcc.nextPaymentDueDate && <p className="text-xs text-muted-foreground">Next Due: {new Date(loanAcc.nextPaymentDueDate).toLocaleDateString()}</p>}
          </>
        );
      case 'Payroll':
        const payrollAcc = account as TSPayrollAccount;
        return (
          <>
            {payrollAcc.employerName && <p className="text-sm">Employer: {payrollAcc.employerName}</p>}
            {payrollAcc.annualIncome !== undefined && <p className="text-sm">Annual Income: {formatCurrency(payrollAcc.annualIncome, account.currency)}</p>}
            {payrollAcc.payFrequency && <p className="text-xs text-muted-foreground">Frequency: {payrollAcc.payFrequency}</p>}
          </>
        );
       case 'Other':
        const otherAcc = account as TSOtherAccount;
        return (
          <>
            {otherAcc.totalAssetValue !== undefined && <p className="text-sm">Total Assets: {formatCurrency(otherAcc.totalAssetValue, account.currency)}</p>}
            {otherAcc.totalLiabilityValue !== undefined && <p className="text-sm">Total Liabilities: {formatCurrency(otherAcc.totalLiabilityValue, account.currency)}</p>}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full border border-border/70">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            {VisualInfo && <VisualInfo.icon className="h-7 w-7 text-primary flex-shrink-0" />}
            <div>
              <CardTitle className="text-lg leading-tight"> {/* Adjusted size */}
                {account.name}
              </CardTitle>
              <CardDescription className="text-xs">{account.type} Account</CardDescription>
            </div>
          </div>
          <Badge variant={account.balance >= 0 ? "secondary" : "destructive"} className="whitespace-nowrap text-sm px-2.5 py-1">
            {formatCurrency(account.balance, account.currency)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-1.5 pt-2 text-sm"> {/* Smaller spacing */}
        {renderAccountSpecificDetails()}
        {account.description && (
          <p className="text-xs text-muted-foreground italic pt-1.5 border-t border-border/50 mt-2">{account.description}</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2 pt-3">
        <Button variant="outline" size="sm" onClick={() => onEdit(account)}>
          <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(account)}>
          <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
