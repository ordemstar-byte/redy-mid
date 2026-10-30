import { useState, useEffect, useCallback } from 'react'
import type { CreditCard, Transaction, BankAccount, PeriodFilter, AppTab, AppTheme } from '../types'
import { INITIAL_CARDS, INITIAL_ACCOUNTS, generateInitialTransactions } from '../lib/constants'
import { calculateInvoiceDueDate } from '../lib/utils'
import {
  fetchAccountsFromSupabase,
  saveAccountToSupabase,
  updateAccountInSupabase,
  deleteAccountFromSupabase,
  fetchCardsFromSupabase,
  saveCardToSupabase,
  updateCardInSupabase,
  deleteCardFromSupabase,
  fetchTransactionsFromSupabase,
  saveTransactionToSupabase,
  saveTransactionsBatchToSupabase,
  updateTransactionInSupabase,
  deleteTransactionFromSupabase,
  deleteInstallmentSeriesFromSupabase,
} from '../services/supabaseService'
import { isSupabaseConfigured } from '../lib/supabase'

const STORAGE_KEYS = {
  CARDS: 'aegis_finance_cards_prod_v2',
  ACCOUNTS: 'aegis_finance_accounts_prod_v2',
  TRANSACTIONS: 'aegis_finance_transactions_prod_v2',
  PRIVACY: 'aegis_finance_privacy_mode',
  PERIOD: 'aegis_finance_period_filter',
  TAB: 'aegis_finance_active_tab',
  THEME: 'aegis_finance_theme_v2',
}

