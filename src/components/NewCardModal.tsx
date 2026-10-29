import { useState } from 'react'
import type { CreditCard, CardBrand, CardColorScheme } from '../types'
import { CreditCardVisual } from './CreditCardVisual'
import { X, Plus, Sparkles } from 'lucide-react'

interface NewCardModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (card: Omit<CreditCard, 'id' | 'createdAt'>) => void
}

export function NewCardModal({ isOpen, onClose, onSave }: NewCardModalProps) {
  const [name, setName] = useState('')
  const [bank, setBank] = useState('XP Investimentos')
  const [brand, setBrand] = useState<CardBrand>('visa')
  const [lastFourDigits, setLastFourDigits] = useState('')
  const [colorScheme, setColorScheme] = useState<CardColorScheme>('black')
  const [creditLimit, setCreditLimit] = useState<string>('20000')
  const [closingDay, setClosingDay] = useState<number>(10)
  const [dueDay, setDueDay] = useState<number>(17)
  const [notes, setNotes] = useState('')

  if (!isOpen) return null

  const numLimit = parseFloat(creditLimit) || 0

  // Preview dinâmico do cartão
  const previewCard: CreditCard = {
    id: 'preview',
    name: name.trim() || 'Cartão de Crédito',
    bank: bank.trim() || 'Banco Emissor',
    brand,
    lastFourDigits: lastFourDigits.padStart(4, '0') || '0000',
    colorScheme,
    creditLimit: numLimit,
    closingDay,
    dueDay,
    createdAt: new Date().toISOString(),
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || numLimit <= 0) return

    onSave({
      name: name.trim(),
      bank: bank.trim(),
      brand,
      lastFourDigits: (lastFourDigits.replace(/\D/g, '').slice(-4) || '1234'),
      colorScheme,
      creditLimit: numLimit,
      closingDay: Number(closingDay),
      dueDay: Number(dueDay),
      notes: notes.trim() || undefined,
    })

    onClose()
  }

  const colorOptions: { value: CardColorScheme; label: string; bgClass: string }[] = [
    { value: 'black', label: 'Obsidian Black', bgClass: 'bg-zinc-900 border-zinc-700' },
    { value: 'titanium', label: 'Titanium Gray', bgClass: 'bg-zinc-700 border-zinc-500' },
    { value: 'emerald', label: 'Emerald Metal', bgClass: 'bg-emerald-900 border-emerald-600' },
    { value: 'gold', label: 'Gold Champagne', bgClass: 'bg-amber-900 border-amber-600' },
    { value: 'purple', label: 'Midnight Purple', bgClass: 'bg-purple-900 border-purple-600' },
    { value: 'blue', label: 'Royal Blue', bgClass: 'bg-blue-900 border-blue-600' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 text-zinc-800 dark:text-zinc-200 animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">Cadastrar Novo Cartão de Crédito</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Personalize o acabamento do cartão, limite, data de fechamento e vencimento
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          
          {/* Live Preview Center */}
          <div className="flex flex-col items-center justify-center py-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-500" /> Prévia Visual do Cartão
            </span>
            <div className="w-full max-w-[320px]">
              <CreditCardVisual card={previewCard} usedLimit={0} showDetails={false} />
            </div>
          </div>

          {/* Nome e Banco */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Nome do Cartão
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Nubank Ultravioleta"
                className="w-full bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Instituição Emissora / Banco
              </label>
              <input
                type="text"
                required
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                placeholder="Ex: Nubank, Itaú, XP..."
                className="w-full bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Bandeira e 4 Últimos Dígitos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Bandeira
              </label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value as CardBrand)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-200 px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="visa">Visa</option>
                <option value="mastercard">Mastercard</option>
                <option value="elo">Elo</option>
                <option value="amex">American Express</option>
                <option value="other">Outra</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Últimos 4 Dígitos
              </label>
              <input
                type="text"
                maxLength={4}
                value={lastFourDigits}
                onChange={(e) => setLastFourDigits(e.target.value.replace(/\D/g, ''))}
                placeholder="Ex: 8821"
                className="w-full bg-zinc-50 dark:bg-zinc-950 font-mono-numbers text-xs text-zinc-900 dark:text-white px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Limite Total de Crédito */}
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Limite de Crédito Total (R$)
            </label>
            <input
              type="number"
              step="100"
              required
              value={creditLimit}
              onChange={(e) => setCreditLimit(e.target.value)}
              placeholder="Ex: 25000"
              className="w-full bg-zinc-50 dark:bg-zinc-950 font-mono-numbers text-xs text-zinc-900 dark:text-white px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Dias de Fechamento e Vencimento */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Dia de Fechamento (1 a 31)
              </label>
              <input
                type="number"
                min={1}
                max={31}
                required
                value={closingDay}
                onChange={(e) => setClosingDay(Number(e.target.value))}
                className="w-full bg-zinc-50 dark:bg-zinc-950 font-mono-numbers text-xs text-zinc-900 dark:text-white px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-zinc-500 mt-0.5 block">
                Melhor dia para compra: dia {closingDay === 31 ? 1 : closingDay + 1}
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Dia de Vencimento (1 a 31)
              </label>
              <input
                type="number"
                min={1}
                max={31}
                required
                value={dueDay}
                onChange={(e) => setDueDay(Number(e.target.value))}
                className="w-full bg-zinc-50 dark:bg-zinc-950 font-mono-numbers text-xs text-zinc-900 dark:text-white px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-zinc-500 mt-0.5 block">
                Dia do pagamento da fatura no caixa
              </span>
            </div>
          </div>

          {/* Seletor de Acabamento Visual do Cartão */}
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
              Acabamento Estético / Material
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {colorOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setColorScheme(opt.value)}
                  className={`p-2 rounded-xl border text-[11px] font-medium flex flex-col items-center gap-1 transition-all ${
                    colorScheme === opt.value
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-zinc-900 dark:text-white shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full border ${opt.bgClass}`} />
                  <span className="text-[9px] text-center leading-tight truncate w-full">
                    {opt.label.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Observações / Benefícios */}
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Benefícios & Regras (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: 1% de Cashback, Salas VIP DragonPass, Pontos 2.2 por USD..."
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
              <span>Adicionar Cartão</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
