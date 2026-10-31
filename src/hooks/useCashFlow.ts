import { useMemo } from 'react'
import type { Transaction, PeriodFilter, CashFlowSummary, CashFlowDay, CategoryGroup, BankAccount } from '../types'

interface UseCashFlowProps {
  transactions: Transaction[]
  period: PeriodFilter
  accounts?: BankAccount[]
}

export function useCashFlow({ transactions, period, accounts }: UseCashFlowProps) {
  // Define o intervalo de datas do período selecionado
  const dateRange = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() // 0-indexed

    let start = new Date(currentYear, currentMonth, 1)
    let end = new Date(currentYear, currentMonth + 1, 0)

    if (period === 'next_month') {
      start = new Date(currentYear, currentMonth + 1, 1)
      end = new Date(currentYear, currentMonth + 2, 0)
    } else if (period === 'last_month') {
      start = new Date(currentYear, currentMonth - 1, 1)
      end = new Date(currentYear, currentMonth, 0)
    } else if (period === 'next_30_days') {
      start = new Date(now)
      end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    } else if (period === 'next_90_days') {
      start = new Date(now)
      end = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
    } else if (period === 'this_year') {
      start = new Date(currentYear, 0, 1)
      end = new Date(currentYear, 11, 31)
    } else if (period === 'all') {
      start = new Date(2020, 0, 1)
      end = new Date(2035, 11, 31)
    }

    const startStr = start.toISOString().split('T')[0]
    const endStr = end.toISOString().split('T')[0]

    return { start, end, startStr, endStr }
  }, [period])

  // Transações filtradas para o período com base na data de liquidação (dueDate)
  const periodTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const effectiveDate = tx.dueDate || tx.date
      return effectiveDate >= dateRange.startStr && effectiveDate <= dateRange.endStr
    }).sort((a, b) => (a.dueDate || a.date).localeCompare(b.dueDate || b.date))
  }, [transactions, dateRange])

  // Saldo inicial de todas as contas bancárias cadastradas
  const accountsInitialBalance = useMemo(() => {
    return (accounts || []).reduce((sum, a) => sum + (a.initialBalance || 0), 0)
  }, [accounts])

  // Saldo Realizado Histórico Total (Dinheiro líquido em conta hoje de todo o histórico)
  const historicalRealizedBalance = useMemo(() => {
    return transactions.reduce((acc, tx) => {
      if (tx.status !== 'paid') return acc
      return tx.type === 'income' ? acc + tx.amount : acc - tx.amount
    }, accountsInitialBalance)
  }, [transactions, accountsInitialBalance])

  // Sumário Financeiro do Período
  const summary: CashFlowSummary = useMemo(() => {
    let periodIncomesRealized = 0
    let periodIncomesPending = 0
    let periodExpensesRealized = 0
    let periodExpensesPending = 0

    periodTransactions.forEach((tx) => {
      if (tx.type === 'income') {
        if (tx.status === 'paid') {
          periodIncomesRealized += tx.amount
        } else {
          periodIncomesPending += tx.amount
        }
      } else {
        if (tx.status === 'paid') {
          periodExpensesRealized += tx.amount
        } else {
          periodExpensesPending += tx.amount
        }
      }
    })

    const totalIncomes = periodIncomesRealized + periodIncomesPending
    const totalExpenses = periodExpensesRealized + periodExpensesPending
    const netPeriodResult = totalIncomes - totalExpenses

    // Contabiliza apenas o que pertence ao período selecionado!
    // Se for 'all', usa o saldo consolidado histórico total.
    // Se for um recorte específico (ex: Mês Atual), calcula estritamente o realizado do período selecionado.
    const isAllHistory = period === 'all'
    const realizedBalance = isAllHistory
      ? historicalRealizedBalance
      : periodIncomesRealized - periodExpensesRealized

    const projectedMonthEndBalance = isAllHistory
      ? historicalRealizedBalance + periodIncomesPending - periodExpensesPending
      : netPeriodResult

    const savingsRatePercentage =
      totalIncomes > 0 ? Math.max(0, (netPeriodResult / totalIncomes) * 100) : 0

    return {
      realizedBalance,
      projectedMonthEndBalance,
      periodIncomesRealized,
      periodIncomesPending,
      periodExpensesRealized,
      periodExpensesPending,
      totalIncomes,
      totalExpenses,
      netPeriodResult,
      savingsRatePercentage,
      accountsInitialBalance,
    }
  }, [periodTransactions, period, historicalRealizedBalance, accountsInitialBalance])

  // Linha do tempo diária do fluxo de caixa
  const dailyTimeline: CashFlowDay[] = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    const map = new Map<string, { incomes: number; expenses: number; transactions: Transaction[] }>()

    // Popula dias dentro do intervalo
    const cur = new Date(dateRange.start)
    while (cur <= dateRange.end) {
      const dateStr = cur.toISOString().split('T')[0]
      map.set(dateStr, { incomes: 0, expenses: 0, transactions: [] })
      cur.setDate(cur.getDate() + 1)
    }

    // Distribui transações
    periodTransactions.forEach((tx) => {
      const day = tx.dueDate || tx.date
      const entry = map.get(day)
      if (entry) {
        if (tx.type === 'income') {
          entry.incomes += tx.amount
        } else {
          entry.expenses += tx.amount
        }
        entry.transactions.push(tx)
      }
    })

    // Calcula saldo acumulado dia a dia
    // Se o período for restrito (ex: Mês Atual), o acumulado inicia em 0 e reflete apenas o fluxo do período selecionado!
    let runningBalance = period === 'all' ? historicalRealizedBalance : 0
    const timeline: CashFlowDay[] = []

    // Ordena as chaves de data
    const sortedDates = Array.from(map.keys()).sort()
    for (const date of sortedDates) {
      const data = map.get(date)!
      const net = data.incomes - data.expenses
      runningBalance += net

      timeline.push({
        date,
        incomes: data.incomes,
        expenses: data.expenses,
        net,
        projectedBalance: runningBalance,
        transactions: data.transactions,
        isPastOrToday: date <= todayStr,
      })
    }

    return timeline
  }, [dateRange, periodTransactions, period, historicalRealizedBalance])

  // Distribuição de Despesas por Categoria
  const categoryBreakdown = useMemo(() => {
    const totalExpenses = summary.totalExpenses || 1
    const categoryMap = new Map<string, { amount: number; count: number; group: CategoryGroup }>()

    periodTransactions
      .filter((tx) => tx.type === 'expense')
      .forEach((tx) => {
        const current = categoryMap.get(tx.category) || { amount: 0, count: 0, group: tx.categoryGroup }
        current.amount += tx.amount
        current.count += 1
        categoryMap.set(tx.category, current)
      })

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
        group: data.group,
        percentage: (data.amount / totalExpenses) * 100,
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [periodTransactions, summary.totalExpenses])

  // Alertas de Liquidez (dias em que o caixa pode ficar negativo)
  const liquidityAlerts = useMemo(() => {
    return dailyTimeline.filter((day) => !day.isPastOrToday && day.projectedBalance < 0)
  }, [dailyTimeline])

  return {
    summary,
    periodTransactions,
    dailyTimeline,
    categoryBreakdown,
    liquidityAlerts,
    dateRange,
  }
}
