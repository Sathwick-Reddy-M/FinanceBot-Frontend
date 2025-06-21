'use client';

import { Header } from '@/components/app/Header';
import { AccountDashboard } from '@/components/app/AccountDashboard';
import { Chatbot } from '@/components/app/Chatbot';
import { HeroSection } from '@/components/app/HeroSection';
import { UserDetailsSection } from '@/components/app/UserDetailsSection';
import { Button } from '@/components/ui/button';
import { ClipboardPaste } from 'lucide-react'; // Added for icon

const testUserData = {
  "name": "Jhon Doe",
  "age": 25,
  "state": "California",
  "country": "USA",
  "citizen_of": "USA",
  "tax_filing_status": "Single",
  "is_tax_resident": true
};

const testAccountData = [
  {
    "id": "ACCT-789456123",
    "name": "Tech Portfolio",
    "type": "Investment",
    "currency": "USD",
    "balance": 1000,
    "uninvested_amount": 1000,
    "asset_distribution": [
      {
        "ticker": "AAPL",
        "quantity": 50,
        "average_cost_basis": 145,
        "id": "1a2aa103-d018-493a-80a6-588e29404994"
      },
      {
        "ticker": "VTI",
        "quantity": 30,
        "average_cost_basis": 210,
        "id": "1910c7e0-67a0-4a30-b9f9-6cebf1f17e05"
      },
      {
        "ticker": "TSLA",
        "quantity": 10,
        "average_cost_basis": 230,
        "id": "cd477a20-f295-4cef-bbd4-1f85f9f34b1d"
      },
      {
        "ticker": "JNJ",
        "quantity": 20,
        "average_cost_basis": 145.5,
        "id": "36f5e55b-aaf9-4cb1-98fc-de0e84e4df63"
      }
    ]
  },
  {
    "id": "ACCT-456123789",
    "name": "Growth & Income Portfolio",
    "type": "Investment",
    "currency": "USD",
    "balance": 100,
    "uninvested_amount": 100,
    "asset_distribution": [
      {
        "ticker": "MSFT",
        "quantity": 25,
        "average_cost_basis": 365,
        "id": "7fd3f5b7-ac0c-4ef0-be79-695cb617f491"
      },
      {
        "ticker": "VOO",
        "quantity": 15,
        "average_cost_basis": 400,
        "id": "ee2e126c-9c1b-4a78-a67d-43e27490b54c"
      },
      {
        "ticker": "AMZN",
        "quantity": 40,
        "average_cost_basis": 135,
        "id": "b6ea5730-062e-432e-ad12-ac0f6fc8930e"
      },
      {
        "ticker": "KO",
        "quantity": 100,
        "average_cost_basis": 62,
        "id": "545219b1-69d4-4607-926f-a0e533f3e3d7"
      },
      {
        "ticker": "BND",
        "quantity": 50,
        "average_cost_basis": 76.5,
        "id": "f6901af5-8eb8-4c49-9f91-ed3a1ee29aaa"
      }
    ]
  },
  {
    "id": "cc001",
    "name": "Credit Card A",
    "type": "Credit Card",
    "currency": "USD",
    "balance": -6800.45,
    "total_limit": 15000,
    "current_limit": 8200,
    "rewards_summary": "Earn 3% cashback on dining, including takeout and eligible delivery services, 2% on travel including flights, hotels, and transit, and 1% on all other purchases. Points can be redeemed for travel, gift cards, cash back, or transferred to travel partners for greater value.",
    "interest": 19.99,
    "outstanding_debt": 6800.45,
    "current_billing_cycle_transactions": [
      {
        "amount": -75.32,
        "category": "dining"
      },
      {
        "amount": -215.67,
        "category": "travel"
      },
      {
        "amount": 500.25,
        "category": "payment"
      }
    ],
    "annual_fee": 95
  },
  {
    "id": "cc002",
    "name": "Credit Card B",
    "type": "Credit Card",
    "currency": "USD",
    "balance": -49.85,
    "total_limit": 10000,
    "current_limit": 9950,
    "rewards_summary": "Earn unlimited 1.5% cash back on every purchase, every day with no rotating categories or limits to how much you can earn. Includes no foreign transaction fees and access to travel and shopping protection benefits.",
    "interest": 17.49,
    "outstanding_debt": 49.85,
    "current_billing_cycle_transactions": [
      {
        "amount": -25.12,
        "category": "utilities"
      },
      {
        "amount": -24.73,
        "category": "groceries"
      }
    ],
    "annual_fee": 0
  },
  {
    "id": "chk001",
    "name": "Everyday Checking",
    "type": "Checking",
    "currency": "USD",
    "balance": 1543.65,
    "current_amount": 1543.65,
    "rewards_summary": "ATM fee reimbursement up to $10 per month, plus cashback on debit card purchases when enrolled in qualifying programs.",
    "interest": 0.01,
    "overdraft_protection": "Linked to primary savings account for automatic overdraft coverage up to $500.",
    "minimum_balance_requirement": 500,
    "fee": {
      "no_minimum_balance_fee": 12,
      "monthly_fee": 6.95,
      "ATM_fee": 3,
      "overdraft_fee": 35
    },
    "current_billing_cycle_transactions": [
      {
        "amount": -45.87,
        "category": "groceries"
      },
      {
        "amount": -120,
        "category": "subscriptions"
      },
      {
        "amount": 2200,
        "category": "salary"
      }
    ]
  },
  {
    "id": "sav001",
    "name": "High Yield Savings",
    "type": "Savings",
    "currency": "USD",
    "balance": 12450.78,
    "current_amount": 12450.78,
    "rewards_summary": "Earn up to 4.00% APY on balances above $5,000. Free transfers to linked checking. No maintenance fees with $1,000 minimum balance.",
    "interest": 4,
    "overdraft_protection": "Linked to checking account for overdraft protection up to $1000 with no transfer fees.",
    "minimum_balance_requirement": 1000,
    "fee": {
      "no_minimum_balance_fee": 10,
      "monthly_fee": 0,
      "ATM_fee": 0,
      "overdraft_fee": 0
    },
    "current_billing_cycle_transactions": [
      {
        "amount": -200,
        "category": "emergency fund"
      },
      {
        "amount": 500,
        "category": "interest earned"
      }
    ]
  },
  {
    "id": "loan001",
    "name": "Personal Loan - Debt Consolidation",
    "type": "Loan",
    "currency": "USD",
    "balance": -12500.75,
    "principal_left": 12500.75,
    "interest_rate": 6.75,
    "monthly_contribution": 300,
    "loan_term": "5 years",
    "loan_start_date": "2022-05-10",
    "loan_end_date": "2027-05-10",
    "outstanding_balance": 13250.4,
    "total_paid": 4700.6,
    "payment_due_date": "2025-04-20",
    "payment_history": [
      {
        "payment_date": "2025-03-20",
        "amount_paid": 300,
        "remaining_balance": 13250.4
      },
      {
        "payment_date": "2025-02-20",
        "amount_paid": 300,
        "remaining_balance": 13550.4
      },
      {
        "payment_date": "2025-01-20",
        "amount_paid": 300,
        "remaining_balance": 13850.4
      }
    ],
    "loan_type": "personal loan",
    "collateral": "None",
    "current_outstanding_fees": {
      "late_fee": 25,
      "prepayment_penalty": 0,
      "origination_fee": 150,
      "other_fees": 0
    },
    "other_payments": [
      {
        "payment_date": "2024-12-15",
        "payment_amount": 1000,
        "payment_type": "prepayment",
        "description": "End-of-year bonus used for early repayment"
      },
      {
        "payment_date": "2023-06-10",
        "payment_amount": 50,
        "payment_type": "penalty",
        "description": "Late fee payment"
      }
    ]
  },
  {
    "id": "payroll001",
    "name": "John Doe - Payroll",
    "type": "Payroll",
    "currency": "USD",
    "balance": 2354.25,
    "annual_income": 98000,
    "federal_taxes_withheld": 820.45,
    "state": "CA",
    "state_taxes_withheld": 320.3,
    "social_security_withheld": 250,
    "medicare_withheld": 145,
    "other_deductions": 110,
    "net_income": 2354.25,
    "pay_period_start_date": "2025-03-24",
    "pay_period_end_date": "2025-04-06",
    "pay_frequency": "biweekly",
    "benefits": "401(k) contribution, Health Insurance (PPO), Dental, Vision",
    "bonus_income": 0,
    "year_to_date_income": 24500
  }
];

export default function HomePage() {
  const handleLoadTestData = () => {
    sessionStorage.setItem('finview_user_details', JSON.stringify(testUserData));
    sessionStorage.setItem('finview_accounts', JSON.stringify(testAccountData));
    window.location.reload(); // Reload to reflect the changes
  };
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <HeroSection />
      <main id="dashboard" className="flex-grow container mx-auto px-4 py-12 md:py-16">
        <div className="flex justify-end mb-8">
          <Button variant="outline" onClick={handleLoadTestData}>
            <ClipboardPaste className="mr-2 h-4 w-4" />
            Load Test Data
          </Button>
        </div>
        <UserDetailsSection />
        {/* Removed grid layout, stacking AccountDashboard and Chatbot vertically */}
        <div className="mt-8"> {/* Spacing for UserDetailsSection */}
          <AccountDashboard />
        </div>
        <div id="ai-chat" className="mt-12 w-full"> {/* Added mt-12 for spacing and ensured full width */}
          <Chatbot />
        </div>
      </main>
    </div>
  );
}

