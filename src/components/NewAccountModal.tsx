import { useState, useEffect } from 'react'
import type { BankAccount, AccountType } from '../types'
import { BANK_PRESETS, getBankBranding, type BankBrandConfig } from '../lib/bankBranding'
import { BankAccountVisual } from './BankAccountVisual'
import { X, Plus, Landmark, Sparkles, Palette, RotateCcw, Trash2 } from 'lucide-react'

interface NewAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (account: Omit<BankAccount, 'id' | 'createdAt'>) => void
  editAccount?: BankAccount | null
  onUpdate?: (id: string, updates: Partial<BankAccount>) => void
  onDelete?: (id: string) => void
}

const COLOR_SWATCHES = [
  { name: 'Safra Gold', hex: '#C5A059' },
  { name: 'Obsidian Black', hex: '#18181B' },
  { name: 'Deep Navy', hex: '#0B132B' },
  { name: 'Esmeralda', hex: '#064E3B' },
  { name: 'Rubi Imperial', hex: '#7F1D1D' },
  { name: 'Roxo Veludo', hex: '#4C1D95' },
  { name: 'Azul Safira', hex: '#1E3A8A' },
  { name: 'Verde Ton', hex: '#00D05E' },
  { name: 'Rosa Cakto', hex: '#FF3366' },
  { name: 'Chama Laranja', hex: '#9A3412' },
]

