import { useState, useRef } from 'react'
import type { DetailedCard } from '../hooks/useCreditCards'
import type { CardsMetricsSummary, Transaction, CreditCard } from '../types'
import { CreditCardVisual } from './CreditCardVisual'
import { formatCurrency, formatDateBR, formatMonthYearHeader } from '../lib/utils'
import {
  CreditCard as CreditCardIcon,
  Calendar,
  Sparkles,
  Plus,
  CheckCircle,
  AlertCircle,
  Trash2,
  Clock,
  Edit3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface CreditCardsViewProps {
  detailedCards: DetailedCard[]
  summary: CardsMetricsSummary
  activeInstallmentsList: Array<{
    cardName: string
    cardId: string
    description: string
    cardStatementName?: string
    totalInstallments: number
    paidInstallments: number
    remainingInstallments: number
    installmentAmount: number
    remainingAmount: number
    nextDueDate: string
    category: string
  }>
  privacyMode: boolean
  onOpenNewCard: () => void
  onOpenNewTransaction: () => void
  onEditCard?: (card: CreditCard) => void
  onManageCard?: (card: CreditCard) => void
  onPayInvoice: (cardId: string, invoiceTransactions: Transaction[]) => void
  onDeleteCard: (cardId: string) => void
  onDeleteTransaction: (id: string) => void
  onManageTransaction?: (tx: Transaction) => void
  onEditTransaction?: (tx: Transaction) => void
}

export function CreditCardsView({
  detailedCards,
  summary,
  activeInstallmentsList,
  privacyMode,
  onOpenNewCard,
  onOpenNewTransaction,
  onEditCard,
  onManageCard,
  onPayInvoice,
  onDeleteCard,
  onDeleteTransaction,
  onManageTransaction,
  onEditTransaction,
}: CreditCardsViewProps) {
  const [selectedCardId, setSelectedCardId] = useState<string>(() => {
    return detailedCards[0]?.id || ''
  })

  const cardsCarouselRef = useRef<HTMLDivElement>(null)

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (cardsCarouselRef.current) {
      const scrollAmount = direction === 'left' ? -360 : 360
      cardsCarouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

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

  // Garante que haja um cartão selecionado
  const activeCard = detailedCards.find((c) => c.id === selectedCardId) || detailedCards[0]

  // Seleção de fatura do cartão ativo (atual por padrão)
  const [selectedInvoiceMonth, setSelectedInvoiceMonth] = useState<string>('')

  const currentInvoiceMonth = activeCard?.currentInvoice.monthYear
  const activeInvoice = activeCard?.allInvoices.find(
    (inv) => inv.monthYear === (selectedInvoiceMonth || currentInvoiceMonth)
  ) || activeCard?.currentInvoice

  if (detailedCards.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center bg-white dark:bg-zinc-900/40 shadow-sm">
        <CreditCardIcon className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mx-auto mb-4" />
        <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Nenhum cartão cadastrado ainda</h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-6">
          Cadastre seus cartões de crédito para auditar limites, faturas, melhor dia de compra e parcelamentos futuros.
        </p>
        <button
          onClick={onOpenNewCard}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-semibold text-xs inline-flex items-center gap-2 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Cadastrar Primeiro Cartão</span>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      
      {/* Top Consolidator Metrics Bar */}
      {/* Top Consolidator Metrics Bar (Responsive 2x2 on mobile, 4-col on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        
        {/* Total Credit Limit */}
        <div className="rounded-2xl p-3.5 sm:p-5 bg-white dark:bg-zinc-900/70 border border-zinc-200/90 dark:border-zinc-800/80 shadow-sm backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="text-zinc-500 dark:text-zinc-400 text-[11px] sm:text-xs font-medium mb-1 truncate">Limite Total</div>
            <div className="text-lg sm:text-2xl font-bold font-mono-numbers text-zinc-900 dark:text-white truncate">
              {formatCurrency(summary.totalLimit, privacyMode)}
            </div>
          </div>
          <div className="mt-2 text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
            {detailedCards.length} cartões ativos
          </div>
        </div>

        {/* Total Committed */}
        <div className="rounded-2xl p-3.5 sm:p-5 bg-white dark:bg-zinc-900/70 border border-zinc-200/90 dark:border-zinc-800/80 shadow-sm backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="text-zinc-500 dark:text-zinc-400 text-[11px] sm:text-xs font-medium mb-1 truncate">Limite Comprometido</div>
            <div className="text-lg sm:text-2xl font-bold font-mono-numbers text-purple-600 dark:text-purple-400 truncate">
              {formatCurrency(summary.totalUsed, privacyMode)}
            </div>
          </div>
          <div className="mt-2 text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
            <span>Uso:</span>
            <span className="font-mono-numbers font-semibold text-zinc-800 dark:text-zinc-200">
              {summary.usagePercentage.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Total Available */}
        <div className="rounded-2xl p-3.5 sm:p-5 bg-white dark:bg-zinc-900/70 border border-zinc-200/90 dark:border-zinc-800/80 shadow-sm backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="text-zinc-500 dark:text-zinc-400 text-[11px] sm:text-xs font-medium mb-1 truncate">Limite Livre</div>
            <div className="text-lg sm:text-2xl font-bold font-mono-numbers text-emerald-600 dark:text-emerald-400 truncate">
              {formatCurrency(summary.totalAvailable, privacyMode)}
            </div>
          </div>
          <div className="mt-2 text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
            Livre para compras
          </div>
        </div>

        {/* Current Invoices Total */}
        <div className="rounded-2xl p-3.5 sm:p-5 bg-white dark:bg-zinc-900/70 border border-zinc-200/90 dark:border-zinc-800/80 shadow-sm backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="text-zinc-500 dark:text-zinc-400 text-[11px] sm:text-xs font-medium mb-1 truncate">Faturas Deste Mês</div>
            <div className="text-lg sm:text-2xl font-bold font-mono-numbers text-zinc-900 dark:text-zinc-200 truncate">
              {formatCurrency(summary.currentMonthInvoicesTotal, privacyMode)}
            </div>
          </div>
          <div className="mt-2 text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
            <span>Próximo:</span>
            <span className="font-mono-numbers text-zinc-700 dark:text-zinc-300 font-medium truncate">
              {formatCurrency(summary.nextMonthInvoicesTotal, privacyMode)}
            </span>
          </div>
        </div>

      </div>

      {/* Cards Horizontal Carousel Box */}
      <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800/80 p-4 sm:p-6 shadow-sm backdrop-blur-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs uppercase tracking-wider font-bold text-zinc-900 dark:text-white">
                Seus Cartões de Crédito
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold border border-purple-200 dark:border-purple-800/60">
                {detailedCards.length} {detailedCards.length === 1 ? 'cartão' : 'cartões'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Passe para o lado para navegar e selecionar o cartão desejado
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Scroll Navigation Buttons */}
            <div className="flex items-center gap-1.5 mr-1">
              <button
                type="button"
                onClick={() => scrollCarousel('left')}
                className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                title="Rolar para a esquerda"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel('right')}
                className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                title="Rolar para a direita"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onOpenNewCard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Cartão</span>
            </button>
          </div>
        </div>

        {/* The Horizontal Carousel Container */}
        <div
          ref={cardsCarouselRef}
          className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth snap-x snap-mandatory scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {detailedCards.map((card) => {
            const isSelected = activeCard?.id === card.id
            return (
              <div
                key={card.id}
                className="shrink-0 snap-center w-[85vw] max-w-[340px] sm:max-w-[370px] flex flex-col items-center"
              >
                <CreditCardVisual
                  card={card}
                  usedLimit={card.totalCommittedLimit}
                  privacyMode={privacyMode}
                  isSelected={isSelected}
                  onClick={() => {
                    setSelectedCardId(card.id)
                    setSelectedInvoiceMonth('')
                  }}
                  onTripleClick={() => {
                    if (onManageCard) onManageCard(card)
                  }}
                />
                
                {/* Micro badge under card */}
                <div className="w-full max-w-[370px] mt-2 px-1 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1 font-mono-numbers">
                    <Calendar className="w-3 h-3 text-purple-400 dark:text-purple-500" />
                    Fecha dia <strong className="text-zinc-700 dark:text-zinc-300">{card.closingDay}</strong> • Vence dia <strong className="text-zinc-700 dark:text-zinc-300">{card.dueDay}</strong>
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                    card.isClosingSoon
                      ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800/60'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                  }`}>
                    {card.daysUntilClosing === 0
                      ? 'Fecha hoje!'
                      : `Fecha em ${card.daysUntilClosing}d`}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Active Card Invoices Deep Dive */}
      {activeCard && (
        <div className="rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800/80 p-6 shadow-sm backdrop-blur-sm space-y-6">
          
          {/* Card Header & Best Purchase Strategy */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-wider font-semibold text-purple-600 dark:text-purple-400">
                  Auditoria de Fatura
                </span>
                <span className="text-zinc-400 dark:text-zinc-600">•</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{activeCard.bank}</span>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <span>{activeCard.name}</span>
                <span className="font-mono-numbers text-xs text-zinc-500 dark:text-zinc-400 font-normal">
                  (•••• {activeCard.lastFourDigits})
                </span>
              </h3>
            </div>

            {/* Smart Purchase Recommendation Box */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
              <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">Dica de Inteligência Financeira:</span>
                <span className="text-zinc-800 dark:text-zinc-200">
                  Melhor dia para compras neste cartão é todo dia <strong className="text-emerald-600 dark:text-emerald-400">{activeCard.bestPurchaseDay}</strong> (até 40 dias de fôlego).
                </span>
              </div>
            </div>

            {/* Edit & Delete Card Actions */}
            <div className="flex items-center gap-1.5 self-end md:self-auto">
              {onEditCard && (
                <button
                  onClick={() => onEditCard(activeCard)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                  title="Editar este cartão (ou clique 3x no cartão)"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => {
                  if (confirm(`Deseja realmente remover o cartão ${activeCard.name}?`)) {
                    onDeleteCard(activeCard.id)
                  }
                }}
                className="p-2 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                title="Excluir este cartão"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Invoice Month Selector & Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Months Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {activeCard.allInvoices.map((inv) => {
                const isSelected = (activeInvoice?.monthYear || currentInvoiceMonth) === inv.monthYear
                return (
                  <button
                    key={inv.monthYear}
                    onClick={() => setSelectedInvoiceMonth(inv.monthYear)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap border shadow-sm ${
                      isSelected
                        ? 'bg-zinc-900 dark:bg-zinc-800 text-white border-zinc-900 dark:border-zinc-700'
                        : 'bg-zinc-50 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800/80 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <span>{formatMonthYearHeader(inv.monthYear)}</span>
                    <span className="ml-1.5 font-mono-numbers text-[11px] opacity-80">
                      ({formatCurrency(inv.totalAmount, privacyMode)})
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Actions: Pay Invoice & Add Purchase to this card */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenNewTransaction}
                className="px-3.5 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 hover:bg-purple-500/25 transition-all text-xs font-semibold flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Compra no Cartão</span>
              </button>

              {activeInvoice && activeInvoice.transactions.length > 0 && activeInvoice.status !== 'paid' && (
                <button
                  onClick={() => onPayInvoice(activeCard.id, activeInvoice.transactions)}
                  className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25 transition-all text-xs font-semibold flex items-center gap-2 shrink-0"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Pagar Fatura</span>
                </button>
              )}
            </div>

          </div>

          {/* Current Invoice Header Summary */}
          {activeInvoice && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
              <div>
                <span className="text-[11px] text-zinc-500 uppercase tracking-wider block">Valor da Fatura</span>
                <span className="text-xl font-bold font-mono-numbers text-zinc-900 dark:text-white">
                  {formatCurrency(activeInvoice.totalAmount, privacyMode)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-zinc-500 uppercase tracking-wider block">Datas do Ciclo</span>
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Fecha: <strong className="text-zinc-900 dark:text-zinc-100">{formatDateBR(activeInvoice.closingDate)}</strong> • Vence: <strong className="text-zinc-900 dark:text-zinc-100">{formatDateBR(activeInvoice.dueDate)}</strong>
                </span>
              </div>
              <div>
                <span className="text-[11px] text-zinc-500 uppercase tracking-wider block">Status da Fatura</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold mt-0.5 ${
                  activeInvoice.status === 'paid'
                    ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                    : activeInvoice.status === 'closed'
                    ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300'
                    : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
                }`}>
                  {activeInvoice.status === 'paid' ? (
                    <>
                      <CheckCircle className="w-3 h-3" /> Fatura Liquidada / Paga
                    </>
                  ) : activeInvoice.status === 'closed' ? (
                    <>
                      <AlertCircle className="w-3 h-3" /> Fatura Fechada (Aguardando Pagamento)
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3" /> Fatura Aberta (Acumulando Gastos)
                    </>
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Invoice Transactions List */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Lançamentos Desta Fatura ({activeInvoice?.transactions.length || 0})
            </h4>

            {activeInvoice && activeInvoice.transactions.length > 0 ? (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50/50 dark:bg-zinc-950/40">
                {activeInvoice.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    onClick={(e) => handleTxRowClick(e, tx)}
                    title="Clique 3 vezes para gerenciar / editar este lançamento"
                    className="p-3.5 flex items-center justify-between hover:bg-white dark:hover:bg-zinc-900/50 transition-colors group cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shadow-sm">
                        <CreditCardIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white transition-colors">
                            {tx.description}
                          </span>
                          {tx.cardStatementName && (
                            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-purple-100/70 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 shadow-2xs">
                              Na Fatura: {tx.cardStatementName}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-500 flex items-center gap-2 mt-0.5">
                          <span>{tx.category}</span>
                          <span>•</span>
                          <span>Compra: {formatDateBR(tx.date)}{tx.time ? ` às ${tx.time}` : ''}</span>
                          {tx.installmentsTotal && tx.installmentsTotal > 1 && (
                            <span className="px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 font-mono-numbers text-[10px]">
                              Parcela {tx.installmentNumber} de {tx.installmentsTotal}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="text-right">
                        <div className="font-mono-numbers font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(tx.amount, privacyMode)}
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          {tx.status === 'paid' ? 'Pago' : 'Pendente na fatura'}
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
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-zinc-400 dark:text-zinc-500 text-xs border border-zinc-200 dark:border-zinc-800/60 rounded-xl bg-white dark:bg-transparent">
                Nenhuma compra registrada nesta fatura.
              </div>
            )}
          </div>

        </div>
      )}

      {/* Active Installments Consolidated Tracker */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800/80 p-6 shadow-sm backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-900 dark:text-white">
              Radar de Compras Parceladas Ativas
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Acompanhe o comprometimento futuro da sua renda mês a mês
            </p>
          </div>
          <span className="text-xs font-mono-numbers text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
            {activeInstallmentsList.length} parcelamentos ativos
          </span>
        </div>

        {activeInstallmentsList.length === 0 ? (
          <div className="py-8 text-center text-zinc-400 dark:text-zinc-500 text-xs">
            Nenhum parcelamento ativo no momento. Todos os seus cartões estão livres de parcelas futuras!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeInstallmentsList.map((inst, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800/90 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all space-y-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-200">{inst.description}</h4>
                      {inst.cardStatementName && (
                        <span className="text-[10px] font-mono font-medium px-2 py-0.2 rounded bg-purple-100/70 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                          {inst.cardStatementName}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium block mt-0.5">
                      {inst.cardName} • {inst.category}
                    </span>
                  </div>
                  <span className="font-mono-numbers text-xs font-bold text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700/60 shadow-xs">
                    {formatCurrency(inst.installmentAmount, privacyMode)}/mês
                  </span>
                </div>

                {/* Progress of installments */}
                <div>
                  <div className="flex justify-between items-center text-[10px] text-zinc-500 dark:text-zinc-400 mb-1">
                    <span>
                      Progresso: <strong>{inst.paidInstallments}</strong> de <strong>{inst.totalInstallments}</strong> parcelas
                    </span>
                    <span>
                      Faltam: <strong className="text-rose-600 dark:text-rose-400">{formatCurrency(inst.remainingAmount, privacyMode)}</strong>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (inst.paidInstallments / inst.totalInstallments) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-200/80 dark:border-zinc-800/60">
                  <span>Próximo vencimento: {formatDateBR(inst.nextDueDate)}</span>
                  <span>{inst.remainingInstallments} parcelas pendentes</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
