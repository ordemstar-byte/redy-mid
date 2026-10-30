import type { BankAccount, CreditCard } from '../types'
import { formatCurrency } from '../lib/utils'
import {
  X,
  Edit3,
  Trash2,
  AlertTriangle,
  Landmark,
  CreditCard as CreditCardIcon,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'

interface ManageEntityModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'account' | 'card'
  entity: BankAccount | CreditCard | null
  onEdit: () => void
  onDelete: () => void
}

export function ManageEntityModal({
  isOpen,
  onClose,
  type,
  entity,
  onEdit,
  onDelete,
}: ManageEntityModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!isOpen || !entity) return null

  const isAccount = type === 'account'
  const account = isAccount ? (entity as BankAccount) : null
  const card = !isAccount ? (entity as CreditCard) : null

  const title = isAccount ? 'Gerenciar Conta Bancária' : 'Gerenciar Cartão de Crédito'
  const entityName = entity.name
  const entityBank = entity.bank

  const handleDeleteClick = () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    onDelete()
    setConfirmDelete(false)
    onClose()
  }

  const handleClose = () => {
    setConfirmDelete(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 space-y-5 animate-slide-up">
        
        {/* Mobile Drag Indicator Pill */}
        <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto -mt-2 mb-2 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              {isAccount ? <Landmark className="w-4 h-4" /> : <CreditCardIcon className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  {title}
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                  3 Toques
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {entityBank} • {entityName}
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

        {/* Mini Preview Box */}
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 block font-medium">
              {isAccount ? 'Instituição & Conta' : 'Cartão de Crédito'}
            </span>
            <span className="text-sm font-bold text-zinc-900 dark:text-white">
              {entityName}
            </span>
            <span className="text-xs text-zinc-500 block">
              {entityBank}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 block font-medium">
              {isAccount ? 'Saldo Inicial' : 'Limite Total'}
            </span>
            <span className="text-sm font-mono-numbers font-bold text-emerald-600 dark:text-emerald-400">
              {isAccount && account
                ? formatCurrency(account.initialBalance, false)
                : card
                ? formatCurrency(card.creditLimit, false)
                : 'R$ 0,00'}
            </span>
          </div>
        </div>

        {!confirmDelete ? (
          /* Ações Principais (Editar ou Excluir) */
          <div className="space-y-3 pt-1">
            
            {/* Opção 1: Editar */}
            <button
              onClick={() => {
                onClose()
                onEdit()
              }}
              className="w-full p-4 rounded-xl text-left bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 transition-all flex items-center justify-between group shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Editar Informações
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">
                    {isAccount
                      ? 'Alterar nome, cor, banco, saldo inicial ou agência/conta'
                      : 'Alterar nome, limite, bandeira, vencimento ou estilo visual'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>

            {/* Opção 2: Excluir */}
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full p-4 rounded-xl text-left bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-rose-500/50 hover:bg-rose-50/20 dark:hover:bg-rose-950/10 transition-all flex items-center justify-between group shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 block">
                    Excluir Instituição
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">
                    Remover permanentemente do Supabase e do fluxo
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>

          </div>
        ) : (
          /* Confirmação de Exclusão Segura */
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                  Confirmar Exclusão Definitiva?
                </h4>
                <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-1 leading-relaxed">
                  Você está prestes a excluir <strong>{entityName}</strong> ({entityBank}).
                  Esta ação removerá a instituição imediatamente do banco de dados remoto no Supabase.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-rose-200/80 dark:border-rose-900/40">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 transition-colors"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleDeleteClick}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-sm"
              >
                Sim, Excluir Definitivamente
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
