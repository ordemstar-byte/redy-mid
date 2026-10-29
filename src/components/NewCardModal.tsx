import { useState, useRef, useEffect } from 'react'
import type { CreditCard, CardBrand, CardColorScheme } from '../types'
import {
  searchCardPresets,
  type CardPresetItem,
} from '../lib/cardPresets'
import { CreditCardVisual } from './CreditCardVisual'
import { X, Plus, Sparkles, Search, Check, Layers } from 'lucide-react'

interface NewCardModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (card: Omit<CreditCard, 'id' | 'createdAt'>) => void
}

export function NewCardModal({ isOpen, onClose, onSave }: NewCardModalProps) {
  const [name, setName] = useState('')
  const [bank, setBank] = useState('Banco Safra')
  const [brand, setBrand] = useState<CardBrand>('visa')
  const [lastFourDigits, setLastFourDigits] = useState('')
  const [colorScheme, setColorScheme] = useState<CardColorScheme>('gold')
  const [creditLimit, setCreditLimit] = useState<string>('18000')
  const [closingDay, setClosingDay] = useState<number>(18)
  const [dueDay, setDueDay] = useState<number>(25)
  const [notes, setNotes] = useState('')

  // Estado da busca e autocomplete
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedTierFilter, setSelectedTierFilter] = useState<'all' | 'basic' | 'intermediate' | 'premium'>('all')
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Fechar dropdown de sugestões ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!isOpen) return null

  const handleSelectCardPreset = (preset: CardPresetItem) => {
    setName(preset.name)
    setBank(preset.bank)
    setBrand(preset.brand)
    setColorScheme(preset.colorScheme)
    setCreditLimit(preset.defaultLimit.toString())
    setClosingDay(preset.closingDay)
    setDueDay(preset.dueDay)
    if (preset.notes) {
      setNotes(preset.notes)
    }
    setSearchQuery(preset.name)
    setShowSuggestions(false)
  }

  // Ao digitar no campo de nome / busca inteligente
  const handleNameInput = (val: string) => {
    setName(val)
    setSearchQuery(val)
    setShowSuggestions(true)

    // Detecção rápida por palavras-chave se o usuário estiver digitando
    const lower = val.toLowerCase()
    if (lower.includes('safra')) {
      setBank('Banco Safra')
      if (lower.includes('infinite') || lower.includes('ouro') || lower.includes('gold')) {
        setColorScheme('gold')
        setBrand('visa')
      }
    } else if (lower.includes('sx') || lower.includes('santander')) {
      setBank('Santander')
      if (lower.includes('sx')) {
        setBrand('visa')
        setColorScheme('black')
      }
    } else if (lower.includes('click') || lower.includes('itau') || lower.includes('itaú')) {
      setBank('Itaú Unibanco')
      if (lower.includes('click')) {
        setBrand('mastercard')
        setColorScheme('black')
      }
    } else if (lower.includes('neo') || lower.includes('bradesco')) {
      setBank('Bradesco')
      if (lower.includes('neo')) {
        setBrand('visa')
        setColorScheme('titanium')
      }
    } else if (lower.includes('inter')) {
      setBank('Banco Inter')
      setBrand('mastercard')
      setColorScheme('gold')
    } else if (lower.includes('c6')) {
      setBank('C6 Bank')
      setBrand('mastercard')
      setColorScheme('black')
    } else if (lower.includes('caixa') || lower.includes('sim')) {
      setBank('Caixa Econômica')
      setBrand('visa')
      setColorScheme('blue')
    } else if (lower.includes('ourocard') || lower.includes('bb')) {
      setBank('Banco do Brasil')
      setBrand('visa')
      setColorScheme('gold')
    } else if (lower.includes('digio')) {
      setBank('Digio')
      setBrand('visa')
      setColorScheme('blue')
    } else if (lower.includes('neon')) {
      setBank('Neon')
      setBrand('visa')
      setColorScheme('blue')
    } else if (lower.includes('will')) {
      setBank('Will Bank')
      setBrand('mastercard')
      setColorScheme('gold')
    } else if (lower.includes('mercado') || lower.includes('mp')) {
      setBank('Mercado Pago')
      setBrand('visa')
      setColorScheme('blue')
    } else if (lower.includes('pagbank') || lower.includes('pagseguro')) {
      setBank('PagBank')
      setBrand('visa')
      setColorScheme('emerald')
    } else if (lower.includes('ton')) {
      setBank('Ton')
      setBrand('mastercard')
      setColorScheme('emerald')
    } else if (lower.includes('xp')) {
      setBank('XP Investimentos')
      setBrand('visa')
      setColorScheme('titanium')
    } else if (lower.includes('btg')) {
      setBank('BTG Pactual')
      setBrand('mastercard')
      setColorScheme('blue')
    }
  }

  const numLimit = parseFloat(creditLimit) || 0

  // Resultados da busca com filtro de classe
  const searchResults = searchCardPresets(searchQuery).filter((item) => {
    if (selectedTierFilter === 'all') return true
    return item.tier === selectedTierFilter
  })

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
    { value: 'gold', label: 'Safra Gold / Champagne', bgClass: 'bg-amber-900 border-amber-600' },
    { value: 'emerald', label: 'Emerald / Ton', bgClass: 'bg-emerald-900 border-emerald-600' },
    { value: 'blue', label: 'Royal Blue / Caixa', bgClass: 'bg-blue-900 border-blue-600' },
    { value: 'purple', label: 'Midnight Purple', bgClass: 'bg-purple-900 border-purple-600' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center p-0 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md overflow-hidden">
      <div className="w-full max-w-xl max-h-[92vh] sm:max-h-[88vh] rounded-t-3xl sm:rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col text-zinc-800 dark:text-zinc-200 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 overflow-hidden">
        
        {/* Mobile Drag Indicator Bar */}
        <div className="w-12 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto mt-2.5 sm:hidden shrink-0" />
        
        {/* Header fixo */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">Cadastrar Novo Cartão</h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Busca inteligente com cartões de todas as faixas (básicos, sem anuidade, intermediários e alta renda)
            </p>
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
          
          {/* Live Preview Center */}
          <div className="flex flex-col items-center justify-center py-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-500" /> Acabamento Metálico em Tempo Real
            </span>
            <div className="w-full max-w-[340px]">
              <CreditCardVisual card={previewCard} usedLimit={0} showDetails={false} />
            </div>
          </div>

          {/* BUSCA INTELIGENTE DE CARTÃO */}
          <div ref={searchContainerRef} className="relative space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Buscar Modelo do Cartão (Autocompletar automático)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => handleNameInput(e.target.value)}
                placeholder="Ex: Santander SX, Itaú Click, Caixa Sim, Safra Platinum..."
                className="w-full bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white pl-9 pr-8 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
              {name && (
                <button
                  type="button"
                  onClick={() => {
                    setName('')
                    setSearchQuery('')
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Painel de sugestões e catálogo com filtro de classes */}
            {showSuggestions && (
              <div className="absolute left-0 right-0 z-30 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl p-2.5 max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                
                {/* Filtro por faixa/classe do cartão */}
                <div className="flex items-center gap-1 pb-2 mb-2 border-b border-zinc-100 dark:border-zinc-800 text-[10px]">
                  <span className="text-zinc-400 mr-1 flex items-center gap-1 font-medium">
                    <Layers className="w-3 h-3" /> Faixa:
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedTierFilter('all')}
                    className={`px-2 py-0.5 rounded-md transition-colors ${
                      selectedTierFilter === 'all'
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold'
                        : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTierFilter('basic')}
                    className={`px-2 py-0.5 rounded-md transition-colors ${
                      selectedTierFilter === 'basic'
                        ? 'bg-emerald-500 text-zinc-950 font-bold'
                        : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    Básicos / Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTierFilter('intermediate')}
                    className={`px-2 py-0.5 rounded-md transition-colors ${
                      selectedTierFilter === 'intermediate'
                        ? 'bg-blue-500 text-white font-bold'
                        : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    Platinum
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTierFilter('premium')}
                    className={`px-2 py-0.5 rounded-md transition-colors ${
                      selectedTierFilter === 'premium'
                        ? 'bg-amber-500 text-zinc-950 font-bold'
                        : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    Alta Renda / Black
                  </button>
                </div>

                {/* Lista de resultados encontrados */}
                <div className="space-y-1">
                  {searchResults.length > 0 ? (
                    searchResults.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectCardPreset(item)}
                        className="w-full p-2 rounded-lg text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between gap-2 transition-colors group"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                              {item.name}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-semibold shrink-0 ${
                                item.tier === 'basic'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : item.tier === 'intermediate'
                                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              }`}
                            >
                              {item.tierLabel}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block truncate">
                            {item.bank} • {item.brand.toUpperCase()} • Sugestão de limite: R$ {item.defaultLimit.toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <Check className="w-3.5 h-3.5 text-emerald-500 opacity-0 group-hover:opacity-100 shrink-0" />
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-center text-xs text-zinc-400">
                      Nenhum modelo específico encontrado para "{searchQuery}". Você pode continuar cadastrando normalmente abaixo!
                    </div>
                  )}
                </div>
              </div>
            )}
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
                onChange={(e) => handleNameInput(e.target.value)}
                placeholder="Ex: Santander SX, Safra Infinite, Itaú Click..."
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
                placeholder="Ex: Banco Safra, Santander, Itaú, Bradesco..."
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
              placeholder="Ex: 3000"
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
              placeholder="Ex: Sem anuidade gastando R$ 100/mês, pontos Livelo..."
              className="w-full bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Ações */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
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
