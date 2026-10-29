import { useState } from 'react'
import type { CreditCard, CardBrand, CardColorScheme } from '../types'
import { CreditCardVisual } from './CreditCardVisual'
import { X, Plus, Sparkles } from 'lucide-react'

interface NewCardModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (card: Omit<CreditCard, 'id' | 'createdAt'>) => void
}

const CARD_PRESETS = [
  {
    name: 'Nubank Ultravioleta',
    bank: 'Nubank',
    brand: 'mastercard' as CardBrand,
    colorScheme: 'purple' as CardColorScheme,
    limit: '35000',
    closingDay: 8,
    dueDay: 15,
  },
  {
    name: 'XP Visa Infinite',
    bank: 'XP Investimentos',
    brand: 'visa' as CardBrand,
    colorScheme: 'titanium' as CardColorScheme,
    limit: '50000',
    closingDay: 18,
    dueDay: 25,
  },
  {
    name: 'Itaú Personnalité Black',
    bank: 'Itaú Unibanco',
    brand: 'mastercard' as CardBrand,
    colorScheme: 'black' as CardColorScheme,
    limit: '45000',
    closingDay: 28,
    dueDay: 5,
  },
  {
    name: 'BTG Ultrablue Metal',
    bank: 'BTG Pactual',
    brand: 'mastercard' as CardBrand,
    colorScheme: 'blue' as CardColorScheme,
    limit: '60000',
    closingDay: 12,
    dueDay: 19,
  },
  {
    name: 'C6 Carbon Black',
    bank: 'C6 Bank',
    brand: 'mastercard' as CardBrand,
    colorScheme: 'black' as CardColorScheme,
    limit: '30000',
    closingDay: 20,
    dueDay: 27,
  },
  {
    name: 'Inter Black / Win',
    bank: 'Banco Inter',
    brand: 'mastercard' as CardBrand,
    colorScheme: 'gold' as CardColorScheme,
    limit: '25000',
    closingDay: 15,
    dueDay: 22,
  },
  {
    name: 'Bradesco Prime Metal',
    bank: 'Bradesco',
    brand: 'visa' as CardBrand,
    colorScheme: 'titanium' as CardColorScheme,
    limit: '40000',
    closingDay: 14,
    dueDay: 21,
  },
  {
    name: 'Santander Unlimited',
    bank: 'Santander',
    brand: 'mastercard' as CardBrand,
    colorScheme: 'black' as CardColorScheme,
    limit: '55000',
    closingDay: 10,
    dueDay: 17,
  },
]

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

  const handleSelectPreset = (preset: typeof CARD_PRESETS[0]) => {
    setName(preset.name)
    setBank(preset.bank)
    setBrand(preset.brand)
    setColorScheme(preset.colorScheme)
    setCreditLimit(preset.limit)
    setClosingDay(preset.closingDay)
    setDueDay(preset.dueDay)
  }

  // Detecção inteligente por digitação
  const handleNameChange = (val: string) => {
    setName(val)
    const lower = val.toLowerCase()
    if (lower.includes('nu') || lower.includes('ultravioleta')) {
      setColorScheme('purple')
      setBrand('mastercard')
      setBank('Nubank')
    } else if (lower.includes('xp')) {
      setColorScheme('titanium')
      setBrand('visa')
      setBank('XP Investimentos')
    } else if (lower.includes('itau') || lower.includes('itaú') || lower.includes('personnalite')) {
      setColorScheme('black')
      setBrand('mastercard')
      setBank('Itaú Unibanco')
    } else if (lower.includes('btg') || lower.includes('ultrablue')) {
      setColorScheme('blue')
      setBrand('mastercard')
      setBank('BTG Pactual')
    } else if (lower.includes('c6') || lower.includes('carbon')) {
      setColorScheme('black')
      setBrand('mastercard')
      setBank('C6 Bank')
    } else if (lower.includes('inter')) {
      setColorScheme('gold')
      setBrand('mastercard')
      setBank('Banco Inter')
    } else if (lower.includes('ouro') || lower.includes('gold')) {
      setColorScheme('gold')
    } else if (lower.includes('emerald') || lower.includes('verde')) {
      setColorScheme('emerald')
    }
  }

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
      lastFourDigits: lastFourDigits.replace(/\D/g, '').slice(-4) || '1234',
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
              Escolha um modelo de prestígio ou digite o nome para detecção automática do design realista
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
              <Sparkles className="w-3 h-3 text-emerald-500" /> Acabamento Metálico em Tempo Real
            </span>
            <div className="w-full max-w-[340px]">
              <CreditCardVisual card={previewCard} usedLimit={0} showDetails={false} />
            </div>
          </div>

          {/* Modelos Populares de Prestígio (1-Click) */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Modelos Famosos de Cartão (Aplica cor, bandeira e acabamento oficial)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CARD_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2 rounded-xl border text-[11px] font-semibold text-left transition-all ${
                    name === preset.name
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-emerald-500 ring-2 ring-emerald-500/30 shadow-sm'
                      : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                  }`}
                >
                  <span className="truncate block font-bold">{preset.name}</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block font-normal">
                    {preset.bank} • {preset.brand.toUpperCase()}
                  </span>
                </button>
              ))}
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
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ex: Nubank Ultravioleta, XP Infinite..."
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
                Dia de Vencimento da Fatura
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
                Prazo: fatura fecha {(dueDay - closingDay + 30) % 30 || 7} dias antes
              </span>
            </div>
          </div>

          {/* Acabamento Metálico */}
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2">
              Acabamento Metálico do Cartão
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {colorOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setColorScheme(opt.value)}
                  className={`p-2 rounded-xl border text-[11px] font-medium flex flex-col items-center gap-1.5 transition-all ${
                    colorScheme === opt.value
                      ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-zinc-100 dark:bg-zinc-800 shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:border-zinc-300'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full border shadow-sm ${opt.bgClass}`} />
                  <span className="text-[10px] truncate max-w-full">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Benefícios & Observações
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Cashback de 1% rendendo 200% do CDI, Salas VIP..."
              className="w-full bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Ações */}
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
              <span>Salvar Cartão</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
