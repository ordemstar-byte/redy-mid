import { useState, useRef, useEffect } from 'react'
import type { CreditCard, CardBrand, CardColorScheme } from '../types'
import {
  searchCardPresets,
  autoDetectCardPreset,
  type CardPresetItem,
} from '../lib/cardPresets'
import { CreditCardVisual } from './CreditCardVisual'
import { X, Plus, Sparkles, Search, Check, Layers, Trash2, Building2 } from 'lucide-react'

interface NewCardModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (card: Omit<CreditCard, 'id' | 'createdAt'>) => void
  editCard?: CreditCard | null
  onUpdate?: (id: string, updates: Partial<CreditCard>) => void
  onDelete?: (id: string) => void
}

const BANK_FILTERS = [
  { id: 'all', label: 'Todos os Emissores' },
  { id: 'itau', label: 'Itaú' },
  { id: 'bradesco', label: 'Bradesco' },
  { id: 'safra', label: 'Safra' },
  { id: 'picpay', label: 'PicPay' },
  { id: 'santander', label: 'Santander' },
  { id: 'banco do brasil', label: 'Banco do Brasil' },
  { id: 'caixa', label: 'Caixa' },
  { id: 'inter', label: 'Inter' },
  { id: 'c6', label: 'C6 Bank' },
  { id: 'btg', label: 'BTG Pactual' },
  { id: 'brb', label: 'BRB DUX' },
  { id: 'ton', label: 'Ton / Stone' },
  { id: 'sicoob', label: 'Sicoob / Sicredi' },
  { id: 'xp', label: 'XP' },
]

