import { useState } from 'react'
import type { BankAccount, CreditCard } from './types'
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
import { ManageEntityModal } from './components/ManageEntityModal'
import { PinLockScreen } from './components/PinLockScreen'
import { BottomNavBar } from './components/BottomNavBar'

export function App() {
  const {
    theme,
    toggleTheme,
    isSyncing,
    isCloudConnected,
    reloadFromCloud,
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
    updateAccount,
    deleteAccount,
    addCard,
    updateCard,
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
  
  // Gerenciamento e Edição (3 Cliques ou Ações Rápidas)
  const [managingAccount, setManagingAccount] = useState<BankAccount | null>(null)
  const [managingCard, setManagingCard] = useState<CreditCard | null>(null)
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null)

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

  const handleImportBackup = async (jsonStr: string) => {
    const res = await importDataJSON(jsonStr)
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
        isSyncing={isSyncing}
        isCloudConnected={isCloudConnected}
        onReloadCloud={reloadFromCloud}
        totalCardsCount={cards.length}
        totalAccountsCount={accounts.length}
        pendingTxCount={pendingTransactionsCount}
      />

      {/* Main Body Content with mobile bottom padding */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-28 md:pb-8">
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
            onOpenNewAccount={() => {
              setEditingAccount(null)
              setIsAccountModalOpen(true)
            }}
            onEditAccount={(acc) => {
              setEditingAccount(acc)
              setIsAccountModalOpen(true)
            }}
            onManageAccount={(acc) => {
              setManagingAccount(acc)
            }}
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
            onOpenNewCard={() => {
              setEditingCard(null)
              setIsCardModalOpen(true)
            }}
            onEditCard={(card) => {
              setEditingCard(card)
              setIsCardModalOpen(true)
            }}
            onManageCard={(card) => {
              setManagingCard(card)
            }}
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

      {/* Mobile Native Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTransaction={() => setIsTransactionModalOpen(true)}
        pendingTxCount={pendingTransactionsCount}
        totalAccountsCount={accounts.length}
        totalCardsCount={cards.length}
      />

      {/* Toast Notification (above bottom nav on mobile) */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-semibold shadow-2xl border border-zinc-700/80 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
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
        onClose={() => {
          setIsCardModalOpen(false)
          setEditingCard(null)
        }}
        editCard={editingCard}
        onSave={(cardData) => {
          addCard(cardData)
          showToast(`Cartão ${cardData.name} cadastrado com sucesso!`)
        }}
        onUpdate={(cardId, updates) => {
          updateCard(cardId, updates)
          showToast(`Cartão atualizado com sucesso!`)
        }}
        onDelete={(cardId) => {
          deleteCard(cardId)
          showToast(`Cartão excluído com sucesso.`)
        }}
      />

      <NewAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => {
          setIsAccountModalOpen(false)
          setEditingAccount(null)
        }}
        editAccount={editingAccount}
        onSave={(accountData) => {
          addAccount(accountData)
          showToast(`Conta ${accountData.name} cadastrada com sucesso!`)
        }}
        onUpdate={(accId, updates) => {
          updateAccount(accId, updates)
          showToast(`Conta atualizada com sucesso!`)
        }}
        onDelete={(accId) => {
          deleteAccount(accId)
          showToast(`Conta excluída com sucesso.`)
        }}
      />

      {/* Modal de Gestão Rápida (3 Cliques) para Contas */}
      <ManageEntityModal
        isOpen={Boolean(managingAccount)}
        onClose={() => setManagingAccount(null)}
        type="account"
        entity={managingAccount}
        onEdit={() => {
          if (managingAccount) {
            setEditingAccount(managingAccount)
            setIsAccountModalOpen(true)
          }
        }}
        onDelete={() => {
          if (managingAccount) {
            deleteAccount(managingAccount.id)
            showToast(`Conta ${managingAccount.name} excluída com sucesso.`)
          }
        }}
      />

      {/* Modal de Gestão Rápida (3 Cliques) para Cartões */}
      <ManageEntityModal
        isOpen={Boolean(managingCard)}
        onClose={() => setManagingCard(null)}
        type="card"
        entity={managingCard}
        onEdit={() => {
          if (managingCard) {
            setEditingCard(managingCard)
            setIsCardModalOpen(true)
          }
        }}
        onDelete={() => {
          if (managingCard) {
            deleteCard(managingCard.id)
            showToast(`Cartão ${managingCard.name} excluído com sucesso.`)
          }
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
