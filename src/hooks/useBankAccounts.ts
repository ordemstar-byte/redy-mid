import { useMemo } from 'react'
import type { BankAccount, Transaction, DetailedBankAccount } from '../types'

interface UseBankAccountsProps {
  accounts: BankAccount[]
  transactions: Transaction[]
}

export function useBankAccounts({ accounts, transactions }: UseBankAccountsProps) {
  // Contas com cálculos dinâmicos de saldo
  const detailedAccounts: DetailedBankAccount[] = useMemo(() => {
    return accounts.map((acc) => {
      // Transações associadas a esta conta
      const accTransactions = transactions.filter((tx) => tx.bankAccountId === acc.id)

      let incomesTotal = 0
      let expensesTotal = 0
      let pendingIncomesTotal = 0
      let pendingExpensesTotal = 0

      accTransactions.forEach((tx) => {
        if (tx.type === 'income') {
          if (tx.status === 'paid') {
            incomesTotal += tx.amount
          } else {
            pendingIncomesTotal += tx.amount
          }
        } else {
          if (tx.status === 'paid') {
            expensesTotal += tx.amount
          } else {
            pendingExpensesTotal += tx.amount
          }
        }
      })

      // Se houver transações em conta que não tiveram bankAccountId explicitado (ex: transações legadas),
      // elas podem ser atribuídas à conta principal se for a primeira conta
      const currentBalance = acc.initialBalance + incomesTotal - expensesTotal

      return {
        ...acc,
        currentBalance,
        incomesTotal,
        expensesTotal,
        pendingIncomesTotal,
        pendingExpensesTotal,
        transactionsCount: accTransactions.length,
      }
    })
  }, [accounts, transactions])

  // Métricas Consolidadas das Contas
  const summary = useMemo(() => {
    let totalCurrentBalance = 0
    let totalIncomes = 0
    let totalExpenses = 0
    let totalPendingIncomes = 0
    let totalPendingExpenses = 0

    detailedAccounts.forEach((acc) => {
      totalCurrentBalance += acc.currentBalance
      totalIncomes += acc.incomesTotal
      totalExpenses += acc.expensesTotal
      totalPendingIncomes += acc.pendingIncomesTotal
      totalPendingExpenses += acc.pendingExpensesTotal
    })

    return {
      totalCurrentBalance,
      totalIncomes,
      totalExpenses,
      totalPendingIncomes,
      totalPendingExpenses,
      accountsCount: detailedAccounts.length,
    }
  }, [detailedAccounts])

  return {
    detailedAccounts,
    summary,
  }
}