export function NewCardModal({
  isOpen,
  onClose,
  onSave,
  editCard = null,
  onUpdate,
  onDelete,
}: NewCardModalProps) {
  const [name, setName] = useState('')
  const [bank, setBank] = useState('Banco Safra')
  const [brand, setBrand] = useState<CardBrand>('visa')
  const [lastFourDigits, setLastFourDigits] = useState('')
  const [colorScheme, setColorScheme] = useState<CardColorScheme>('gold')
  const [creditLimit, setCreditLimit] = useState<string>('18000')
  const [closingDay, setClosingDay] = useState<number | string>(18)
  const [dueDay, setDueDay] = useState<number | string>(25)
  const [hasCustomizedDates, setHasCustomizedDates] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (editCard) {
      setName(editCard.name)
      setBank(editCard.bank)
      setBrand(editCard.brand)
      setLastFourDigits(editCard.lastFourDigits || '')
      setColorScheme(editCard.colorScheme)
      setCreditLimit(editCard.creditLimit.toString())
      setClosingDay(editCard.closingDay)
      setDueDay(editCard.dueDay)
      setHasCustomizedDates(true)
      setNotes(editCard.notes || '')
      setSearchQuery(editCard.name)
    } else {
      setName('')
      setBank('Banco Safra')
      setBrand('visa')
      setLastFourDigits('')
      setColorScheme('gold')
      setCreditLimit('18000')
      setClosingDay(18)
      setDueDay(25)
      setHasCustomizedDates(false)
      setNotes('')
      setSearchQuery('')
    }
  }, [editCard, isOpen])

  // Estado da busca e autocomplete
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedBankFilter, setSelectedBankFilter] = useState<string>('all')
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
    setHasCustomizedDates(false)
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

    // Se o usuário estiver criando novo cartão e ainda não customizou datas, autodetecta dados sugeridos
    if (!editCard && !hasCustomizedDates && val.trim().length >= 3) {
      const detected = autoDetectCardPreset(val)
      if (detected) {
        setBank(detected.bank)
        setBrand(detected.brand)
        setColorScheme(detected.colorScheme)
        setClosingDay(detected.closingDay)
        setDueDay(detected.dueDay)
        if (!notes && detected.notes) {
          setNotes(detected.notes)
        }
      }
    }
  }

  const numLimit = parseFloat(creditLimit) || 0
  const parsedClosingDay = Math.min(31, Math.max(1, Number(closingDay) || 10))
  const parsedDueDay = Math.min(31, Math.max(1, Number(dueDay) || 17))

  // Resultados da busca com filtro de banco e classe
  const searchResults = searchCardPresets(searchQuery, selectedBankFilter).filter((item) => {
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
    closingDay: parsedClosingDay,
    dueDay: parsedDueDay,
    createdAt: new Date().toISOString(),
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || numLimit <= 0) return

    const payload = {
      name: name.trim(),
      bank: bank.trim(),
      brand,
      lastFourDigits: lastFourDigits.replace(/\D/g, '').slice(-4) || '1234',
      colorScheme,
      creditLimit: numLimit,
      closingDay: parsedClosingDay,
      dueDay: parsedDueDay,
      notes: notes.trim() || undefined,
    }

    if (editCard && onUpdate) {
      onUpdate(editCard.id, payload)
    } else {
      onSave(payload)
    }

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
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
              {editCard ? 'Editar Cartão de Crédito' : 'Cadastrar Novo Cartão'}
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              {editCard ? 'Altere as informações de limite, vencimento e aparência do cartão' : 'Busca inteligente com cartões de todas as faixas (básicos, sem anuidade, intermediários e alta renda)'}
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

          {/* CATÁLOGO RÁPIDO DE CARTÕES BRASILEIROS */}
          <div ref={searchContainerRef} className="space-y-2.5 p-3 sm:p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                Catálogo de Cartões (Toque para Autocompletar)
              </span>
              <span className="text-[10px] text-zinc-400 font-medium">
                Parcerias oficiais (Amazon, etc.)
              </span>
            </div>

            {/* Atalhos Rápidos por Banco (Bradesco, Itaú, Safra, PicPay...) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
              {BANK_FILTERS.map((b) => {
                const isSelected = selectedBankFilter === b.id
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setSelectedBankFilter(b.id)
                      setShowSuggestions(true)
                    }}
                    className={`px-2.5 py-1 rounded-lg shrink-0 transition-all font-medium border flex items-center gap-1 ${
                      isSelected
                        ? 'bg-emerald-500 text-zinc-950 font-bold border-emerald-400 shadow-sm'
                        : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    {b.id === 'all' && <Building2 className="w-3 h-3 opacity-70" />}
                    {b.label}
                  </button>
                )
              })}
            </div>

            {/* Input de Busca no Catálogo */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowSuggestions(true)
                }}
                placeholder="Pesquisar cartão no catálogo (ex: Amazon Prime, Bradesco Platinum, Itaú Click...)"
                className="w-full bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-white pl-9 pr-8 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Painel com os cartões encontrados */}
            {(showSuggestions || searchQuery || selectedBankFilter !== 'all') && (
              <div className="mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 max-h-56 overflow-y-auto space-y-1.5 shadow-md">
                
                {/* Header de filtros */}
                <div className="flex flex-wrap items-center justify-between gap-1 pb-1.5 border-b border-zinc-100 dark:border-zinc-800 text-[10px]">
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-400 mr-1 flex items-center gap-0.5 font-medium">
                      <Layers className="w-3 h-3" /> Categoria:
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedTierFilter('all')}
                      className={`px-1.5 py-0.5 rounded transition-colors ${
                        selectedTierFilter === 'all'
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold'
                          : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      Todas
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTierFilter('basic')}
                      className={`px-1.5 py-0.5 rounded transition-colors ${
                        selectedTierFilter === 'basic'
                          ? 'bg-emerald-500 text-zinc-950 font-bold'
                          : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      Básicos
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTierFilter('intermediate')}
                      className={`px-1.5 py-0.5 rounded transition-colors ${
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
                      className={`px-1.5 py-0.5 rounded transition-colors ${
                        selectedTierFilter === 'premium'
                          ? 'bg-amber-500 text-zinc-950 font-bold'
                          : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      Alta Renda / Black
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowSuggestions(false)}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-[10px] ml-auto font-medium"
                  >
                    Fechar lista
                  </button>
                </div>

                {/* Lista de cartões */}
                <div className="space-y-1">
                  {searchResults.length > 0 ? (
                    searchResults.map((item) => {
                      const isCurrentlySelected = name === item.name && bank === item.bank
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectCardPreset(item)}
                          className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between gap-2 transition-all border ${
                            isCurrentlySelected
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/50 text-emerald-900 dark:text-emerald-200 shadow-xs'
                              : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/80 border-transparent text-zinc-800 dark:text-zinc-200'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold truncate">
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
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block truncate mt-0.5">
                              Emissor: <strong className="text-zinc-700 dark:text-zinc-300 font-semibold">{item.bank}</strong> • Bandeira: <strong className="text-zinc-700 dark:text-zinc-300 font-semibold">{item.brand.toUpperCase()}</strong> • Limite sugerido: R$ {item.defaultLimit.toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <Check className={`w-4 h-4 text-emerald-500 shrink-0 ${isCurrentlySelected ? 'opacity-100' : 'opacity-0'}`} />
                        </button>
                      )
                    })
                  ) : (
                    <div className="p-3 text-center text-xs text-zinc-400">
                      Nenhum modelo específico encontrado para "{searchQuery}". Você pode preencher os dados manualmente nos campos abaixo!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* DADOS DO CARTÃO (CAMPOS DE EDIÇÃO) */}
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
                placeholder="Ex: Amazon Prime, Bradesco Visa Platinum, Safra Infinite..."
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
                placeholder="Ex: Bradesco, Banco Safra, Itaú, PicPay..."
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
                onChange={(e) => {
                  setHasCustomizedDates(true)
                  const v = e.target.value
                  if (v === '') {
                    setClosingDay('')
                  } else {
                    const parsed = parseInt(v, 10)
                    setClosingDay(isNaN(parsed) ? '' : Math.min(31, Math.max(1, parsed)))
                  }
                }}
                className="w-full bg-zinc-50 dark:bg-zinc-950 font-mono-numbers text-xs text-zinc-900 dark:text-white px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-zinc-500 mt-0.5 block">
                Melhor dia para compra: dia {parsedClosingDay === 31 ? 1 : parsedClosingDay + 1}
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
                onChange={(e) => {
                  setHasCustomizedDates(true)
                  const v = e.target.value
                  if (v === '') {
                    setDueDay('')
                  } else {
                    const parsed = parseInt(v, 10)
                    setDueDay(isNaN(parsed) ? '' : Math.min(31, Math.max(1, parsed)))
                  }
                }}
                className="w-full bg-zinc-50 dark:bg-zinc-950 font-mono-numbers text-xs text-zinc-900 dark:text-white px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-zinc-500 mt-0.5 block">
                Prazo: fatura fecha {(parsedDueDay - parsedClosingDay + 30) % 30 || 7} dias antes
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
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            {editCard && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Deseja realmente excluir o cartão ${editCard.name}?`)) {
                    onDelete(editCard.id)
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
                <span>{editCard ? 'Salvar Alterações' : 'Salvar Cartão'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  )
}
