import { useState, useRef } from 'react'
import type { DetailedBankAccount, Transaction, BankAccount } from '../types'
import { formatCurrency, formatDateBR } from '../lib/utils'
import { BankAccountVisual } from './BankAccountVisual'
import {
  Landmark,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  Edit3,
} from 'lucide-react'

interface BankAccountsViewProps {
  detailedAccounts: DetailedBankAccount[]
  transactions: Transaction[]
  summary: {
    totalCurrentBalance: number
    totalIncomes: number
    totalExpenses: number
    totalPendingIncomes: number
    totalPendingExpenses: number
    accountsCount: number
  }
  privacyMode: boolean
  onOpenNewAccount: () => void
  onOpenNewTransaction: () => void
  onEditAccount?: (account: BankAccount) => void
  onManageAccount?: (account: BankAccount) => void
  onDeleteAccount: (id: string) => void
  onDeleteTransaction: (id: string) => void
  onToggleStatus: (id: string) => void
  onManageTransaction?: (tx: Transaction) => void
  onEditTransaction?: (tx: Transaction) => void
}

export function BankAccountsView({
  detailedAccounts,
  transactions,
  summary,
  privacyMode,
  onOpenNewAccount,
  onOpenNewTransaction,
  onEditAccount,
  onManageAccount,
  onDeleteAccount,
  onDeleteTransaction,
  onToggleStatus,
  onManageTransaction,
  onEditTransaction,
}: BankAccountsViewProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<string>(() => {
    return detailedAccounts[0]?.id || ''
  })

  const clickTrackers = useRef<Map<string, { count: number; time: number }>>(new Map())

  const handleTxRowClick = (e: React.MouseEvent, tx: Transaction) => {
    if ((e.target as HTMLElement).closest('button')) return

    const now = Date.now()
    const tracker = clickTrackers.current.get(tx.id) || { count: 0, time: 0 }
    const diff = now - tracker.time

    if (diff < 500) {
      tracker.count += 1
    } else {
      tracker.count = 1
    }
    tracker.time = now
    clickTrackers.current.set(tx.id, tracker)

    if (tracker.count >= 3 || e.detail >= 3) {
      tracker.count = 0
      clickTrackers.current.set(tx.id, tracker)
      if (onManageTransaction) {
        onManageTransaction(tx)
      } else if (onEditTransaction) {
        onEditTransaction(tx)
      }
    }
  }

  const activeAccount = detailedAccounts.find((a) => a.id === selectedAccountId) || detailedAccounts[0]

  // Transações associadas a esta conta bancária
  const accountTransactions = transactions
    .filter((tx) => tx.bankAccountId === activeAccount?.id)
    .sort((a, b) => (b.dueDate || b.date).localeCompare(a.dueDate || a.date))


  if (detailedAccounts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center bg-white dark:bg-zinc-900/40 shadow-sm">
        <Landmark className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mx-auto mb-4" />
        <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
          Nenhuma conta bancária cadastrada
        </h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-6">
          Cadastre suas contas no Banco Safra, Itaú, BTG, Ton, Cakto, Asaas, etc., para conciliar saldos reais e extratos.
        </p>
        <button
          onClick={onOpenNewAccount}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-semibold text-xs inline-flex items-center gap-2 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Cadastrar Primeira Conta</span>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      
      {/* Top Consolidator Metrics Bar (Responsive 2x2 on mobile, 4-col on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        
        {/* Total Bank Balance */}
        <div className="rounded-2xl p-3.5 sm:p-5 bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-[11px] sm:text-xs mb-1.5 sm:mb-2">
              <span className="font-medium truncate">Saldo Total Contas</span>
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-bold font-mono-numbers text-zinc-900 dark:text-white truncate">
              {formatCurrency(summary.totalCurrentBalance, privacyMode)}
            </div>
          </div>
          <div className="mt-2 text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
            {summary.accountsCount} contas ativas
          </div>
        </div>

        {/* Total Incomes in Accounts */}
        <div className="rounded-2xl p-3.5 sm:p-5 bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-[11px] sm:text-xs mb-1.5 sm:mb-2">
              <span className="font-medium truncate">Entradas</span>
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-bold font-mono-numbers text-emerald-600 dark:text-emerald-400 truncate">
              +{formatCurrency(summary.totalIncomes, privacyMode)}
            </div>
          </div>
          <div className="mt-2 text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
            Recebimentos liquidados
          </div>
        </div>

        {/* Total Expenses Debited */}
        <div className="rounded-2xl p-3.5 sm:p-5 bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-[11px] sm:text-xs mb-1.5 sm:mb-2">
              <span className="font-medium truncate">Saídas Debitadas</span>
              <div className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <ArrowDownRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-bold font-mono-numbers text-zinc-800 dark:text-zinc-200 truncate">
              -{formatCurrency(summary.totalExpenses, privacyMode)}
            </div>
          </div>
          <div className="mt-2 text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
            Transferências e débitos
          </div>
        </div>

        {/* Net Ratio */}
        <div className="rounded-2xl p-3.5 sm:p-5 bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-[11px] sm:text-xs mb-1.5 sm:mb-2">
              <span className="font-medium truncate">Líquido Bancário</span>
              <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-bold font-mono-numbers text-zinc-900 dark:text-white truncate">
              {formatCurrency(summary.totalIncomes - summary.totalExpenses, privacyMode)}
            </div>
          </div>
          <div className="mt-2 text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
            Fluxo bancário no período
          </div>
        </div>

      </div>

      {/* Grid of Bank Accounts Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs uppercase tracking-wider font-bold text-zinc-900 dark:text-white">
              Suas Contas Bancárias
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Selecione uma conta para auditar extratos, saldos e movimentações
            </p>
          </div>
          <button
            onClick={onOpenNewAccount}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Conta</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {detailedAccounts.map((account) => (
            <BankAccountVisual
              key={account.id}
              account={account}
              privacyMode={privacyMode}
              isSelected={activeAccount?.id === account.id}
              onClick={() => setSelectedAccountId(account.id)}
              onTripleClick={() => {
                if (onManageAccount) onManageAccount(account)
              }}
            />
          ))}
        </div>
      </div>

      {/* Extrato Detalhado da Conta Ativa */}
      {activeAccount && (
        <div className="rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 p-6 shadow-sm backdrop-blur-sm space-y-5">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400">
                  Extrato da Conta
                </span>
                <span className="text-zinc-400">•</span>
                <span className="text-xs text-zinc-500">{activeAccount.bank}</span>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                <span>{activeAccount.name}</span>
                <span className="text-sm font-bold font-mono-numbers text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
                  {formatCurrency(activeAccount.currentBalance, privacyMode)}
                </span>
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenNewTransaction}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all shadow-md flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ Lançamento Nesta Conta</span>
              </button>

              {onEditAccount && (
                <button
                  onClick={() => onEditAccount(activeAccount)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                  title="Editar esta conta (ou clique 3x no cartão)"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => {
                  if (confirm(`Deseja realmente remover a conta ${activeAccount.name}?`)) {
                    onDeleteAccount(activeAccount.id)
                  }
                }}
                className="p-2 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                title="Excluir esta conta"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lista de Movimentações */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Movimentações Registradas ({accountTransactions.length})
            </h4>

            {accountTransactions.length > 0 ? (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50/50 dark:bg-zinc-950/40">
                {accountTransactions.map((tx) => {
                  const isIncome = tx.type === 'income'
                  const isPaid = tx.status === 'paid'
                  return (
                    <div
                      key={tx.id}
                      onClick={(e) => handleTxRowClick(e, tx)}
                      title="Clique 3 vezes para gerenciar / editar este lançamento"
                      className="p-3.5 flex items-center justify-between hover:bg-white dark:hover:bg-zinc-900/50 transition-colors group cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onToggleStatus(tx.id)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                            isPaid
                              ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                              : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                          }`}
                        >
                          {isPaid ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </button>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white">
                              {tx.description}
                            </span>
                            {tx.cardStatementName && (
                              <span className="text-[10px] font-mono font-medium px-2 py-0.2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                                {tx.cardStatementName}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-500 flex items-center gap-2 mt-0.5">
                            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                              {tx.paymentMethod === 'pix' ? 'PIX' : 'TED / Conta'}
                            </span>
                            <span>•</span>
                            <span>{tx.category}</span>
                            <span>•</span>
                            <span>{formatDateBR(tx.date)}{tx.time ? ` às ${tx.time}` : ''}</span>
                            {tx.notes && <span>• {tx.notes}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="text-right">
                          <div
                            className={`font-mono-numbers font-semibold text-xs ${
                              isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-zinc-200'
                            }`}
                          >
                            {isIncome ? '+' : '-'}{formatCurrency(tx.amount, privacyMode)}
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            {isPaid ? 'Liquidado' : 'Pendente'}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => onManageTransaction ? onManageTransaction(tx) : onEditTransaction?.(tx)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-500 active:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                            title="Gerenciar / Editar lançamento (ou 3 cliques)"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteTransaction(tx.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 active:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                            title="Remover lançamento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-10 text-center text-zinc-400 dark:text-zinc-500 text-xs border border-zinc-200 dark:border-zinc-800/60 rounded-xl bg-white dark:bg-transparent">
                Nenhuma movimentação associada a esta conta bancária ainda.
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  )
}
