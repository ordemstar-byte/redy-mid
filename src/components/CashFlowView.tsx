import { useState, useMemo } from 'react'
import type { Transaction, CashFlowSummary, CashFlowDay, CreditCard } from '../types'
import { formatCurrency, formatDateBR } from '../lib/utils'
import { CashFlowChart } from './CashFlowChart'
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Trash2,
  CreditCard as CreditCardIcon,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react'

interface CashFlowViewProps {
  summary: CashFlowSummary
  transactions: Transaction[]
  timeline: CashFlowDay[]
  cards: CreditCard[]
  privacyMode: boolean
  onToggleStatus: (id: string) => void
  onDeleteTransaction: (id: string) => void
  onOpenNewTransaction: () => void
}

export function CashFlowView({
  summary,
  transactions,
  timeline,
  cards,
  privacyMode,
  onToggleStatus,
  onDeleteTransaction,
  onOpenNewTransaction,
}: CashFlowViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense' | 'card'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all')

  // Filtros aplicados
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Busca textual
      const matchesSearch =
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Saldo Disponível Hoje */}
        <div className="rounded-2xl p-5 bg-white dark:bg-zinc-900/70 border border-zinc-200/90 dark:border-zinc-800/80 shadow-sm backdrop-blur-sm relative overflow-hidden group hover:border-zinc-300 dark:hover:border-zinc-700/80 transition-all">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs mb-2">
            <span className="font-medium">Saldo em Caixa (Líquido)</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white font-mono-numbers">
            {formatCurrency(summary.realizedBalance, privacyMode)}
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Recursos já liquidados e confirmados</span>
          </div>
        </div>

        {/* Card 2: Entradas no Período */}
        <div className="rounded-2xl p-5 bg-white dark:bg-zinc-900/70 border border-zinc-200/90 dark:border-zinc-800/80 shadow-sm backdrop-blur-sm relative overflow-hidden group hover:border-zinc-300 dark:hover:border-zinc-700/80 transition-all">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs mb-2">
            <span className="font-medium">Entradas do Período</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono-numbers">
            +{formatCurrency(summary.totalIncomes, privacyMode)}
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400 flex justify-between">
            <span>Recebido: <strong className="text-zinc-800 dark:text-zinc-200">{formatCurrency(summary.periodIncomesRealized, privacyMode)}</strong></span>
            <span>A receber: <strong className="text-zinc-500 dark:text-zinc-400">{formatCurrency(summary.periodIncomesPending, privacyMode)}</strong></span>
          </div>
        </div>

        {/* Card 3: Saídas no Período */}
        <div className="rounded-2xl p-5 bg-white dark:bg-zinc-900/70 border border-zinc-200/90 dark:border-zinc-800/80 shadow-sm backdrop-blur-sm relative overflow-hidden group hover:border-zinc-300 dark:hover:border-zinc-700/80 transition-all">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs mb-2">
            <span className="font-medium">Saídas / Despesas</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-200 font-mono-numbers">
            -{formatCurrency(summary.totalExpenses, privacyMode)}
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400 flex justify-between">
            <span>Pago: <strong className="text-zinc-800 dark:text-zinc-200">{formatCurrency(summary.periodExpensesRealized, privacyMode)}</strong></span>
            <span>A pagar: <strong className="text-amber-600 dark:text-amber-400">{formatCurrency(summary.periodExpensesPending, privacyMode)}</strong></span>
          </div>
        </div>

        {/* Card 4: Projeção Final de Saldo */}
        <div className="rounded-2xl p-5 bg-white dark:bg-zinc-900/70 border border-zinc-200/90 dark:border-zinc-800/80 shadow-sm backdrop-blur-sm relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs mb-2">
            <span className="font-medium">Saldo Projetado Final</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-bold tracking-tight font-mono-numbers ${
            summary.projectedMonthEndBalance >= 0 ? 'text-zinc-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {formatCurrency(summary.projectedMonthEndBalance, privacyMode)}
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
            <span>Resultado: <strong className={summary.netPeriodResult >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
              {summary.netPeriodResult >= 0 ? '+' : ''}{formatCurrency(summary.netPeriodResult, privacyMode)}
            </strong></span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono-numbers font-semibold">
              {summary.savingsRatePercentage.toFixed(0)}% poupança
            </span>
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
          </div>

        </div>

        {/* Tabela de Lançamentos */}
        <div className="overflow-x-auto">
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
                    <p className="font-medium">Nenhum lançamento encontrado com os filtros atuais.</p>
                    <button
                      onClick={onOpenNewTransaction}
                      className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
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
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors group"
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
                        <div className="font-semibold text-zinc-900 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white transition-colors">
                          {tx.description}
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
                            {tx.installmentNumber}/{tx.installmentsTotal}x
                          </div>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          title="Excluir lançamento"
                          className="p-1 rounded text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  )
}
