import { useState } from 'react'
import { useFinanceStore } from './hooks/useFinanceStore'
import { useCashFlow } from './hooks/useCashFlow'
import { useCreditCards } from './hooks/useCreditCards'
import { useBankAccounts } from './hooks/useBankAccounts'
import { Header } from './components/Header'
import { CashFlowView } from './components/CashFlowView'
import { BankAccountsView } from './components/BankAccountsView'
import { CreditCardsView } from './components/CreditCardsView'
import { PlanningView } from './components/PlanningView'
import { NewTransactionModal } from './components/NewTransactionModal'
import { NewCardModal } from './components/NewCardModal'
import { NewAccountModal } from './components/NewAccountModal'
import { PinLockScreen } from './components/PinLockScreen'

export function App() {
  const {
    theme,
    toggleTheme,
    accounts,
    cards,
    transactions,
    privacyMode,
    togglePrivacyMode,
    period,
    setPeriod,
    activeTab,
    setActiveTab,
    addAccount,
    deleteAccount,
    addCard,
    deleteCard,
    addTransaction,
    deleteTransaction,
    toggleTransactionStatus,
    payCardInvoice,
    resetToMockData,
    exportDataJSON,
    importDataJSON,
  } = useFinanceStore()

  const {
    summary: cashFlowSummary,
    periodTransactions,
    dailyTimeline,
  } = useCashFlow({ transactions, period })

  const {
    detailedCards,
    summary: cardsSummary,
    activeInstallmentsList,
  } = useCreditCards({ cards, transactions })

  const {
    detailedAccounts,
    summary: accountsSummary,
  } = useBankAccounts({ accounts, transactions })

  // Controle de Modais
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)
  const [isCardModalOpen, setIsCardModalOpen] = useState(false)
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Autenticação com Senha PIN (0638)
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('aegis_session_unlocked_v2') === 'true'
    } catch {
      return false
    }
  })

  const handleUnlock = () => {
    setIsUnlocked(true)
    try {
      sessionStorage.setItem('aegis_session_unlocked_v2', 'true')
    } catch {}
  }

  const handleLock = () => {
    setIsUnlocked(false)
    try {
      sessionStorage.removeItem('aegis_session_unlocked_v2')
    } catch {}
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleImportBackup = (jsonStr: string) => {
    const res = importDataJSON(jsonStr)
    showToast(res.message)
  }

  const handleExportBackup = () => {
    exportDataJSON()
    showToast('Arquivo de backup exportado com sucesso!')
  }

  const handleResetData = () => {
    resetToMockData()
    showToast('Todos os dados foram zerados com sucesso!')
  }

  const pendingTransactionsCount = periodTransactions.filter((t) => t.status === 'pending').length

  // Tela de Bloqueio por Senha PIN (0638)
  if (!isUnlocked) {
    return <PinLockScreen onUnlock={handleUnlock} />
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#090A0F] text-zinc-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-500 transition-colors">
      
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        period={period}
        setPeriod={setPeriod}
        privacyMode={privacyMode}
        togglePrivacyMode={togglePrivacyMode}
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenNewTransaction={() => setIsTransactionModalOpen(true)}
        onOpenNewCard={() => setIsCardModalOpen(true)}
        onOpenNewAccount={() => setIsAccountModalOpen(true)}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onResetData={handleResetData}
        onLockApp={handleLock}
        totalCardsCount={cards.length}
        totalAccountsCount={accounts.length}
        pendingTxCount={pendingTransactionsCount}
      />

      {/* Main Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'cashflow' && (
          <CashFlowView
            summary={cashFlowSummary}
            transactions={periodTransactions}
            timeline={dailyTimeline}
            cards={cards}
            privacyMode={privacyMode}
            onToggleStatus={toggleTransactionStatus}
            onDeleteTransaction={deleteTransaction}
            onOpenNewTransaction={() => setIsTransactionModalOpen(true)}
          />
        )}

        {activeTab === 'accounts' && (
          <BankAccountsView
            detailedAccounts={detailedAccounts}
            transactions={transactions}
            summary={accountsSummary}
            privacyMode={privacyMode}
            onOpenNewAccount={() => setIsAccountModalOpen(true)}
            onOpenNewTransaction={() => setIsTransactionModalOpen(true)}
            onDeleteAccount={(accId) => {
              deleteAccount(accId)
              showToast('Conta bancária removida.')
            }}
            onDeleteTransaction={deleteTransaction}
            onToggleStatus={toggleTransactionStatus}
          />
        )}

        {activeTab === 'cards' && (
          <CreditCardsView
            detailedCards={detailedCards}
            summary={cardsSummary}
            activeInstallmentsList={activeInstallmentsList}
            privacyMode={privacyMode}
            onOpenNewCard={() => setIsCardModalOpen(true)}
            onOpenNewTransaction={() => setIsTransactionModalOpen(true)}
            onPayInvoice={(cardId, invTxs) => {
              payCardInvoice(cardId, invTxs)
              showToast('Fatura marcada como liquidada no fluxo!')
            }}
            onDeleteCard={(cardId) => {
              deleteCard(cardId)
              showToast('Cartão removido.')
            }}
            onDeleteTransaction={deleteTransaction}
          />
        )}

        {activeTab === 'planning' && (
          <PlanningView
            transactions={periodTransactions}
            summary={cashFlowSummary}
            privacyMode={privacyMode}
          />
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-semibold shadow-2xl border border-zinc-700/80 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <NewTransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        cards={cards}
        accounts={accounts}
        onSave={(txData, generateInstallments) => {
          addTransaction(txData, generateInstallments)
          showToast('Lançamento adicionado com sucesso!')
        }}
      />

      <NewCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        onSave={(cardData) => {
          addCard(cardData)
          showToast(`Cartão ${cardData.name} cadastrado com sucesso!`)
        }}
      />

      <NewAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onSave={(accountData) => {
          addAccount(accountData)
          showToast(`Conta ${accountData.name} cadastrada com sucesso!`)
        }}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800/80 py-6 text-center text-xs text-zinc-500 dark:text-zinc-500">
        <p>Aegis Capital • Gestão de Alta Performance para Fluxo de Caixa, Contas & Cartões</p>
      </footer>
    </div>
  )
}

export default App