export function useFinanceStore() {
  // Estado de sincronização com a nuvem Supabase
  const [isSyncing, setIsSyncing] = useState<boolean>(true)
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(isSupabaseConfigured)

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

  // Contas Bancárias: Inicia com LocalStorage para render imediato e depois sincroniza com Supabase
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

  // Sincronização em Tempo Real com Supabase (Fonte da Verdade Absoluta)
  useEffect(() => {
    let isMounted = true

    async function initialCloudSync() {
      setIsSyncing(true)
      try {
        const [remoteAccounts, remoteCards, remoteTxs] = await Promise.all([
          fetchAccountsFromSupabase(),
          fetchCardsFromSupabase(),
          fetchTransactionsFromSupabase(),
        ])

        if (!isMounted) return

        setAccounts(remoteAccounts)

        // Sincronização segura de cartões:
        if (remoteCards.length > 0) {
          setCards(remoteCards)
        } else {
          try {
            const localSavedCards = localStorage.getItem(STORAGE_KEYS.CARDS)
            if (localSavedCards) {
              const parsedCards: CreditCard[] = JSON.parse(localSavedCards)
              if (Array.isArray(parsedCards) && parsedCards.length > 0) {
                setCards(parsedCards)
                parsedCards.forEach((c) => saveCardToSupabase(c))
              }
            }
          } catch (e) {
            console.error('Erro ao recuperar cartões do localStorage:', e)
          }
        }

        // Supabase sincronização segura de transações:
        // Se o Supabase retornou transações, usa as do Supabase.
        // Se o Supabase veio vazio mas temos transações salvas localmente no localStorage,
        // sobe essas transações automaticamente para o Supabase para não perder os dados!
        if (remoteTxs.length > 0) {
          setTransactions(remoteTxs)
        } else {
          try {
            const localSaved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)
            if (localSaved) {
              const parsed: Transaction[] = JSON.parse(localSaved)
              if (Array.isArray(parsed) && parsed.length > 0) {
                setTransactions(parsed)
                saveTransactionsBatchToSupabase(parsed)
              } else {
                setTransactions([])
              }
            } else {
              setTransactions([])
            }
          } catch {
            setTransactions([])
          }
        }

        setIsCloudConnected(true)
      } catch (err) {
        console.error('Erro na sincronização com Supabase:', err)
        setIsCloudConnected(false)
      } finally {
        if (isMounted) setIsSyncing(false)
      }
    }

    initialCloudSync()

    // Auto-recarga em tempo real sempre que o usuário voltar ao app ou focar a janela
    const handleFocusSync = () => {
      if (document.visibilityState === 'visible') {
        initialCloudSync()
      }
    }

    window.addEventListener('focus', handleFocusSync)
    document.addEventListener('visibilitychange', handleFocusSync)

    return () => {
      isMounted = false
      window.removeEventListener('focus', handleFocusSync)
      document.removeEventListener('visibilitychange', handleFocusSync)
    }
  }, [])

  // Sincronização automática com localStorage para cache offline
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

  // Ações de Contas Bancárias (Persistidas no Supabase)
  const addAccount = useCallback((accountData: Omit<BankAccount, 'id' | 'createdAt'>) => {
    const newAccount: BankAccount = {
      ...accountData,
      id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    }
    setAccounts((prev) => [newAccount, ...prev])
    // Salva permanentemente no Supabase
    saveAccountToSupabase(newAccount)
    return newAccount
  }, [])

  const updateAccount = useCallback((id: string, updates: Partial<BankAccount>) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, ...updates } : acc))
    )
    // Atualiza permanentemente no Supabase
    updateAccountInSupabase(id, updates)
  }, [])

  const deleteAccount = useCallback((id: string) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== id))
    // Exclui do banco SOMENTE quando o usuário aciona
    deleteAccountFromSupabase(id)
  }, [])

  // Ações de Cartões (Persistidas no Supabase)
  const addCard = useCallback((cardData: Omit<CreditCard, 'id' | 'createdAt'>) => {
    const newCard: CreditCard = {
      ...cardData,
      id: `card_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    }
    setCards((prev) => [newCard, ...prev])
    // Salva permanentemente no Supabase
    saveCardToSupabase(newCard)
    return newCard
  }, [])

  const updateCard = useCallback((id: string, updates: Partial<CreditCard>) => {
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, ...updates } : card))
    )
    // Atualiza permanentemente no Supabase
    updateCardInSupabase(id, updates)

    // Se o dia de fechamento ou vencimento do cartão foi alterado, sincroniza
    // o vencimento das faturas e parcelas pendentes deste cartão
    if (updates.closingDay !== undefined || updates.dueDay !== undefined) {
      setTransactions((prevTxs) => {
        let hasChanges = false
        const updatedTxs = prevTxs.map((tx) => {
          if (tx.creditCardId === id && tx.paymentMethod === 'credit_card' && tx.status === 'pending') {
            const cardObj = cards.find((c) => c.id === id)
            const newClosing = updates.closingDay ?? cardObj?.closingDay ?? 10
            const newDue = updates.dueDay ?? cardObj?.dueDay ?? 17
            const { dueDate: newDueDate } = calculateInvoiceDueDate(tx.date, newClosing, newDue)
            if (newDueDate !== tx.dueDate) {
              hasChanges = true
              return { ...tx, dueDate: newDueDate }
            }
          }
          return tx
        })

        if (hasChanges) {
          saveTransactionsBatchToSupabase(updatedTxs)
        }
        return updatedTxs
      })
    }
  }, [cards])

  const deleteCard = useCallback((id: string) => {
    setCards((prev) => prev.filter((card) => card.id !== id))
    // Exclui do banco SOMENTE quando o usuário aciona
    deleteCardFromSupabase(id)
  }, [])

  // Ações de Transações & Parcelamento Inteligente (Persistidas no Supabase)
  const addTransaction = useCallback(
    (
      data: Omit<Transaction, 'id' | 'createdAt'>,
      generateInstallments = false
    ) => {
      const nowIso = new Date().toISOString()
      const isCard = data.paymentMethod === 'credit_card' && data.creditCardId
      const card = isCard ? cards.find((c) => c.id === data.creditCardId) : null

      const totalInstallments = data.installmentsTotal || 1
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]

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

          // Contabilidade retroativa inteligente de compras parceladas:
          // Se a fatura dessa parcela já venceu antes de hoje (dueDate < todayStr),
          // ela já foi liquidada/paga nos meses anteriores e NÃO consome o limite!
          const isPastInvoice = dueDate < todayStr
          const instStatus: Transaction['status'] = isPastInvoice
            ? 'paid'
            : i === 1 && data.status === 'paid'
            ? 'paid'
            : 'pending'

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
            status: instStatus,
            notes: data.notes,
            tags: data.tags,
            createdAt: nowIso,
          })
        }

        setTransactions((prev) => [...newTransactions, ...prev])
        // Salva lote no Supabase
        saveTransactionsBatchToSupabase(newTransactions)
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

      // Se for compra à vista no cartão em data retroativa com fatura já vencida antes de hoje:
      let singleStatus = data.status
      if (isCard && calculatedDueDate && calculatedDueDate < todayStr && data.status === 'pending') {
        singleStatus = 'paid'
      }

      const newTx: Transaction = {
        ...data,
        dueDate: calculatedDueDate,
        status: singleStatus,
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: nowIso,
      }

      setTransactions((prev) => [newTx, ...prev])
      // Salva no Supabase
      saveTransactionToSupabase(newTx)
      return [newTx]
    },
    [cards]
  )

  const updateTransaction = useCallback(
    (id: string, updates: Partial<Transaction> & { updateSeries?: boolean }) => {
      const { updateSeries, ...restUpdates } = updates
      const finalUpdates = { ...restUpdates }

      setTransactions((prev) => {
        const target = prev.find((tx) => tx.id === id)
        if (!target) return prev

        // Atualização em lote se o usuário estiver editando toda a série de parcelas
        if (updateSeries && target.parentInstallmentId) {
          const pId = target.parentInstallmentId
          const baseDesc = restUpdates.description
            ? restUpdates.description.replace(/\s\(\d+\/\d+x\)/, '').trim()
            : ''

          const updatedBatch: Transaction[] = []

          const newTxs = prev.map((tx) => {
            if (tx.parentInstallmentId === pId) {
              const updatedTx: Transaction = {
                ...tx,
                ...(restUpdates.category ? { category: restUpdates.category } : {}),
                ...(restUpdates.categoryGroup ? { categoryGroup: restUpdates.categoryGroup } : {}),
                ...(restUpdates.cardStatementName !== undefined ? { cardStatementName: restUpdates.cardStatementName } : {}),
                ...(restUpdates.creditCardId ? { creditCardId: restUpdates.creditCardId } : {}),
                ...(restUpdates.notes !== undefined ? { notes: restUpdates.notes } : {}),
                ...(baseDesc ? { description: `${baseDesc} (${tx.installmentNumber || 1}/${tx.installmentsTotal || 1}x)` } : {}),
              }
              if (tx.id === id) {
                if (restUpdates.amount !== undefined) updatedTx.amount = restUpdates.amount
                if (restUpdates.dueDate !== undefined) updatedTx.dueDate = restUpdates.dueDate
                if (restUpdates.status !== undefined) updatedTx.status = restUpdates.status
              }
              updatedBatch.push(updatedTx)
              return updatedTx
            }
            return tx
          })

          saveTransactionsBatchToSupabase(updatedBatch)
          return newTxs
        }

        // Atualização de parcela ou transação única
        return prev.map((tx) => {
          if (tx.id !== id) return tx
          const merged = { ...tx, ...restUpdates }

          if (restUpdates.dueDate) {
            merged.dueDate = restUpdates.dueDate
          } else if (merged.paymentMethod === 'credit_card' && merged.creditCardId && restUpdates.date) {
            const card = cards.find((c) => c.id === merged.creditCardId)
            if (card) {
              const { dueDate } = calculateInvoiceDueDate(restUpdates.date, card.closingDay, card.dueDay)
              merged.dueDate = dueDate
              finalUpdates.dueDate = dueDate
            }
          }
          return merged
        })
      })

      if (!updateSeries) {
        updateTransactionInSupabase(id, finalUpdates)
      }
    },
    [cards]
  )

  const deleteTransaction = useCallback((id: string, deleteSeries = false) => {
    setTransactions((prev) => {
      const target = prev.find((tx) => tx.id === id)
      if (!target) return prev

      if (deleteSeries) {
        const pId = target.parentInstallmentId
        if (pId) {
          deleteInstallmentSeriesFromSupabase(pId)
          return prev.filter((tx) => tx.parentInstallmentId !== pId)
        }
        // Fallback: se não tiver parentInstallmentId, remove pelo cartão e descrição base
        const baseDesc = target.description.replace(/\s\(\d+\/\d+x\)/, '').trim()
        const related = prev.filter(
          (tx) =>
            tx.creditCardId === target.creditCardId &&
            tx.description.replace(/\s\(\d+\/\d+x\)/, '').trim() === baseDesc
        )
        related.forEach((r) => deleteTransactionFromSupabase(r.id))
        return prev.filter((tx) => !related.some((r) => r.id === tx.id))
      } else {
        deleteTransactionFromSupabase(id)
        return prev.filter((tx) => tx.id !== id)
      }
    })
  }, [])

  const deleteInstallmentSeries = useCallback((parentInstallmentId: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.parentInstallmentId !== parentInstallmentId))
    deleteInstallmentSeriesFromSupabase(parentInstallmentId)
  }, [])

  const toggleTransactionStatus = useCallback((id: string) => {
    setTransactions((prev) => {
      const target = prev.find((tx) => tx.id === id)
      if (target) {
        const newStatus = target.status === 'paid' ? 'pending' : 'paid'
        updateTransactionInSupabase(id, { status: newStatus })
      }
      return prev.map((tx) =>
        tx.id === id
          ? { ...tx, status: tx.status === 'paid' ? 'pending' : 'paid' }
          : tx
      )
    })
  }, [])

  // Quitação de Fatura de Cartão
  const payCardInvoice = useCallback(
    (_cardId: string, invoiceTransactions: Transaction[]) => {
      const txIds = new Set(invoiceTransactions.map((t) => t.id))
      setTransactions((prev) =>
        prev.map((tx) => {
          if (txIds.has(tx.id)) {
            updateTransactionInSupabase(tx.id, { status: 'paid' })
            return { ...tx, status: 'paid' }
          }
          return tx
        })
      )
    },
    []
  )

  // Recarrega dados manualmente da nuvem
  const reloadFromCloud = useCallback(async () => {
    setIsSyncing(true)
    try {
      const [remoteAccounts, remoteCards, remoteTxs] = await Promise.all([
        fetchAccountsFromSupabase(),
        fetchCardsFromSupabase(),
        fetchTransactionsFromSupabase(),
      ])
      if (remoteAccounts.length > 0) setAccounts(remoteAccounts)
      if (remoteCards.length > 0) setCards(remoteCards)
      
      if (remoteTxs.length > 0) {
        setTransactions(remoteTxs)
      } else {
        try {
          const localSaved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)
          if (localSaved) {
            const parsed = JSON.parse(localSaved)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setTransactions(parsed)
              saveTransactionsBatchToSupabase(parsed)
            } else {
              setTransactions([])
            }
          } else {
            setTransactions([])
          }
        } catch {
          setTransactions([])
        }
      }
      setIsCloudConnected(true)
    } catch (e) {
      console.error('Erro ao recarregar do Supabase:', e)
    } finally {
      setIsSyncing(false)
    }
  }, [])

  // Gerenciamento de Dados
  const resetToMockData = useCallback(() => {
    setAccounts(INITIAL_ACCOUNTS)
    setCards(INITIAL_CARDS)
    setTransactions(generateInitialTransactions())
  }, [])

  const clearAllData = useCallback(async () => {
    // Exclui local e do banco se o usuário solicitar limpeza total
    for (const acc of accounts) {
      await deleteAccountFromSupabase(acc.id)
    }
    for (const c of cards) {
      await deleteCardFromSupabase(c.id)
    }
    for (const tx of transactions) {
      await deleteTransactionFromSupabase(tx.id)
    }
    setAccounts([])
    setCards([])
    setTransactions([])
  }, [accounts, cards, transactions])

  const exportDataJSON = useCallback(() => {
    const data = {
      version: '1.2',
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

  const importDataJSON = useCallback(async (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr)
      if (Array.isArray(parsed.cards) && Array.isArray(parsed.transactions)) {
        if (Array.isArray(parsed.accounts)) {
          setAccounts(parsed.accounts)
          for (const acc of parsed.accounts) {
            await saveAccountToSupabase(acc)
          }
        }
        setCards(parsed.cards)
        for (const c of parsed.cards) {
          await saveCardToSupabase(c)
        }
        setTransactions(parsed.transactions)
        await saveTransactionsBatchToSupabase(parsed.transactions)

        return { success: true, message: 'Dados importados e salvos no Supabase com sucesso!' }
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
    isSyncing,
    isCloudConnected,
    reloadFromCloud,
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
    deleteInstallmentSeries,
    toggleTransactionStatus,
    payCardInvoice,
    resetToMockData,
    clearAllData,
    exportDataJSON,
    importDataJSON,
  }
}
