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
    "name": "Chase Sapphire Preferred",
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
    "name": "Capital One Quicksilver",
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
    "id": "cc003",
    "name": "American Express Gold Card",
    "type": "Credit Card",
    "currency": "USD",
    "balance": -5800.91,
    "total_limit": 20000,
    "current_limit": 14200,
    "rewards_summary": "Earn 4X Membership Rewards points at restaurants, including takeout and delivery, and at U.S. supermarkets (up to $25,000 per year), 3X points on flights booked directly with airlines or on amextravel.com, and 1X on all other purchases. Additional benefits include monthly dining credits and no foreign transaction fees.",
    "interest": 20.74,
    "outstanding_debt": 5800.91,
    "current_billing_cycle_transactions": [
      {
        "amount": -100.88,
        "category": "groceries"
      },
      {
        "amount": -300.56,
        "category": "flights"
      },
      {
        "amount": -200.49,
        "category": "dining"
      },
      {
        "amount": 200.15,
        "category": "payment"
      }
    ],
    "annual_fee": 250
  },
  {
    "id": "cc004",
    "name": "Wells Fargo Active Cash",
    "type": "Credit Card",
    "currency": "USD",
    "balance": -2350.2,
    "total_limit": 12000,
    "current_limit": 9650,
    "rewards_summary": "Earn unlimited 2% cash rewards on purchases with no category restrictions or annual fee. Cardholders also benefit from cell phone protection when the bill is paid with this card, and access to Visa Signature Concierge services and travel protections.",
    "interest": 18.74,
    "outstanding_debt": 2350.2,
    "current_billing_cycle_transactions": [
      {
        "amount": -150.75,
        "category": "electronics"
      },
      {
        "amount": -200.33,
        "category": "subscriptions"
      },
      {
        "amount": 300,
        "category": "payment"
      }
    ],
    "annual_fee": 0
  },
  {
    "id": "cc005",
    "name": "Citi Custom Cash Card",
    "type": "Credit Card",
    "currency": "USD",
    "balance": -60,
    "total_limit": 8000,
    "current_limit": 7940,
    "rewards_summary": "Automatically earn 5% cash back on your top eligible spend category each billing cycle (up to $500), including restaurants, gas stations, groceries, and more. Earn 1% on all other purchases, with rewards automatically adjusted based on your spending habits.",
    "interest": 16.99,
    "outstanding_debt": 60,
    "current_billing_cycle_transactions": [
      {
        "amount": -60,
        "category": "gas"
      }
    ],
    "annual_fee": 0
  },
  {
    "id": "cc006",
    "name": "Discover it Cash Back",
    "type": "Credit Card",
    "currency": "USD",
    "balance": -1375,
    "total_limit": 9500,
    "current_limit": 8125,
    "rewards_summary": "Earn 5% cash back on everyday purchases at different places each quarter like Amazon.com, grocery stores, restaurants, and gas stations—up to the quarterly maximum when activated. Plus, 1% unlimited cash back on all other purchases and a dollar-for-dollar cash back match at the end of the first year.",
    "interest": 21.49,
    "outstanding_debt": 1375,
    "current_billing_cycle_transactions": [
      {
        "amount": -125.45,
        "category": "groceries"
      },
      {
        "amount": -150,
        "category": "online shopping"
      },
      {
        "amount": 200,
        "category": "payment"
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
    "id": "chk002",
    "name": "SmartSpend Account",
    "type": "Checking",
    "currency": "USD",
    "balance": -75.4,
    "current_amount": -75.4,
    "rewards_summary": "No monthly maintenance fees with direct deposit; free online bill pay and mobile check deposits. Earn 0.25% cashback on select debit card purchases.",
    "interest": 0,
    "overdraft_protection": "Linked to credit card for up to $1000 overdraft coverage with interest.",
    "minimum_balance_requirement": 0,
    "fee": {
      "no_minimum_balance_fee": 0,
      "monthly_fee": 0,
      "ATM_fee": 2.5,
      "overdraft_fee": 34
    },
    "current_billing_cycle_transactions": [
      {
        "amount": -55,
        "category": "transportation"
      },
      {
        "amount": -150,
        "category": "groceries"
      },
      {
        "amount": 100,
        "category": "refund"
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
    "id": "sav002",
    "name": "Student Saver",
    "type": "Savings",
    "currency": "USD",
    "balance": 825.32,
    "current_amount": 825.32,
    "rewards_summary": "0.25% APY, no monthly maintenance fees for students under 24. Automatic savings transfers from linked debit purchases.",
    "interest": 0.25,
    "overdraft_protection": "Overdraft coverage available through overdraft line of credit if linked to checking.",
    "minimum_balance_requirement": 0,
    "fee": {
      "no_minimum_balance_fee": 0,
      "monthly_fee": 0,
      "ATM_fee": 2,
      "overdraft_fee": 32
    },
    "current_billing_cycle_transactions": [
      {
        "amount": 50,
        "category": "round-up deposit"
      },
      {
        "amount": -75,
        "category": "tuition"
      }
    ]
  },
  {
    "id": "sav003",
    "name": "Emergency Reserve",
    "type": "Savings",
    "currency": "USD",
    "balance": 7025.1,
    "current_amount": 7025.1,
    "rewards_summary": "Tiered interest rates starting at 1.50% APY. Up to 6 free withdrawals per month. ATM fee refunds up to $20 annually.",
    "interest": 1.5,
    "overdraft_protection": "Covers checking overdrafts up to $250 with no interest if paid back within 5 days.",
    "minimum_balance_requirement": 500,
    "fee": {
      "no_minimum_balance_fee": 5,
      "monthly_fee": 2.5,
      "ATM_fee": 3,
      "overdraft_fee": 30
    },
    "current_billing_cycle_transactions": [
      {
        "amount": -600,
        "category": "car repair"
      },
      {
        "amount": 300,
        "category": "paycheck allocation"
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
  },
  {
    "id": "ira001",
    "name": "John Doe's Traditional IRA",
    "type": "Traditional IRA",
    "currency": "USD",
    "balance": 1000,
    "uninvested_amount": 1000,
    "asset_distribution": [
      {
        "ticker": "AAPL",
        "quantity": 50,
        "average_cost_basis": 145.3,
        "id": "f6c55741-0b28-42c9-9454-8013d792c5f4"
      },
      {
        "ticker": "MSFT",
        "quantity": 30,
        "average_cost_basis": 310.2,
        "id": "331ffd35-daba-4561-88d9-269a48d37a6c"
      }
    ],
    "average_monthly_contribution": 500
  },
  {
    "id": "ira002",
    "name": "Ava Smith's Traditional IRA",
    "type": "Traditional IRA",
    "currency": "USD",
    "balance": 121,
    "uninvested_amount": 121,
    "asset_distribution": [
      {
        "ticker": "VTI",
        "quantity": 100,
        "average_cost_basis": 210,
        "id": "a588a582-232b-4d8d-9e0e-8f07371ae67a"
      },
      {
        "ticker": "BND",
        "quantity": 50,
        "average_cost_basis": 80,
        "id": "64336cde-aa64-49a7-9aa0-9e425038cc7b"
      }
    ],
    "average_monthly_contribution": 350
  },
  {
    "id": "roth001",
    "name": "Emily Johnson's Roth IRA",
    "type": "Roth IRA",
    "currency": "USD",
    "balance": 0,
    "uninvested_amount": 0,
    "asset_distribution": [
      {
        "ticker": "TSLA",
        "quantity": 40,
        "average_cost_basis": 550,
        "id": "fed2e23b-002c-44f3-8930-cd0e8e4a7947"
      },
      {
        "ticker": "JNJ",
        "quantity": 50,
        "average_cost_basis": 155,
        "id": "3e8d8de1-6ec7-4913-b760-7af2009b406f"
      },
      {
        "ticker": "VIG",
        "quantity": 30,
        "average_cost_basis": 150,
        "id": "8111e8c0-ba5a-467b-88f6-ef799e9bf37b"
      }
    ],
    "average_monthly_contribution": 450
  },
  {
    "id": "k401001",
    "name": "Mark Taylor's 401(k)",
    "type": "Retirement 401k",
    "currency": "USD",
    "balance": 0,
    "uninvested_amount": 0,
    "asset_distribution": [
      {
        "ticker": "GOOGL",
        "quantity": 25,
        "average_cost_basis": 2600,
        "id": "27ffc3c8-39cb-4718-b125-0d4a719a1bcd"
      },
      {
        "ticker": "VZ",
        "quantity": 150,
        "average_cost_basis": 50,
        "id": "ed1a8d10-179b-43b2-8c9f-786c8e70a955"
      },
      {
        "ticker": "SPY",
        "quantity": 30,
        "average_cost_basis": 440,
        "id": "cbabb021-d29f-4460-a63f-56fb043b5a69"
      }
    ],
    "average_monthly_contribution": 800,
    "employer_match": "The employer contributes 100% of the first 5% of the employee's salary, meaning if Mark contributes 5% of his salary towards the 401(k), his employer matches it dollar-for-dollar. If he contributes 6%, only the first 5% gets matched. This employer match is automatically deposited monthly."
  },
  {
    "id": "k401002",
    "name": "Sophia Green's 401(k)",
    "type": "Retirement 401k",
    "currency": "USD",
    "balance": 0,
    "uninvested_amount": 0,
    "asset_distribution": [
      {
        "ticker": "VTI",
        "quantity": 80,
        "average_cost_basis": 210,
        "id": "100827c8-f6de-4094-9786-037a7ccb8520"
      },
      {
        "ticker": "BND",
        "quantity": 50,
        "average_cost_basis": 82,
        "id": "526fb780-8877-4f15-96c9-24fcf1afb752"
      }
    ],
    "average_monthly_contribution": 1200,
    "employer_match": "The employer offers a 50% match on employee contributions up to 8% of their annual salary. This means if Sophia contributes 8%, her employer will match 4% of her salary. The match is deposited quarterly into her 401(k) account."
  },
  {
    "id": "k401003",
    "name": "James Wilson's 401(k)",
    "type": "Retirement 401k",
    "currency": "USD",
    "balance": 1000,
    "uninvested_amount": 1000,
    "asset_distribution": [
      {
        "ticker": "MSFT",
        "quantity": 40,
        "average_cost_basis": 310,
        "id": "86b9659f-a275-4092-9e1c-51d89d5d3dc9"
      },
      {
        "ticker": "VEU",
        "quantity": 100,
        "average_cost_basis": 57,
        "id": "80e5d2de-6251-4722-9f62-4da928801f0a"
      },
      {
        "ticker": "VIG",
        "quantity": 70,
        "average_cost_basis": 150,
        "id": "25b4a3db-ce54-4519-9e2d-d1bf00841b9f"
      }
    ],
    "average_monthly_contribution": 1500,
    "employer_match": "James' employer offers a 3% employer match contribution for all employees. If James contributes at least 3% of his salary into his 401(k), his employer will match his contributions at a 3% rate, which is automatically deposited into his 401(k) account every month."
  },
  {
    "id": "k401004",
    "name": "Emma Davis's Roth 401(k)",
    "type": "Roth 401k",
    "currency": "USD",
    "balance": 1000,
    "uninvested_amount": 1000,
    "asset_distribution": [
      {
        "ticker": "VTI",
        "quantity": 60,
        "average_cost_basis": 220,
        "id": "27201553-7c40-4011-bdea-23fe5fe83aeb"
      },
      {
        "ticker": "QCOM",
        "quantity": 45,
        "average_cost_basis": 130,
        "id": "40b0a5ef-8f6f-4c07-bf7c-a4c0b2aae4de"
      }
    ],
    "average_monthly_contribution": 1000,
    "employer_match": "Emma's employer offers a 100% match on employee contributions up to 6% of their annual salary. If Emma contributes at least 6% of her salary towards her Roth 401(k), the employer will match this 100%. The matching contribution is made on a monthly basis."
  },
  {
    "id": "hsa001",
    "name": "John Doe's HSA",
    "type": "HSA",
    "currency": "USD",
    "balance": 0,
    "uninvested_amount": 0,
    "asset_distribution": [
      {
        "ticker": "VHT",
        "quantity": 100,
        "average_cost_basis": 235,
        "id": "e1311c47-34c0-4e90-8bd6-f88b8c8d56a7"
      },
      {
        "ticker": "SCHD",
        "quantity": 50,
        "average_cost_basis": 70,
        "id": "a40d7ad4-568b-488c-b278-0f07a90fdb68"
      }
    ],
    "average_monthly_contribution": 300
  },
  {
    "id": "other001",
    "name": "Freelance Income",
    "type": "Other",
    "currency": "USD",
    "balance": 3000,
    "total_income": 4500,
    "total_debt": 1500
  },
  {
    "id": "other002",
    "name": "Side Business Income",
    "type": "Other",
    "currency": "USD",
    "balance": 1400.5,
    "total_income": 2200.5,
    "total_debt": 800
  },
  {
    "id": "other003",
    "name": "Rental Property Income",
    "type": "Other",
    "currency": "USD",
    "balance": -16500,
    "total_income": 3500,
    "total_debt": 20000
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