export function NewAccountModal({
  isOpen,
  onClose,
  onSave,
  editAccount = null,
  onUpdate,
  onDelete,
}: NewAccountModalProps) {
  const [name, setName] = useState('')
  const [bank, setBank] = useState('Banco Safra')
  const [accountType, setAccountType] = useState<AccountType>('checking')
  const [initialBalance, setInitialBalance] = useState<string>('5000')
  const [color, setColor] = useState('#C5A059')
  const [customBgColor, setCustomBgColor] = useState<string | undefined>(undefined)
  const [agency, setAgency] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'bank' | 'gateway'>('all')

  useEffect(() => {
    if (editAccount) {
      setName(editAccount.name)
      setBank(editAccount.bank)
      setAccountType(editAccount.accountType)
      setInitialBalance(editAccount.initialBalance.toString())
      setColor(editAccount.color)
      setCustomBgColor(editAccount.customBgColor)
      setAgency(editAccount.agency || '')
      setAccountNumber(editAccount.accountNumber || '')
      setNotes(editAccount.notes || '')
    } else {
      setName('')
      setBank('Banco Safra')
      setAccountType('checking')
      setInitialBalance('5000')
      setColor('#C5A059')
      setCustomBgColor(undefined)
      setAgency('')
      setAccountNumber('')
      setNotes('')
    }
  }, [editAccount, isOpen])

  if (!isOpen) return null

  const handleSelectPreset = (preset: BankBrandConfig) => {
    setBank(preset.name)
    setColor(preset.primaryColor)
    // Se o usuário não tinha uma cor customizada forçada, mantém padrão oficial
    if (!name || BANK_PRESETS.some((p) => name === `${p.name} Principal` || name === `${p.shortName} Conta` || name === `${p.shortName} Conta Principal`)) {
      setName(`${preset.shortName} Conta Principal`)
    }
  }

  const numBalance = parseFloat(initialBalance) || 0

  // Preview dinâmico da conta com o design do banco e cor customizada se selecionada
  const previewAccount: BankAccount & { currentBalance: number } = {
    id: 'preview_acc',
    name: name.trim() || `${bank} Conta`,
    bank: bank.trim() || 'Banco',
    accountType,
    initialBalance: numBalance,
    currentBalance: numBalance,
    color,
    customBgColor,
    agency: agency.trim() || undefined,
    accountNumber: accountNumber.trim() || undefined,
    notes: notes.trim() || undefined,
    createdAt: new Date().toISOString(),
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const payload = {
      name: name.trim(),
      bank: bank.trim(),
      accountType,
      initialBalance: numBalance,
      color,
      customBgColor: customBgColor || undefined,
      agency: agency.trim() || undefined,
      accountNumber: accountNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    }

    if (editAccount && onUpdate) {
      onUpdate(editAccount.id, payload)
    } else {
      onSave(payload)
    }

    onClose()
  }

  const filteredPresets = BANK_PRESETS.filter((p) => {
    if (categoryFilter === 'all') return true
    if (categoryFilter === 'bank') return p.category === 'bank' || p.category === 'investment'
    if (categoryFilter === 'gateway') return p.category === 'gateway'
    return true
  })

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center p-0 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md overflow-hidden">
      <div className="w-full max-w-xl max-h-[92vh] sm:max-h-[88vh] rounded-t-3xl sm:rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col text-zinc-800 dark:text-zinc-200 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 overflow-hidden">
        
        {/* Mobile Drag Indicator Bar */}
        <div className="w-12 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto mt-2.5 sm:hidden shrink-0" />
        
        {/* Header fixo */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                {editAccount ? 'Editar Conta Bancária' : 'Cadastrar Conta Bancária'}
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {editAccount ? 'Altere as informações cadastrais e visuais da instituição' : 'Design oficial automático para Bancos, Safra, Ton, Cakto e Gateways'}
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

        {/* Corpo rolável */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Live Preview do Cartão da Conta Bancária */}
          <div className="flex flex-col items-center justify-center py-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-500" /> Preview com Acabamento em Tempo Real
            </span>
            <div className="w-full max-w-[340px]">
              <BankAccountVisual account={previewAccount} />
            </div>
          </div>

          {/* Seleção Rápida de Bancos & Gateways com Filtros */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Escolha o Banco ou Gateway de Pagamento
              </label>
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-0.5 rounded-lg text-[10px] font-medium">
                <button
                  type="button"
                  onClick={() => setCategoryFilter('all')}
                  className={`px-2 py-0.5 rounded-md transition-colors ${
                    categoryFilter === 'all'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-semibold'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  Todos ({BANK_PRESETS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('bank')}
                  className={`px-2 py-0.5 rounded-md transition-colors ${
                    categoryFilter === 'bank'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-semibold'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  Bancos
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('gateway')}
                  className={`px-2 py-0.5 rounded-md transition-colors ${
                    categoryFilter === 'gateway'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-semibold'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  Gateways / Ton
                </button>
              </div>
            </div>

            {/* Grid de presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-1.5 max-h-36 overflow-y-auto p-1 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/80">
              {filteredPresets.map((preset) => {
                const isSelected = getBankBranding(bank).id === preset.id
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-1.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-all text-left truncate ${
                      isSelected
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-emerald-500 ring-1 ring-emerald-500/50 shadow-xs'
                        : 'bg-white dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/60 hover:border-zinc-300'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: preset.primaryColor }}
                    />
                    <span className="truncate">{preset.shortName}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Opcional: Seletor de Cor de Fundo */}
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-emerald-500" />
                <span>Cor de Fundo do Cartão (Opcional)</span>
              </label>
              {customBgColor ? (
                <button
                  type="button"
                  onClick={() => setCustomBgColor(undefined)}
                  className="text-[10px] text-zinc-500 hover:text-emerald-500 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-2.5 h-2.5" /> Padrão Oficial
                </button>
              ) : (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Usando design oficial
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setCustomBgColor(undefined)}
                className={`px-2 py-1 rounded-lg border text-[10px] font-medium transition-all ${
                  !customBgColor
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                Padrão do Banco
              </button>

              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch.name}
                  type="button"
                  title={swatch.name}
                  onClick={() => setCustomBgColor(swatch.hex)}
                  className={`w-6 h-6 rounded-full border transition-all shrink-0 ${
                    customBgColor === swatch.hex
                      ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 scale-110'
                      : 'border-white/20 hover:scale-105'
                  }`}
                  style={{ backgroundColor: swatch.hex }}
                />
              ))}

              {/* Seletor Customizado Nativo */}
              <label
                title="Escolher qualquer cor personalizada"
                className="relative flex items-center justify-center w-6 h-6 rounded-full border border-dashed border-zinc-400 dark:border-zinc-600 hover:border-emerald-500 cursor-pointer overflow-hidden text-[9px] font-bold text-zinc-500"
              >
                <span>+</span>
                <input
                  type="color"
                  value={customBgColor || '#18181B'}
                  onChange={(e) => setCustomBgColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </label>
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
                placeholder="Ex: Safra Conta Principal, Ton Negócios..."
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
                placeholder="Ex: Banco Safra, Ton, Cakto, Itaú, Asaas..."
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
                <option value="cash">Dinheiro em Espécie</option>
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
                placeholder="Ex: 0001"
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
                placeholder="Ex: 12345-6"
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
              placeholder="Ex: Conta de recebimentos de checkout, clientes e maquininha..."
              className="w-full bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Botões de Ação fixos no rodapé */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            {editAccount && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Deseja realmente excluir a conta ${editAccount.name}?`)) {
                    onDelete(editAccount.id)
                    onClose()
                  }
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
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
                <span>{editAccount ? 'Salvar Alterações' : 'Salvar Conta'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  )
}
