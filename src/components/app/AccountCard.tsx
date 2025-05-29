


import type { Account, AccountType, TSInvestmentAccount, TSCreditCardAccount, TSLoanAccount, TSCheckingAccount, TSSavingsAccount, TSPayrollAccount, TSHSAAccount, TSTraditionalIRAAccount, TSRothIRAAccount, TSRetirement401kAccount, TSRoth401kAccount, TSOtherAccount, AssetDistribution } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit3, Trash2, TrendingUp, Landmark, Briefcase, CreditCardIcon, Layers, ShieldCheck, PiggyBank, Building2, FileText, FileSpreadsheet, WalletCards, Banknote } from 'lucide-react'; // Added WalletCards, Banknote
import { Progress } from '@/components/ui/progress';

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}

const AccountTypeVisuals: Record<AccountType, { icon: React.ElementType, emoji: string }> = {
  'Investment': { icon: TrendingUp, emoji: "📈" },
  'HSA': { icon: ShieldCheck, emoji: "🏥" },
  'Traditional IRA': { icon: PiggyBank, emoji: "👴" },
  'Roth IRA': { icon: PiggyBank, emoji: "🌅" },
  'Retirement 401k': { icon: Briefcase, emoji: "🏢" },
  'Roth 401k': { icon: Building2, emoji: "🏦" },
  'Credit Card': { icon: CreditCardIcon, emoji: "💳" },
  'Checking': { icon: WalletCards, emoji: "💵" }, // Updated
  'Savings': { icon: Banknote, emoji: "💰" },   // Updated
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
      case 'Investment': {
        const invAcc = account as TSInvestmentAccount;
        return (
          <>
            <p className="text-sm">Uninvested: {formatCurrency(invAcc.uninvested_amount, account.currency)}</p>
            {invAcc.asset_distribution && invAcc.asset_distribution.length > 0 && (
              <div className="mt-3">
                <h4 className="text-xs font-medium text-muted-foreground mt-2 mb-1">Top Assets:</h4>
                <div className="space-y-0.5">
                  {invAcc.asset_distribution.slice(0, 2).map((asset: AssetDistribution) => (
                    <div key={asset.id || asset.ticker} className="flex justify-between items-center text-xs">
                      <span>{asset.ticker} ({asset.quantity} units)</span>
                      <span className="text-muted-foreground">Avg. Cost: {formatCurrency(asset.average_cost_basis, account.currency)}</span>
                    </div>
                  ))}
                  {invAcc.asset_distribution.length > 2 && (
                    <p className="text-xs text-muted-foreground text-right">...and {invAcc.asset_distribution.length - 2} more</p>
                  )}
                </div>
              </div>
            )}
          </>
        );
      }
      case 'HSA':
      case 'Traditional IRA':
      case 'Roth IRA': {
        const invAcc = account as TSHSAAccount | TSTraditionalIRAAccount | TSRothIRAAccount;
        return (
          <>
            <p className="text-sm">Uninvested: {formatCurrency(invAcc.uninvested_amount, account.currency)}</p>
            <p className="text-sm">Avg. Monthly Contrib.: {formatCurrency(invAcc.average_monthly_contribution, account.currency)}</p>
            {invAcc.asset_distribution && invAcc.asset_distribution.length > 0 && (
              <div className="mt-3">
                <h4 className="text-xs font-medium text-muted-foreground mt-2 mb-1">Top Assets:</h4>
                 <div className="space-y-0.5">
                  {invAcc.asset_distribution.slice(0, 2).map((asset: AssetDistribution) => (
                    <div key={asset.id || asset.ticker} className="flex justify-between items-center text-xs">
                      <span>{asset.ticker} ({asset.quantity} units)</span>
                      <span className="text-muted-foreground">Avg. Cost: {formatCurrency(asset.average_cost_basis, account.currency)}</span>
                    </div>
                  ))}
                  {invAcc.asset_distribution.length > 2 && (
                    <p className="text-xs text-muted-foreground text-right">...and {invAcc.asset_distribution.length - 2} more</p>
                  )}
                </div>
              </div>
            )}
          </>
        );
      }
      case 'Retirement 401k':
      case 'Roth 401k': {
        const invAcc = account as TSRetirement401kAccount | TSRoth401kAccount;
         return (
          <>
            <p className="text-sm">Uninvested: {formatCurrency(invAcc.uninvested_amount, account.currency)}</p>
            <p className="text-sm">Avg. Monthly Contrib.: {formatCurrency(invAcc.average_monthly_contribution, account.currency)}</p>
            <p className="text-sm">Employer Match: {invAcc.employer_match}</p>
            {invAcc.asset_distribution && invAcc.asset_distribution.length > 0 && (
              <div className="mt-3">
                <h4 className="text-xs font-medium text-muted-foreground mt-2 mb-1">Top Assets:</h4>
                 <div className="space-y-0.5">
                  {invAcc.asset_distribution.slice(0, 2).map((asset: AssetDistribution) => (
                    <div key={asset.id || asset.ticker} className="flex justify-between items-center text-xs">
                      <span>{asset.ticker} ({asset.quantity} units)</span>
                      <span className="text-muted-foreground">Avg. Cost: {formatCurrency(asset.average_cost_basis, account.currency)}</span>
                    </div>
                  ))}
                  {invAcc.asset_distribution.length > 2 && (
                    <p className="text-xs text-muted-foreground text-right">...and {invAcc.asset_distribution.length - 2} more</p>
                  )}
                </div>
              </div>
            )}
          </>
        );
      }
      case 'Credit Card': {
        const ccAcc = account as TSCreditCardAccount;
        const utilization = ccAcc.total_limit && ccAcc.outstanding_debt ? (Math.abs(ccAcc.outstanding_debt) / ccAcc.total_limit) * 100 : 0;
        return (
          <>
            <p className="text-sm">Limit: {formatCurrency(ccAcc.total_limit, account.currency)}</p>
            <p className="text-sm">Current Limit: {formatCurrency(ccAcc.current_limit, account.currency)}</p>
            {ccAcc.total_limit > 0 && (
              <div>
                <div className="flex justify-between text-xs mt-1 mb-0.5">
                  <span className="text-muted-foreground">Utilized:</span>
                  <span>{utilization.toFixed(1)}%</span>
                </div>
                <Progress value={utilization} className="h-1.5" />
              </div>
            )}
            <p className="text-sm mt-1">APR: {ccAcc.interest}%</p>
            {ccAcc.annual_fee > 0 && <p className="text-sm">Annual Fee: {formatCurrency(ccAcc.annual_fee, account.currency)}</p>}
          </>
        );
      }
      case 'Checking':
      case 'Savings': {
        const csAcc = account as TSCheckingAccount | TSSavingsAccount; // Use combined type for shared fields
        return (
          <>
            <p className="text-sm">Interest Rate: {csAcc.interest}% APY</p>
            <p className="text-sm">Min Balance: {formatCurrency(csAcc.minimum_balance_requirement, account.currency)}</p>
          </>
        );
      }
      case 'Loan': {
        const loanAcc = account as TSLoanAccount;
        const impliedOriginalAmount = Math.abs(loanAcc.principal_left) + loanAcc.total_paid;
        const loanPaidPercentage = impliedOriginalAmount > 0 ? (loanAcc.total_paid / impliedOriginalAmount) * 100 : 0;
        
        return (
          <>
            <p className="text-sm">Type: {loanAcc.loan_type}</p>
            <p className="text-sm">Interest Rate: {loanAcc.interest_rate}%</p>
            {impliedOriginalAmount > 0 && (
               <div>
                <div className="flex justify-between text-xs mt-1 mb-0.5">
                  <span className="text-muted-foreground">Loan Paid:</span>
                  <span>{loanPaidPercentage > 0 ? loanPaidPercentage.toFixed(1) : 0}%</span>
                </div>
                <Progress value={loanPaidPercentage > 0 ? loanPaidPercentage : 0} className="h-1.5" />
                <p className="text-xs text-muted-foreground mt-0.5 text-right">Total Paid: {formatCurrency(loanAcc.total_paid, account.currency)}</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">Next Due: {new Date(loanAcc.payment_due_date).toLocaleDateString()}</p>
          </>
        );
      }
      case 'Payroll': {
        const payrollAcc = account as TSPayrollAccount;
        return (
          <>
            <p className="text-sm">Annual Income: {formatCurrency(payrollAcc.annual_income, account.currency)}</p>
            <p className="text-sm">Net Income (last period): {formatCurrency(payrollAcc.net_income, account.currency)}</p>
            <p className="text-xs text-muted-foreground">Frequency: {payrollAcc.pay_frequency}</p>
          </>
        );
      }
       case 'Other': {
        const otherAcc = account as TSOtherAccount;
        return (
          <>
            <p className="text-sm">Total Income/Assets: {formatCurrency(otherAcc.total_income, account.currency)}</p>
            <p className="text-sm">Total Debt/Liabilities: {formatCurrency(otherAcc.total_debt, account.currency)}</p>
          </>
        );
       }
      default:
        // This should be unreachable if all types are handled
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
              <CardTitle className="text-lg leading-tight">
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
      <CardContent className="flex-grow space-y-1.5 pt-2 text-sm">
        {renderAccountSpecificDetails()}
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
