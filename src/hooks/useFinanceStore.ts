import { useState, useEffect, useCallback } from 'react'
import type { CreditCard, Transaction, BankAccount, PeriodFilter, AppTab, AppTheme } from '../types'
import { INITIAL_CARDS, INITIAL_ACCOUNTS, generateInitialTransactions } from '../lib/constants'
import { calculateInvoiceDueDate } from '../lib/utils'

const STORAGE_KEYS = {
  CARDS: 'aegis_finance_cards_v1',
  ACCOUNTS: 'aegis_finance_accounts_v1',
  TRANSACTIONS: 'aegis_finance_transactions_v1',
  PRIVACY: 'aegis_finance_privacy_mode',
  PERIOD: 'aegis_finance_period_filter',
  TAB: 'aegis_finance_active_tab',
  THEME: 'aegis_finance_theme_v2',
}

export function useFinanceStore() {
  // Tema Claro por padrão (conforme pedido pelo usuário)
  const [theme, setTheme] = useState<AppTheme>(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME) as AppTheme
      if (saved === 'dark' || saved === 'light') return saved
    } catch {
      // fallback
    }
    return 'light'
  })

  // Sincroniza classe html para Tailwind
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme)
  }, [theme])

  // Contas Bancárias
  const [accounts, setAccounts] = useState<BankAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Erro ao ler contas do localStorage:', e)
    }
    return INITIAL_ACCOUNTS
  })

  // Cartões de Crédito
  const [cards, setCards] = useState<CreditCard[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CARDS)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Erro ao ler cartões do localStorage:', e)
    }
    return INITIAL_CARDS
  })

  // Lançamentos
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Erro ao ler transações do localStorage:', e)
    }
    return generateInitialTransactions()
  })

  const [privacyMode, setPrivacyMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRIVACY)
      return saved === 'true'
    } catch {
      return false
    }
  })

  const [period, setPeriod] = useState<PeriodFilter>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PERIOD) as PeriodFilter
      if (saved) return saved
    } catch {
      // fallback
    }
    return 'this_month'
  })

  const [activeTab, setActiveTab] = useState<AppTab>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TAB) as AppTab
      if (saved) return saved
    } catch {
      // fallback
    }
    return 'cashflow'
  })

  // Sincronização automática com localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts))
  }, [accounts])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards))
  }, [cards])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRIVACY, String(privacyMode))
  }, [privacyMode])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PERIOD, period)
  }, [period])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TAB, activeTab)
  }, [activeTab])

  // Ações de Contas Bancárias
  const addAccount = useCallback((accountData: Omit<BankAccount, 'id' | 'createdAt'>) => {
    const newAccount: BankAccount = {
      ...accountData,
      id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    }
    setAccounts((prev) => [newAccount, ...prev])
    return newAccount
  }, [])

  const updateAccount = useCallback((id: string, updates: Partial<BankAccount>) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, ...updates } : acc))
    )
  }, [])

  const deleteAccount = useCallback((id: string) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== id))
  }, [])

  // Ações de Cartões
  const addCard = useCallback((cardData: Omit<CreditCard, 'id' | 'createdAt'>) => {
    const newCard: CreditCard = {
      ...cardData,
      id: `card_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    }
    setCards((prev) => [newCard, ...prev])
    return newCard
  }, [])

  const updateCard = useCallback((id: string, updates: Partial<CreditCard>) => {
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, ...updates } : card))
    )
  }, [])

  const deleteCard = useCallback((id: string) => {
    setCards((prev) => prev.filter((card) => card.id !== id))
  }, [])

  // Ações de Transações & Parcelamento Inteligente
  const addTransaction = useCallback(
    (
      data: Omit<Transaction, 'id' | 'createdAt'>,
      generateInstallments = false
    ) => {
      const nowIso = new Date().toISOString()
      const isCard = data.paymentMethod === 'credit_card' && data.creditCardId
      const card = isCard ? cards.find((c) => c.id === data.creditCardId) : null

      const totalInstallments = data.installmentsTotal || 1

      // Se for compra parcelada no cartão e usuário pediu para gerar todas as parcelas
      if (isCard && card && totalInstallments > 1 && generateInstallments) {
        const parentId = `inst_${Date.now()}`
        const installmentAmount = Math.round((data.amount / totalInstallments) * 100) / 100
        const newTransactions: Transaction[] = []

        const [pYear, pMonth, pDay] = data.date.split('-').map(Number)

        for (let i = 1; i <= totalInstallments; i++) {
          let instMonth = pMonth + (i - 1)
          let instYear = pYear
          while (instMonth > 12) {
            instMonth -= 12
            instYear += 1
          }

          const dayClamped = Math.min(pDay, new Date(instYear, instMonth, 0).getDate())
          const instDateStr = `${instYear}-${String(instMonth).padStart(2, '0')}-${String(dayClamped).padStart(2, '0')}`

          const { dueDate } = calculateInvoiceDueDate(
            instDateStr,
            card.closingDay,
            card.dueDay
          )

          newTransactions.push({
            id: `tx_${Date.now()}_inst_${i}`,
            description: `${data.description} (${i}/${totalInstallments}x)`,
            cardStatementName: data.cardStatementName,
            amount: installmentAmount,
            type: data.type,
            paymentMethod: data.paymentMethod,
            creditCardId: data.creditCardId,
            bankAccountId: data.bankAccountId,
            installmentsTotal: totalInstallments,
            installmentNumber: i,
            parentInstallmentId: parentId,
            category: data.category,
            categoryGroup: data.categoryGroup,
            date: instDateStr,
            time: data.time || undefined,
            dueDate: dueDate,
            status: i === 1 && data.status === 'paid' ? 'paid' : 'pending',
            notes: data.notes,
            tags: data.tags,
            createdAt: nowIso,
          })
        }

        setTransactions((prev) => [...newTransactions, ...prev])
        return newTransactions
      }

      // Transação Única / À Vista
      let calculatedDueDate = data.dueDate
      if (isCard && card && (!data.dueDate || data.dueDate === data.date)) {
        const { dueDate } = calculateInvoiceDueDate(
          data.date,
          card.closingDay,
          card.dueDay
        )
        calculatedDueDate = dueDate
      }

      const newTx: Transaction = {
        ...data,
        dueDate: calculatedDueDate,
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: nowIso,
      }

      setTransactions((prev) => [newTx, ...prev])
      return [newTx]
    },
    [cards]
  )

  const updateTransaction = useCallback(
    (id: string, updates: Partial<Transaction>) => {
      setTransactions((prev) =>
        prev.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx))
      )
    },
    []
  )

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id))
  }, [])

  const toggleTransactionStatus = useCallback((id: string) => {
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.id === id
          ? { ...tx, status: tx.status === 'paid' ? 'pending' : 'paid' }
          : tx
      )
    )
  }, [])

  // Quitação de Fatura de Cartão
  const payCardInvoice = useCallback(
    (_cardId: string, invoiceTransactions: Transaction[]) => {
      const txIds = new Set(invoiceTransactions.map((t) => t.id))
      setTransactions((prev) =>
        prev.map((tx) => (txIds.has(tx.id) ? { ...tx, status: 'paid' } : tx))
      )
    },
    []
  )

  // Gerenciamento de Dados
  const resetToMockData = useCallback(() => {
    setAccounts(INITIAL_ACCOUNTS)
    setCards(INITIAL_CARDS)
    setTransactions(generateInitialTransactions())
  }, [])

  const clearAllData = useCallback(() => {
    setAccounts([])
    setCards([])
    setTransactions([])
  }, [])

  const exportDataJSON = useCallback(() => {
    const data = {
      version: '1.1',
      exportedAt: new Date().toISOString(),
      accounts,
      cards,
      transactions,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `aegis-finance-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [accounts, cards, transactions])

  const importDataJSON = useCallback((jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr)
      if (Array.isArray(parsed.cards) && Array.isArray(parsed.transactions)) {
        if (Array.isArray(parsed.accounts)) {
          setAccounts(parsed.accounts)
        }
        setCards(parsed.cards)
        setTransactions(parsed.transactions)
        return { success: true, message: 'Dados importados com sucesso!' }
      }
      return { success: false, message: 'Arquivo JSON em formato incompatível.' }
    } catch {
      return { success: false, message: 'Erro ao processar arquivo JSON.' }
    }
  }, [])

  return {
    theme,
    setTheme,
    toggleTheme: () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light')),
    accounts,
    cards,
    transactions,
    privacyMode,
    setPrivacyMode,
    togglePrivacyMode: () => setPrivacyMode((prev) => !prev),
    period,
    setPeriod,
    activeTab,
    setActiveTab,
    addAccount,
    updateAccount,
    deleteAccount,
    addCard,
    updateCard,
    deleteCard,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    toggleTransactionStatus,
    payCardInvoice,
    resetToMockData,
    clearAllData,
    exportDataJSON,
    importDataJSON,
  }
}
