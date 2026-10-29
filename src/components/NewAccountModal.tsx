import { useState } from 'react'
import type { BankAccount, AccountType } from '../types'
import { BANK_PRESETS, getBankBranding } from '../lib/bankBranding'
import { BankAccountVisual } from './BankAccountVisual'
import { X, Plus, Landmark, Sparkles } from 'lucide-react'

interface NewAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (account: Omit<BankAccount, 'id' | 'createdAt'>) => void
}

export function NewAccountModal({ isOpen, onClose, onSave }: NewAccountModalProps) {
  const [name, setName] = useState('')
  const [bank, setBank] = useState('Itaú Unibanco')
  const [accountType, setAccountType] = useState<AccountType>('checking')
  const [initialBalance, setInitialBalance] = useState<string>('5000')
  const [color, setColor] = useState('#EC7000')
  const [agency, setAgency] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [notes, setNotes] = useState('')

  if (!isOpen) return null

  const handleSelectPreset = (preset: typeof BANK_PRESETS[0]) => {
    setBank(preset.name)
    setColor(preset.primaryColor)
    if (!name || BANK_PRESETS.some((p) => name === `${p.name} Principal` || name === `${p.shortName} Conta`)) {
      setName(`${preset.shortName} Conta Principal`)
    }
  }

  const numBalance = parseFloat(initialBalance) || 0

  // Preview dinâmico da conta com o design do banco
  const previewAccount: BankAccount & { currentBalance: number } = {
    id: 'preview_acc',
    name: name.trim() || `${bank} Conta`,
    bank: bank.trim() || 'Banco',
    accountType,
    initialBalance: numBalance,
    currentBalance: numBalance,
    color,
    agency: agency.trim() || undefined,
    accountNumber: accountNumber.trim() || undefined,
    notes: notes.trim() || undefined,
    createdAt: new Date().toISOString(),
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onSave({
      name: name.trim(),
      bank: bank.trim(),
      accountType,
      initialBalance: numBalance,
      color,
      agency: agency.trim() || undefined,
      accountNumber: accountNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 text-zinc-800 dark:text-zinc-200 animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">Cadastrar Conta Bancária</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                O cartão será estilizado automaticamente com o design oficial do banco escolhido
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          
          {/* Live Preview do Cartão da Conta Bancária */}
          <div className="flex flex-col items-center justify-center py-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-500" /> Design Oficial da Instituição
            </span>
            <div className="w-full max-w-[340px]">
              <BankAccountVisual account={previewAccount} />
            </div>
          </div>

          {/* Seleção Rápida de Bancos Populares */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Escolha Rápida do Banco (Aplica o design oficial)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {BANK_PRESETS.map((preset) => {
                const isSelected = getBankBranding(bank).id === preset.id
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-emerald-500 ring-2 ring-emerald-500/30 shadow-sm'
                        : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full`} style={{ backgroundColor: preset.primaryColor }} />
                    <span className="truncate">{preset.shortName}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Nome da Conta e Banco */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Nome de Identificação da Conta
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Itaú Personnalité Principal"
                className="w-full bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Nome do Banco / Instituição
              </label>
              <input
                type="text"
                required
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                placeholder="Ex: Itaú, BTG, Nubank, Santander..."
                className="w-full bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Tipo de Conta e Saldo Inicial */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Tipo da Conta
              </label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as AccountType)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-200 px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="checking">Conta Corrente / Movimentação</option>
                <option value="investment">Conta de Investimentos</option>
                <option value="savings">Poupança / Reserva de Emergência</option>
                <option value="salary">Conta Salário</option>
                <option value="digital_wallet">Carteira Digital</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Saldo Inicial / Saldo Atual (R$)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                placeholder="0,00"
                className="w-full bg-zinc-50 dark:bg-zinc-950 font-mono-numbers text-xs text-zinc-900 dark:text-white px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Agência e Número da Conta */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Agência (Opcional)
              </label>
              <input
                type="text"
                value={agency}
                onChange={(e) => setAgency(e.target.value)}
                placeholder="Ex: 0842"
                className="w-full bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Número da Conta (Opcional)
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Ex: 29810-4"
                className="w-full bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Finalidade / Observações
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Conta para recebimento de honorários e pagamentos mensais..."
              className="w-full bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Salvar Conta</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
