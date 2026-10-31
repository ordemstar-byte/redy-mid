import { useState, useMemo, useRef } from 'react'
import type { Transaction, CashFlowSummary, CashFlowDay, CreditCard, PeriodFilter } from '../types'
import { formatCurrency, formatDateBR, calculateInstallmentEndDate } from '../lib/utils'
import { CashFlowChart } from './CashFlowChart'
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Trash2,
  Edit3,
  CreditCard as CreditCardIcon,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react'

interface CashFlowViewProps {
  summary: CashFlowSummary
  transactions: Transaction[]
  allTransactions?: Transaction[]
  timeline: CashFlowDay[]
  cards: CreditCard[]
  privacyMode: boolean
  period?: PeriodFilter
  setPeriod?: (period: PeriodFilter) => void
  onToggleStatus: (id: string) => void
  onDeleteTransaction: (id: string, deleteSeries?: boolean) => void
  onOpenNewTransaction: () => void
  onManageTransaction?: (tx: Transaction) => void
  onEditTransaction?: (tx: Transaction) => void
  totalTransactionsCount?: number
  onResetPeriodToAll?: () => void
}

export function CashFlowView({
  summary,
  transactions,
  allTransactions,
  timeline,
  cards,
  privacyMode,
  period,
  setPeriod,
  onToggleStatus,
  onDeleteTransaction,
  onOpenNewTransaction,
  onManageTransaction,
  onEditTransaction,
  totalTransactionsCount,
  onResetPeriodToAll,
}: CashFlowViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense' | 'card'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all')

  const periodLabels: Record<PeriodFilter, string> = {
    this_month: 'Mês Atual',
    next_month: 'Próximo Mês',
    last_month: 'Mês Anterior',
    next_30_days: 'Próximos 30 dias',
    next_90_days: 'Próximos 90 dias',
    this_year: 'Ano de 2026',
    all: 'Todo o Histórico',
  }

  const clickTimestamps = useRef<Map<string, number[]>>(new Map())

  const handleTxRowClick = (e: React.MouseEvent, tx: Transaction) => {
    if ((e.target as HTMLElement).closest('button')) return

    const now = Date.now()
    const list = (clickTimestamps.current.get(tx.id) || []).filter((t) => now - t < 1500)
    list.push(now)
    clickTimestamps.current.set(tx.id, list)

    if (list.length >= 3 || e.detail >= 3) {
      clickTimestamps.current.set(tx.id, [])
      if (onManageTransaction) {
        onManageTransaction(tx)
      } else if (onEditTransaction) {
        onEditTransaction(tx)
      }
    }
  }

  // Filtros aplicados
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Busca textual por descrição, nome na fatura ou categoria
      const matchesSearch =
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.cardStatementName && tx.cardStatementName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        tx.category.toLowerCase().includes(searchTerm.toLowerCase())

      // Filtro de Tipo
      const matchesType =
        typeFilter === 'all'
          ? true
          : typeFilter === 'card'
          ? tx.paymentMethod === 'credit_card'
          : tx.type === typeFilter

      // Filtro de Status
      const matchesStatus =
        statusFilter === 'all' ? true : tx.status === statusFilter

      return matchesSearch && matchesType && matchesStatus
    })
  }, [transactions, searchTerm, typeFilter, statusFilter])

  // Totais contabilizados das transações da tabela
  const tableTotals = useMemo(() => {
    let incomeTotal = 0
    let expenseTotal = 0

    filteredTransactions.forEach((tx) => {
      if (tx.type === 'income') {
        incomeTotal += tx.amount
      } else {
        expenseTotal += tx.amount
      }
    })

    const netTotal = incomeTotal - expenseTotal
    return { incomeTotal, expenseTotal, netTotal }
  }, [filteredTransactions])

  // Alerta de Liquidez Crítica
  const hasNegativeBalanceDay = timeline.some((d) => !d.isPastOrToday && d.projectedBalance < 0)

  return (
    <div className="space-y-6">
      
      {/* Alerta de Caixa Negativo Projetado */}
      {hasNegativeBalanceDay && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="flex-1">
            <strong className="font-semibold block text-amber-900 dark:text-amber-300">Atenção ao Fluxo de Liquidez:</strong>
            Há dias nos próximos períodos em que o saldo em caixa projetado ficará negativo se nenhuma nova receita for confirmada antes dos vencimentos.
          </div>
        </div>
      )}

      {/* KPI Cards Grid (Responsive 2x2 on mobile, 4-col on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        
        {/* Card 1: Realizado no Período / Saldo em Caixa */}
        <div className="rounded-2xl p-3.5 sm:p-5 bg-white dark:bg-zinc-900/70 border border-zinc-200/90 dark:border-zinc-800/80 shadow-sm backdrop-blur-sm relative overflow-hidden group hover:border-zinc-300 dark:hover:border-zinc-700/80 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-[11px] sm:text-xs mb-1.5 sm:mb-2">
              <span className="font-medium truncate">
                {period === 'all' ? 'Saldo em Caixa' : 'Realizado no Período'}
              </span>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
            </div>
            <div className={`text-lg sm:text-2xl font-bold tracking-tight font-mono-numbers truncate ${
              summary.realizedBalance >= 0 ? 'text-zinc-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {summary.realizedBalance >= 0 ? '+' : ''}{formatCurrency(summary.realizedBalance, privacyMode)}
            </div>
          </div>
          <div className="mt-2 text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
            <span className="truncate">
              {period === 'all' ? 'Confirmado em contas' : 'Liquidado no período'}
            </span>
          </div>
        </div>

        {/* Card 2: Entradas no Período */}
        <div className="rounded-2xl p-3.5 sm:p-5 bg-white dark:bg-zinc-900/70 border border-zinc-200/90 dark:border-zinc-800/80 shadow-sm backdrop-blur-sm relative overflow-hidden group hover:border-zinc-300 dark:hover:border-zinc-700/80 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-[11px] sm:text-xs mb-1.5 sm:mb-2">
              <span className="font-medium truncate">Entradas</span>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono-numbers truncate">
              +{formatCurrency(summary.totalIncomes, privacyMode)}
            </div>
          </div>
          <div className="mt-2 text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 flex justify-between gap-1 truncate">
            <span>Recebido: <strong className="text-zinc-800 dark:text-zinc-200">+{formatCurrency(summary.periodIncomesRealized, privacyMode)}</strong></span>
            {summary.periodIncomesPending > 0 && (
              <span>Previsto: <strong className="text-zinc-800 dark:text-zinc-200">+{formatCurrency(summary.periodIncomesPending, privacyMode)}</strong></span>
            )}
          </div>
        </div>

        {/* Card 3: Saídas no Período */}
        <div className="rounded-2xl p-3.5 sm:p-5 bg-white dark:bg-zinc-900/70 border border-zinc-200/90 dark:border-zinc-800/80 shadow-sm backdrop-blur-sm relative overflow-hidden group hover:border-zinc-300 dark:hover:border-zinc-700/80 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-[11px] sm:text-xs mb-1.5 sm:mb-2">
              <span className="font-medium truncate">Saídas do Período</span>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <ArrowDownRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-200 font-mono-numbers truncate">
              -{formatCurrency(summary.totalExpenses, privacyMode)}
            </div>
          </div>
          <div className="mt-2 text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 flex justify-between gap-1 truncate">
            <span>Pago: <strong className="text-zinc-800 dark:text-zinc-200">-{formatCurrency(summary.periodExpensesRealized, privacyMode)}</strong></span>
            <span>Pendente: <strong className="text-zinc-800 dark:text-zinc-200">-{formatCurrency(summary.periodExpensesPending, privacyMode)}</strong></span>
          </div>
        </div>

        {/* Card 4: Projeção Final de Saldo / Resultado do Período */}
        <div className="rounded-2xl p-3.5 sm:p-5 bg-white dark:bg-zinc-900/70 border border-zinc-200/90 dark:border-zinc-800/80 shadow-sm backdrop-blur-sm relative overflow-hidden group hover:border-emerald-500/40 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-[11px] sm:text-xs mb-1.5 sm:mb-2">
              <span className="font-medium truncate">
                {period === 'all' ? 'Saldo Projetado' : 'Resultado do Período'}
              </span>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className={`text-lg sm:text-2xl font-bold tracking-tight font-mono-numbers truncate ${
              (period === 'all' ? summary.projectedMonthEndBalance : summary.netPeriodResult) >= 0 ? 'text-zinc-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {(period === 'all' ? summary.projectedMonthEndBalance : summary.netPeriodResult) >= 0 ? '+' : ''}{formatCurrency(period === 'all' ? summary.projectedMonthEndBalance : summary.netPeriodResult, privacyMode)}
            </div>
          </div>
          <div className="mt-2 text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
            <span className="truncate">Líquido do período: <strong className={summary.netPeriodResult >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
              {summary.netPeriodResult >= 0 ? '+' : ''}{formatCurrency(summary.netPeriodResult, privacyMode)}
            </strong></span>
          </div>
        </div>

      </div>

      {/* Gráfico Dinâmico */}
      <CashFlowChart timeline={timeline} privacyMode={privacyMode} />

      {/* Seção de Lançamentos do Fluxo de Caixa */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800/80 p-5 shadow-sm backdrop-blur-sm space-y-4">
        
        {/* Barra de Filtros e Busca */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Busca Textual */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por descrição, estabelecimento ou categoria..."
              className="w-full bg-zinc-50 dark:bg-zinc-900/90 text-xs text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
            />
          </div>

          {/* Segmentos de Filtro */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {/* Tipo */}
            <div className="flex items-center p-0.5 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                  typeFilter === 'all' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setTypeFilter('income')}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                  typeFilter === 'income' ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                Receitas
              </button>
              <button
                onClick={() => setTypeFilter('expense')}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                  typeFilter === 'expense' ? 'bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 font-semibold shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                Despesas
              </button>
              <button
                onClick={() => setTypeFilter('card')}
                className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  typeFilter === 'card' ? 'bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 font-semibold shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <CreditCardIcon className="w-3 h-3" />
                <span>Cartões</span>
              </button>
            </div>

            {/* Status */}
            <div className="flex items-center p-0.5 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                  statusFilter === 'all' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setStatusFilter('paid')}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                  statusFilter === 'paid' ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                Liquidados
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                  statusFilter === 'pending' ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 font-semibold shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                Previstos
              </button>
            </div>

            {/* Seletor de Período Integrado no Fluxo de Caixa */}
            {setPeriod && period && (
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
                className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-xs font-semibold"
              >
                <option value="this_month">Mês Atual</option>
                <option value="next_month">Próximo Mês</option>
                <option value="last_month">Mês Anterior</option>
                <option value="next_30_days">Próximos 30 dias</option>
                <option value="next_90_days">Próximos 90 dias</option>
                <option value="this_year">Ano de 2026</option>
                <option value="all">Todo o Histórico</option>
              </select>
            )}
          </div>

        </div>

        {/* Banner Informativo quando o período não for 'all' e houver lançamentos em outros meses */}
        {period !== 'all' && (allTransactions?.length || totalTransactionsCount || 0) > filteredTransactions.length && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-xs text-purple-900 dark:text-purple-200">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>
                Exibindo lançamentos de <strong>{period ? periodLabels[period] : 'Mês Atual'}</strong> ({filteredTransactions.length} exibidos de {allTransactions?.length || totalTransactionsCount} no histórico total).
              </span>
            </div>
            {(setPeriod || onResetPeriodToAll) && (
              <button
                type="button"
                onClick={() => {
                  if (setPeriod) setPeriod('all')
                  else if (onResetPeriodToAll) onResetPeriodToAll()
                }}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer shadow-xs whitespace-nowrap self-start sm:self-auto"
              >
                Ver Todo o Histórico ({allTransactions?.length || totalTransactionsCount})
              </button>
            )}
          </div>
        )}

        {/* Tabela de Lançamentos (Desktop / Tablet) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-3 px-3 w-12 text-center">Status</th>
                <th className="py-3 px-3">Lançamento / Origem</th>
                <th className="py-3 px-3">Categoria</th>
                <th className="py-3 px-3">Data / Efetivação</th>
                <th className="py-3 px-3 text-right">Valor</th>
                <th className="py-3 px-3 w-12 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400 dark:text-zinc-500">
                    <p className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">
                      Nenhum lançamento com efetivação no período selecionado ({period ? periodLabels[period] : 'Mês Atual'}).
                    </p>
                    {(allTransactions?.length || totalTransactionsCount || 0) > 0 && (
                      <div className="mt-3 max-w-md mx-auto text-xs text-zinc-500 dark:text-zinc-400 space-y-2">
                        <p>
                          Você possui <strong>{allTransactions?.length || totalTransactionsCount} lançamentos</strong> cadastrados em outros períodos do histórico.
                        </p>
                        {(setPeriod || onResetPeriodToAll) && (
                          <button
                            type="button"
                            onClick={() => {
                              if (setPeriod) setPeriod('all')
                              else if (onResetPeriodToAll) onResetPeriodToAll()
                            }}
                            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Exibir Todo o Histórico ({allTransactions?.length || totalTransactionsCount} lançamentos)</span>
                          </button>
                        )}
                      </div>
                    )}
                    <button
                      onClick={onOpenNewTransaction}
                      className="mt-4 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline block mx-auto cursor-pointer"
                    >
                      + Cadastrar novo lançamento agora
                    </button>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isIncome = tx.type === 'income'
                  const isCard = tx.paymentMethod === 'credit_card'
                  const card = isCard ? cards.find((c) => c.id === tx.creditCardId) : null
                  const isPaid = tx.status === 'paid'

                  return (
                    <tr
                      key={tx.id}
                      onClick={(e) => handleTxRowClick(e, tx)}
                      title="Clique 3 vezes para gerenciar / editar este lançamento"
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors group cursor-pointer select-none"
                    >
                      {/* Status Toggle Button */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => onToggleStatus(tx.id)}
                          title={isPaid ? 'Marcado como Liquidado (Clique para marcar como Pendente)' : 'Pendente (Clique para liquidar)'}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                            isPaid
                              ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-amber-600 hover:bg-amber-100'
                          }`}
                        >
                          {isPaid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        </button>
                      </td>

                      {/* Descrição & Método */}
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white transition-colors">
                            {tx.description}
                          </span>
                          {tx.cardStatementName && (
                            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-purple-100/70 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 shadow-2xs">
                              Fatura: {tx.cardStatementName}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                          {isCard ? (
                            <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
                              <CreditCardIcon className="w-3 h-3" />
                              {card ? `${card.name} (•••• ${card.lastFourDigits})` : 'Cartão de Crédito'}
                            </span>
                          ) : tx.paymentMethod === 'pix' ? (
                            <span className="text-teal-600 dark:text-teal-400 font-medium">PIX Instantâneo</span>
                          ) : (
                            <span>Conta Bancária / TED</span>
                          )}
                          {tx.notes && <span className="text-zinc-400">• {tx.notes}</span>}
                        </div>
                      </td>

                      {/* Categoria */}
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/40">
                          {tx.category}
                        </span>
                      </td>

                      {/* Data / Horário / Efetivação */}
                      <td className="py-3 px-3 font-mono-numbers text-[11px] text-zinc-600 dark:text-zinc-400">
                        <div className="flex items-center gap-1.5 font-medium text-zinc-800 dark:text-zinc-200">
                          <span>{formatDateBR(tx.date)}</span>
                          {tx.time && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold border border-zinc-200 dark:border-zinc-700/60">
                              {tx.time}
                            </span>
                          )}
                        </div>
                        {tx.dueDate && tx.dueDate !== tx.date && (
                          <div className="text-[10px] text-zinc-400 mt-0.5">
                            Fatura / Liq: {formatDateBR(tx.dueDate)}
                          </div>
                        )}
                      </td>

                      {/* Valor */}
                      <td className="py-3 px-3 text-right font-mono-numbers font-semibold">
                        <span className={isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-zinc-200'}>
                          {isIncome ? '+' : '-'}{formatCurrency(tx.amount, privacyMode)}
                        </span>
                        {tx.installmentsTotal && tx.installmentsTotal > 1 && (
                          <div className="text-[10px] font-normal text-zinc-400">
                            <span>{tx.installmentNumber}/{tx.installmentsTotal}x</span>
                            <span className="block text-[9px] text-purple-600 dark:text-purple-400 font-medium">
                              até {calculateInstallmentEndDate(tx.dueDate || tx.date, tx.installmentsTotal, tx.installmentNumber || 1).endMonthYearShort}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (onManageTransaction) onManageTransaction(tx)
                              else if (onEditTransaction) onEditTransaction(tx)
                            }}
                            title="Gerenciar / Editar lançamento (ou 3 cliques)"
                            className="p-1 rounded text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (tx.parentInstallmentId && (tx.installmentsTotal || 1) > 1) {
                                if (onManageTransaction) onManageTransaction(tx)
                                else onDeleteTransaction(tx.id)
                              } else {
                                onDeleteTransaction(tx.id)
                              }
                            }}
                            title="Excluir lançamento"
                            className="p-1 rounded text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
            {filteredTransactions.length > 0 && (
              <tfoot className="border-t-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-950/60 font-semibold text-xs">
                <tr>
                  <td colSpan={3} className="py-3.5 px-3 text-zinc-600 dark:text-zinc-400">
                    <span className="font-bold uppercase tracking-wider text-[11px] text-zinc-700 dark:text-zinc-300 mr-2">
                      Total Contabilizado ({filteredTransactions.length}):
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal">
                      Entradas: <strong className="text-emerald-600 dark:text-emerald-400 font-mono-numbers">+{formatCurrency(tableTotals.incomeTotal, privacyMode)}</strong> • 
                      Saídas: <strong className="text-rose-600 dark:text-rose-400 font-mono-numbers">-{formatCurrency(tableTotals.expenseTotal, privacyMode)}</strong>
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right text-zinc-500 dark:text-zinc-400 text-[11px]">
                    Resultado Líquido:
                  </td>
                  <td className={`py-3.5 px-3 text-right font-mono-numbers font-bold text-sm ${
                    tableTotals.netTotal >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {tableTotals.netTotal >= 0 ? '+' : ''}{formatCurrency(tableTotals.netTotal, privacyMode)}
                  </td>
                  <td className="py-3.5 px-3"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Lista de Lançamentos (Mobile: telas < md) */}
        <div className="md:hidden divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 dark:text-zinc-500 px-4">
              <p className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">
                Nenhum lançamento com efetivação no período selecionado ({period ? periodLabels[period] : 'Mês Atual'}).
              </p>
              {(allTransactions?.length || totalTransactionsCount || 0) > 0 && (
                <div className="mt-3 max-w-xs mx-auto text-xs text-zinc-500 dark:text-zinc-400 space-y-2">
                  <p>
                    Você possui <strong>{allTransactions?.length || totalTransactionsCount} lançamentos</strong> em outros meses.
                  </p>
                  {(setPeriod || onResetPeriodToAll) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (setPeriod) setPeriod('all')
                        else if (onResetPeriodToAll) onResetPeriodToAll()
                      }}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Ver Todo o Histórico ({allTransactions?.length || totalTransactionsCount})</span>
                    </button>
                  )}
                </div>
              )}
              <button
                onClick={onOpenNewTransaction}
                className="mt-4 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline block mx-auto py-1 cursor-pointer"
              >
                + Cadastrar lançamento agora
              </button>
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'income'
              const isCard = tx.paymentMethod === 'credit_card'
              const card = isCard ? cards.find((c) => c.id === tx.creditCardId) : null
              const isPaid = tx.status === 'paid'

              return (
                <div
                  key={tx.id}
                  onClick={(e) => handleTxRowClick(e, tx)}
                  title="Clique 3 vezes para gerenciar este lançamento"
                  className="py-3 px-1 flex items-center justify-between gap-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer select-none active:bg-zinc-100 dark:active:bg-zinc-800/60"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => onToggleStatus(tx.id)}
                      title={isPaid ? 'Marcado como Liquidado' : 'Pendente'}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-95 ${
                        isPaid
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500'
                      }`}
                    >
                      {isPaid ? <CheckCircle2 className="w-4 h-4 stroke-[2.5]" /> : <Clock className="w-4 h-4" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                          {tx.description}
                        </span>
                        {tx.cardStatementName && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-100/70 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                            {tx.cardStatementName}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-zinc-500 mt-0.5">
                        <span className="font-semibold text-zinc-600 dark:text-zinc-400">{formatDateBR(tx.date)}</span>
                        <span>•</span>
                        <span className="truncate max-w-[95px]">{tx.category}</span>
                        {isCard && card && (
                          <>
                            <span>•</span>
                            <span className="text-purple-600 dark:text-purple-400 font-medium truncate max-w-[85px]">
                              {card.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 text-right">
                    <div>
                      <div className={`font-mono-numbers font-bold text-xs sm:text-sm ${
                        isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-zinc-100'
                      }`}>
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount, privacyMode)}
                      </div>
                      {tx.installmentsTotal && tx.installmentsTotal > 1 && (
                        <div className="text-[9px] text-zinc-400 font-mono-numbers">
                          <span>{tx.installmentNumber}/{tx.installmentsTotal}x</span>
                          <span className="block text-[8px] text-purple-600 dark:text-purple-400 font-medium">
                            até {calculateInstallmentEndDate(tx.dueDate || tx.date, tx.installmentsTotal, tx.installmentNumber || 1).endMonthYearShort}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (onManageTransaction) onManageTransaction(tx)
                        else if (onEditTransaction) onEditTransaction(tx)
                      }}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-500 active:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors cursor-pointer"
                      title="Editar (ou 3 cliques)"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (tx.parentInstallmentId && (tx.installmentsTotal || 1) > 1) {
                          if (onManageTransaction) onManageTransaction(tx)
                          else onDeleteTransaction(tx.id)
                        } else {
                          onDeleteTransaction(tx.id)
                        }
                      }}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 active:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
          {filteredTransactions.length > 0 && (
            <div className="mt-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between text-xs">
              <div>
                <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 block uppercase tracking-wider">
                  Total Contabilizado ({filteredTransactions.length})
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  Entradas: +{formatCurrency(tableTotals.incomeTotal, privacyMode)} | Saídas: -{formatCurrency(tableTotals.expenseTotal, privacyMode)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-400 block">Resultado:</span>
                <span className={`font-mono-numbers font-bold text-sm ${
                  tableTotals.netTotal >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {tableTotals.netTotal >= 0 ? '+' : ''}{formatCurrency(tableTotals.netTotal, privacyMode)}
                </span>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
