export type CardBrand = 'mastercard' | 'visa' | 'elo' | 'amex' | 'other'

export type CardColorScheme = 'black' | 'titanium' | 'emerald' | 'gold' | 'purple' | 'blue'

export interface CreditCard {
  id: string
  name: string
  bank: string
  brand: CardBrand
  lastFourDigits: string
  colorScheme: CardColorScheme
  creditLimit: number
  closingDay: number // Dia de fechamento da fatura (ex: 5)
  dueDay: number // Dia de vencimento da fatura (ex: 12)
  isVirtual?: boolean
  notes?: string
  createdAt: string
}

export type AccountType = 'checking' | 'investment' | 'savings' | 'cash'

export interface BankAccount {
  id: string
  name: string
  bank: string
  accountType: AccountType
  initialBalance: number
  color: string
  customBgColor?: string // Cor de fundo personalizada opcional
  agency?: string
  accountNumber?: string
  notes?: string
  createdAt: string
}

export type TransactionType = 'income' | 'expense'

export type PaymentMethod = 'credit_card' | 'cash_or_account' | 'pix' | 'bank_transfer'

export type TransactionStatus = 'paid' | 'pending'

export type CategoryGroup = 'essential' | 'lifestyle' | 'investment' | 'revenue' | 'business' | 'other'

export interface Category {
  id: string
  name: string
  icon: string
  group: CategoryGroup
  color: string
}

export interface Transaction {
  id: string
  description: string // Descrição do gasto (com o que gastou)
  cardStatementName?: string // Nome de como aparece na fatura do cartão (ex: MP*PADARIA, PAG*RESTAURANTE)
  amount: number
  type: TransactionType
  paymentMethod: PaymentMethod
  creditCardId?: string
  bankAccountId?: string // Conta bancária de débito/crédito
  installmentsTotal?: number // ex: 10 parcelas
  installmentNumber?: number // ex: parcela 3
  parentInstallmentId?: string // id agrupador da compra original parcelada
  category: string
  categoryGroup: CategoryGroup
  date: string // YYYY-MM-DD da compra/registro
  time?: string // HH:mm do momento da transação (ex: 14:32)
  dueDate: string // YYYY-MM-DD da efetivação no fluxo de caixa (se cartão, vencimento da fatura)
  status: TransactionStatus
  notes?: string
  tags?: string[]
  createdAt: string
}

export interface CardInvoice {
  cardId: string
  cardName: string
  monthYear: string // YYYY-MM
  closingDate: string // YYYY-MM-DD
  dueDate: string // YYYY-MM-DD
  status: 'open' | 'closed' | 'paid'
  totalAmount: number
  transactions: Transaction[]
}

export interface CashFlowDay {
  date: string
  incomes: number
  expenses: number
  net: number
  projectedBalance: number
  transactions: Transaction[]
  isPastOrToday: boolean
}

export interface CashFlowSummary {
  realizedBalance: number // Dinheiro líquido consolidado em contas
  projectedMonthEndBalance: number // Projeção com tudo que tem para entrar e sair
  periodIncomesRealized: number
  periodIncomesPending: number
  periodExpensesRealized: number
  periodExpensesPending: number
  totalIncomes: number
  totalExpenses: number
  netPeriodResult: number
  savingsRatePercentage: number
}

export interface CardsMetricsSummary {
  totalLimit: number
  totalUsed: number
  totalAvailable: number
  usagePercentage: number
  currentMonthInvoicesTotal: number
  nextMonthInvoicesTotal: number
  totalActiveInstallmentsCount: number
}

export interface DetailedBankAccount extends BankAccount {
  currentBalance: number
  incomesTotal: number
  expensesTotal: number
  pendingIncomesTotal: number
  pendingExpensesTotal: number
  transactionsCount: number
}

export type PeriodFilter = 
  | 'this_month'
  | 'next_month'
  | 'last_month'
  | 'next_30_days'
  | 'next_90_days'
  | 'this_year'
  | 'all'

export type AppTab = 'cashflow' | 'cards' | 'accounts' | 'planning' | 'reports'

export type AppTheme = 'light' | 'dark'
