import { useState } from 'react'
import type { Transaction, CreditCard, BankAccount } from '../types'
import { formatCurrency, formatDateBR, calculateInstallmentEndDate } from '../lib/utils'
import {
  X,
  Edit3,
  Trash2,
  AlertTriangle,
  CreditCard as CreditCardIcon,
  Landmark,
  DollarSign,
  CheckCircle2,
  Clock,
  Calendar,
  Tag,
  ChevronRight,
} from 'lucide-react'

interface ManageTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: Transaction | null
  cards: CreditCard[]
  accounts: BankAccount[]
  onEdit: (tx: Transaction) => void
  onDelete: (id: string, deleteSeries?: boolean) => void
  onToggleStatus: (id: string) => void
}

export function ManageTransactionModal({
  isOpen,
  onClose,
  transaction,
  cards,
  accounts,
  onEdit,
  onDelete,
  onToggleStatus,
}: ManageTransactionModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!isOpen || !transaction) return null

  const isIncome = transaction.type === 'income'
  const isCard = transaction.paymentMethod === 'credit_card'
  const card = isCard ? cards.find((c) => c.id === transaction.creditCardId) : null
  const account = !isCard && transaction.bankAccountId ? accounts.find((a) => a.id === transaction.bankAccountId) : null
  const isPaid = transaction.status === 'paid'
  const isInstallmentSeries = Boolean((transaction.installmentsTotal || 1) > 1 && transaction.parentInstallmentId)

  const handleDeleteSingle = () => {
    onDelete(transaction.id, false)
    setConfirmDelete(false)
    onClose()
  }

  const handleDeleteAllSeries = () => {
    onDelete(transaction.id, true)
    setConfirmDelete(false)
    onClose()
  }

  const handleClose = () => {
    setConfirmDelete(false)
    onClose()
  }

  const handleEditClick = () => {
    onClose()
    onEdit(transaction)
  }

  const handleToggleStatusClick = () => {
    onToggleStatus(transaction.id)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 space-y-5 animate-slide-up">
        
        {/* Mobile Drag Indicator Pill */}
        <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto -mt-2 mb-2 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isIncome
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : isCard
                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            }`}>
              {isCard ? (
                <CreditCardIcon className="w-4 h-4" />
              ) : transaction.paymentMethod === 'pix' ? (
                <DollarSign className="w-4 h-4" />
              ) : (
                <Landmark className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Gerenciar Lançamento
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                  3 Toques
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {isIncome ? 'Entrada / Receita' : isCard ? 'Compra no Cartão' : 'Despesa em Conta'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Detalhes do Lançamento */}
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-sm font-bold text-zinc-900 dark:text-white block">
                {transaction.description}
              </span>
              {transaction.cardStatementName && (
                <span className="inline-block text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-purple-100/70 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 mt-1">
                  Fatura: {transaction.cardStatementName}
                </span>
              )}
            </div>
            <div className="text-right shrink-0">
              <span className={`text-base font-bold font-mono-numbers block ${
                isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-zinc-100'
              }`}>
                {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, false)}
              </span>
              {transaction.installmentsTotal && transaction.installmentsTotal > 1 && (
                <span className="text-[10px] text-zinc-400 font-mono-numbers">
                  Parcela {transaction.installmentNumber} de {transaction.installmentsTotal}x
                </span>
              )}
            </div>
          </div>

          {/* Linhas de Metadados */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/80 text-[11px]">
            <div className="flex items-center gap-1.5 text-zinc-500">
              <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>{isCard ? 'Compra:' : 'Data:'} <strong className="text-zinc-800 dark:text-zinc-200">{formatDateBR(transaction.date)}</strong></span>
            </div>

            <div className="flex items-center gap-1.5 text-zinc-500">
              <Clock className="w-3.5 h-3.5 text-purple-500 shrink-0" />
              <span>{isCard ? 'Fatura:' : 'Vencimento:'} <strong className="text-zinc-800 dark:text-zinc-200">{formatDateBR(transaction.dueDate)}</strong></span>
            </div>

            <div className="flex items-center gap-1.5 text-zinc-500">
              <Tag className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="truncate">Cat: <strong className="text-zinc-800 dark:text-zinc-200">{transaction.category}</strong></span>
            </div>

            <div className="flex items-center gap-1.5 text-zinc-500">
              {isCard ? (
                <>
                  <CreditCardIcon className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span className="truncate">{card ? `${card.name}` : 'Cartão'}</span>
                </>
              ) : (
                <>
                  <Landmark className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">{account ? `${account.name}` : transaction.paymentMethod === 'pix' ? 'PIX' : 'Conta'}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-zinc-500 col-span-2 pt-1 border-t border-zinc-200/40 dark:border-zinc-800/40">
              {isPaid ? (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Liquidado / Pago</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pendente (Comprometido até {formatDateBR(transaction.dueDate)})</span>
                </span>
              )}
            </div>
          </div>

          {/* Destaque de Término do Parcelamento */}
          {transaction.installmentsTotal && transaction.installmentsTotal > 1 && (
            <div className="p-3 rounded-xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-purple-950 dark:text-purple-200">
                <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 dark:text-purple-400 block">Término do Parcelamento</span>
                  <span>Acaba em: <strong className="font-bold underline decoration-purple-400 decoration-2">{calculateInstallmentEndDate(transaction.dueDate, transaction.installmentsTotal, transaction.installmentNumber).endMonthYearText}</strong></span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-purple-200/70 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200">
                {transaction.installmentsTotal - (transaction.installmentNumber || 1) === 0
                  ? 'Última parcela!'
                  : `Faltam ${transaction.installmentsTotal - (transaction.installmentNumber || 1)} parcelas`}
              </span>
            </div>
          )}

          {transaction.notes && (
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 pt-1 italic border-t border-zinc-200/40 dark:border-zinc-800/40">
              Obs: {transaction.notes}
            </p>
          )}
        </div>

        {/* Confirmação de Exclusão */}
        {confirmDelete && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/60 text-xs text-rose-800 dark:text-rose-300 space-y-3 animate-fade-in">
            <div className="flex items-center gap-2 font-bold text-rose-900 dark:text-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Deseja realmente excluir este lançamento?</span>
            </div>
            <p className="text-[11px] text-rose-700 dark:text-rose-300">
              Esta ação removerá o registro permanentemente do Supabase e recalculará os limites do cartão e saldos.
            </p>

            {isInstallmentSeries ? (
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleDeleteSingle}
                  className="w-full py-2.5 px-3 rounded-lg bg-white dark:bg-zinc-800 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 hover:bg-rose-100/60 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir APENAS esta parcela ({transaction.installmentNumber}/{transaction.installmentsTotal}x)</span>
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAllSeries}
                  className="w-full py-2.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir TODAS as {transaction.installmentsTotal} parcelas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="w-full py-1.5 text-center text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDeleteSingle}
                  className="flex-1 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Confirmar Exclusão</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-2 text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        )}

        {/* Ações */}
        <div className="space-y-2 pt-1">
          {/* Botão de Edição */}
          <button
            type="button"
            onClick={handleEditClick}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-zinc-200 dark:border-zinc-700/80 hover:border-emerald-300 dark:hover:border-emerald-700/60 text-zinc-800 dark:text-zinc-100 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Edit3 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold block text-zinc-900 dark:text-white">
                  Editar Lançamento
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Alterar valor, descrição, data, categoria ou forma de pagamento
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
          </button>

          {/* Botão Alternar Status */}
          <button
            type="button"
            onClick={handleToggleStatusClick}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 text-zinc-800 dark:text-zinc-100 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isPaid
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              }`}>
                {isPaid ? <Clock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              </div>
              <div className="text-left">
                <span className="text-xs font-bold block text-zinc-900 dark:text-white">
                  {isPaid ? 'Marcar como Pendente' : 'Marcar como Liquidado / Pago'}
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {isPaid
                    ? 'Reabre o lançamento e compromete o limite se for cartão'
                    : 'Confirma o pagamento e libera o limite do cartão'}
                </span>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
              isPaid
                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
            }`}>
              {isPaid ? 'Pendente' : 'Liquidado'}
            </span>
          </button>

          {/* Botão de Exclusão (quando não estiver com painel de confirmação aberto) */}
          {!confirmDelete && (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-zinc-200 dark:border-zinc-700/80 hover:border-rose-300 dark:hover:border-rose-800 text-zinc-800 dark:text-zinc-100 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold block text-rose-600 dark:text-rose-400">
                    {isInstallmentSeries ? 'Excluir Parcelamento / Parcela' : 'Excluir Lançamento'}
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {isInstallmentSeries ? 'Escolha excluir uma única parcela ou todas de uma vez' : 'Remove do Supabase e recalcula os limites'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-rose-500 transition-colors" />
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
