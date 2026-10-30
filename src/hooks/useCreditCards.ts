import { useMemo } from 'react'
import type { CreditCard, Transaction, CardsMetricsSummary, CardInvoice, ActiveInstallment } from '../types'
import { getBestPurchaseDay, getDaysUntilClosing, getInvoiceCycleDates } from '../lib/utils'

interface UseCreditCardsProps {
  cards: CreditCard[]
  transactions: Transaction[]
}

export interface DetailedCard extends CreditCard {
  currentInvoice: CardInvoice
  nextInvoice: CardInvoice
  allInvoices: CardInvoice[]
  totalCommittedLimit: number
  availableLimit: number
  usagePercentage: number
  bestPurchaseDay: number
  daysUntilClosing: number
  isClosingSoon: boolean
  activeInstallmentsCount: number
}

export function useCreditCards({ cards, transactions }: UseCreditCardsProps) {
  // Transações de cartão
  const cardTransactions = useMemo(() => {
    return transactions.filter(
      (tx) => tx.paymentMethod === 'credit_card' && tx.creditCardId
    )
  }, [transactions])

  // Detalhamento e agrupamento por fatura para cada cartão
  const detailedCards: DetailedCard[] = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    const currentMonthYear = `${currentYear}-${String(currentMonth).padStart(2, '0')}`

    const nextMonthVal = currentMonth === 12 ? 1 : currentMonth + 1
    const nextYearVal = currentMonth === 12 ? currentYear + 1 : currentYear
    const nextMonthYear = `${nextYearVal}-${String(nextMonthVal).padStart(2, '0')}`

    return cards.map((card) => {
      // Transações deste cartão
      const thisCardTx = cardTransactions.filter((tx) => tx.creditCardId === card.id)

      // Limite total comprometido = todas as compras ainda NÃO pagas (status === 'pending')
      const pendingTx = thisCardTx.filter((tx) => tx.status === 'pending')
      const totalCommittedLimit = pendingTx.reduce((sum, tx) => sum + tx.amount, 0)
      const availableLimit = Math.max(0, card.creditLimit - totalCommittedLimit)
      const usagePercentage = Math.min(100, (totalCommittedLimit / card.creditLimit) * 100)

      // Agrupa transações por fatura (mês/ano da data de vencimento da fatura)
      const invoicesMap = new Map<string, Transaction[]>()
      thisCardTx.forEach((tx) => {
        const dueDate = tx.dueDate || tx.date
        const [dYear, dMonth] = dueDate.split('-')
        const invoiceKey = `${dYear}-${dMonth}`
        const list = invoicesMap.get(invoiceKey) || []
        list.push(tx)
        invoicesMap.set(invoiceKey, list)
      })

      // Constrói faturas
      const allInvoices: CardInvoice[] = Array.from(invoicesMap.entries())
        .map(([mYear, txs]) => {
          const { closingDate, dueDate } = getInvoiceCycleDates(mYear, card.closingDay, card.dueDay)
          const totalAmount = txs.reduce((s, t) => s + t.amount, 0)
          const allPaid = txs.length > 0 && txs.every((t) => t.status === 'paid')
          
          const todayStr = now.toISOString().split('T')[0]
          let status: 'open' | 'closed' | 'paid' = 'open'
          if (allPaid) {
            status = 'paid'
          } else if (todayStr > closingDate) {
            status = 'closed'
          }

          return {
            cardId: card.id,
            cardName: card.name,
            monthYear: mYear,
            closingDate,
            dueDate,
            status,
            totalAmount,
            transactions: txs.sort((a, b) => b.date.localeCompare(a.date)),
          }
        })
        .sort((a, b) => b.monthYear.localeCompare(a.monthYear))

      const currentCycle = getInvoiceCycleDates(currentMonthYear, card.closingDay, card.dueDay)
      // Fatura Atual (ou mock vazio se não houver gastos)
      const currentInvoice = allInvoices.find((inv) => inv.monthYear === currentMonthYear) || {
        cardId: card.id,
        cardName: card.name,
        monthYear: currentMonthYear,
        closingDate: currentCycle.closingDate,
        dueDate: currentCycle.dueDate,
        status: 'open',
        totalAmount: 0,
        transactions: [],
      }

      const nextCycle = getInvoiceCycleDates(nextMonthYear, card.closingDay, card.dueDay)
      // Próxima Fatura
      const nextInvoice = allInvoices.find((inv) => inv.monthYear === nextMonthYear) || {
        cardId: card.id,
        cardName: card.name,
        monthYear: nextMonthYear,
        closingDate: nextCycle.closingDate,
        dueDate: nextCycle.dueDate,
        status: 'open',
        totalAmount: 0,
        transactions: [],
      }

      const bestPurchaseDay = getBestPurchaseDay(card.closingDay)
      const { days, isClosingSoon } = getDaysUntilClosing(card.closingDay)

      // Conta parcelas ativas
      const activeInstallmentsCount = new Set(
        pendingTx.filter((t) => (t.installmentsTotal || 1) > 1).map((t) => t.parentInstallmentId || t.id)
      ).size

      return {
        ...card,
        currentInvoice,
        nextInvoice,
        allInvoices,
        totalCommittedLimit,
        availableLimit,
        usagePercentage,
        bestPurchaseDay,
        daysUntilClosing: days,
        isClosingSoon,
        activeInstallmentsCount,
      }
    })
  }, [cards, cardTransactions])

  // Métricas Consolidadas Globais
  const summary: CardsMetricsSummary = useMemo(() => {
    let totalLimit = 0
    let totalUsed = 0
    let currentMonthInvoicesTotal = 0
    let nextMonthInvoicesTotal = 0

    detailedCards.forEach((c) => {
      totalLimit += c.creditLimit
      totalUsed += c.totalCommittedLimit
      currentMonthInvoicesTotal += c.currentInvoice.totalAmount
      nextMonthInvoicesTotal += c.nextInvoice.totalAmount
    })

    const totalAvailable = Math.max(0, totalLimit - totalUsed)
    const usagePercentage = totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0
    const totalActiveInstallmentsCount = detailedCards.reduce(
      (sum, c) => sum + c.activeInstallmentsCount,
      0
    )

    return {
      totalLimit,
      totalUsed,
      totalAvailable,
      usagePercentage,
      currentMonthInvoicesTotal,
      nextMonthInvoicesTotal,
      totalActiveInstallmentsCount,
    }
  }, [detailedCards])

  // Lista consolidada de parcelamentos em andamento em todos os cartões
  const activeInstallmentsList: ActiveInstallment[] = useMemo(() => {
    const parentMap = new Map<string, ActiveInstallment>()

    cardTransactions.forEach((tx) => {
      if ((tx.installmentsTotal || 1) > 1 && tx.parentInstallmentId) {
        const key = tx.parentInstallmentId
        const card = cards.find((c) => c.id === tx.creditCardId)
        let current = parentMap.get(key)
        
        if (!current) {
          current = {
            parentInstallmentId: key,
            sampleTransaction: tx,
            allTransactions: [],
            cardName: card?.name || 'Cartão',
            cardId: tx.creditCardId || '',
            description: tx.description.replace(/\s\(\d+\/\d+x\)/, ''),
            cardStatementName: tx.cardStatementName,
            totalInstallments: tx.installmentsTotal || 1,
            paidInstallments: 0,
            remainingInstallments: 0,
            installmentAmount: tx.amount,
            remainingAmount: 0,
            nextDueDate: tx.dueDate,
            category: tx.category,
          }
          parentMap.set(key, current)
        }

        current.allTransactions.push(tx)

        if (tx.status === 'paid') {
          current.paidInstallments += 1
        } else {
          current.remainingInstallments += 1
          current.remainingAmount += tx.amount
          // Se for a parcela pendente mais próxima, vira o sampleTransaction e nextDueDate
          if (!current.nextDueDate || tx.dueDate < current.nextDueDate) {
            current.nextDueDate = tx.dueDate
            current.sampleTransaction = tx
          }
        }
      }
    })

    return Array.from(parentMap.values()).sort((a, b) => b.remainingAmount - a.remainingAmount)
  }, [cardTransactions, cards])

  return {
    detailedCards,
    summary,
    activeInstallmentsList,
  }
}
