import { useState, useMemo } from 'react'
import type { Transaction, CashFlowSummary } from '../types'
import { formatCurrency } from '../lib/utils'
import {
  PieChart,
  Calculator,
  Compass,
  Sparkles,
  Minus,
  Plus,
  CalendarCheck,
  ShieldCheck,
} from 'lucide-react'

interface PlanningViewProps {
  transactions: Transaction[]
  summary: CashFlowSummary
  privacyMode: boolean
}

export function PlanningView({
  transactions,
  summary,
  privacyMode,
}: PlanningViewProps) {
  // Simulador de Nova Compra
  const [simAmount, setSimAmount] = useState<number>(3000)
  const [simInstallments, setSimInstallments] = useState<number>(6)

  // Despesas por Grupo
  const groupStats = useMemo(() => {
    const totalExpenses = summary.totalExpenses || 1
    const groups = {
      essential: { name: 'Essenciais (Moradia, Alimentação, Saúde)', amount: 0, target: 50 },
      lifestyle: { name: 'Estilo de Vida (Gastronomia, Lazer, Compras)', amount: 0, target: 30 },
      investment: { name: 'Investimentos & Reserva de Valor', amount: 0, target: 20 },
      business: { name: 'Produtividade & Negócios', amount: 0, target: 0 },
      revenue: { name: 'Receitas', amount: 0, target: 0 },
      other: { name: 'Outros', amount: 0, target: 0 },
    }

    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        if (groups[t.categoryGroup]) {
          groups[t.categoryGroup].amount += t.amount
        }
      })

    return {
      essential: { ...groups.essential, pct: (groups.essential.amount / totalExpenses) * 100 },
      lifestyle: { ...groups.lifestyle, pct: (groups.lifestyle.amount / totalExpenses) * 100 },
      investment: { ...groups.investment, pct: (groups.investment.amount / totalExpenses) * 100 },
      business: { ...groups.business, pct: (groups.business.amount / totalExpenses) * 100 },
    }
  }, [transactions, summary.totalExpenses])

  // Despesas por Categoria (Top 8)
  const categoryStats = useMemo(() => {
    const totalExpenses = summary.totalExpenses || 1
    const map = new Map<string, number>()

    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map.set(t.category, (map.get(t.category) || 0) + t.amount)
      })

    return Array.from(map.entries())
      .map(([cat, amount]) => ({
        category: cat,
        amount,
        percentage: (amount / totalExpenses) * 100,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8)
  }, [transactions, summary.totalExpenses])

  // Cálculo da simulação
  const installmentPerMonth = simInstallments > 0 ? simAmount / simInstallments : simAmount
  const newProjectedExpenses = summary.totalExpenses + installmentPerMonth

  return (
    <div className="space-y-8">
      
      {/* Regra 50/30/20 Financeira */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800/80 p-6 shadow-sm backdrop-blur-sm space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-4 h-4 text-emerald-500" />
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400">
              Arquitetura de Orçamento 50 / 30 / 20
            </span>
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            Distribuição Estratégica do Seu Capital
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Compare como seu fluxo financeiro real está alocado em relação aos benchmarks de alta performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Essenciais */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Gastos Essenciais</span>
              <span className="text-[11px] font-mono-numbers text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">
                Alvo: até 50%
              </span>
            </div>
            <div className="text-xl font-bold font-mono-numbers text-zinc-900 dark:text-white">
              {formatCurrency(groupStats.essential.amount, privacyMode)}
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400 mb-1">
                <span>Participação real:</span>
                <strong className={groupStats.essential.pct > 55 ? 'text-amber-600' : 'text-emerald-600 dark:text-emerald-400'}>
                  {groupStats.essential.pct.toFixed(1)}%
                </strong>
              </div>
              <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${Math.min(100, groupStats.essential.pct)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Estilo de Vida */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Estilo de Vida & Lazer</span>
              <span className="text-[11px] font-mono-numbers text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-500/20">
                Alvo: até 30%
              </span>
            </div>
            <div className="text-xl font-bold font-mono-numbers text-zinc-900 dark:text-white">
              {formatCurrency(groupStats.lifestyle.amount, privacyMode)}
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400 mb-1">
                <span>Participação real:</span>
                <strong className={groupStats.lifestyle.pct > 35 ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'}>
                  {groupStats.lifestyle.pct.toFixed(1)}%
                </strong>
              </div>
              <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${Math.min(100, groupStats.lifestyle.pct)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Investimentos */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Aportes & Futuro</span>
              <span className="text-[11px] font-mono-numbers text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                Alvo: min 20%
              </span>
            </div>
            <div className="text-xl font-bold font-mono-numbers text-zinc-900 dark:text-white">
              {formatCurrency(groupStats.investment.amount, privacyMode)}
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400 mb-1">
                <span>Participação real:</span>
                <strong className={groupStats.investment.pct >= 20 ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'}>
                  {groupStats.investment.pct.toFixed(1)}%
                </strong>
              </div>
              <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${Math.min(100, groupStats.investment.pct)}%` }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Grid: Top Categorias & Simulador */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Categorias de Despesas */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800/80 p-6 shadow-sm backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-900 dark:text-white">
                Concentração por Categoria
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Principais centros de custo do período
              </p>
            </div>
            <PieChart className="w-4 h-4 text-zinc-400" />
          </div>

          <div className="space-y-3 pt-2">
            {categoryStats.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">{item.category}</span>
                  <div className="font-mono-numbers text-zinc-900 dark:text-zinc-200">
                    <span>{formatCurrency(item.amount, privacyMode)}</span>
                    <span className="text-zinc-400 text-[11px] ml-2 font-normal">
                      ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-zinc-500 rounded-full"
                    style={{ width: `${Math.max(2, item.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Simulador de Compra Parcelada & Impacto Financeiro */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800/80 p-5 sm:p-6 shadow-sm backdrop-blur-sm space-y-6">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Calculator className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  Simulador de Impacto Financeiro
                  <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30">
                    Auditoria
                  </span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Simule o reflexo das parcelas nas suas faturas futuras antes de efetuar a compra.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            
            {/* Input Valor da Compra */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Valor Total Previsto da Compra
                </label>
                <span className="text-zinc-400 font-mono-numbers text-[11px]">
                  {formatCurrency(simAmount, privacyMode)}
                </span>
              </div>

              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono select-none">
                  R$
                </span>
                <input
                  type="number"
                  min={1}
                  step={50}
                  value={simAmount || ''}
                  onChange={(e) => setSimAmount(Math.max(0, Number(e.target.value)))}
                  placeholder="0,00"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-mono-numbers font-bold text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Chips de Valores Rápidos */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium mr-1">
                  Atalhos:
                </span>
                {[500, 1200, 3000, 5000, 10000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setSimAmount(val)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-mono-numbers transition-all ${
                      simAmount === val
                        ? 'bg-emerald-500 text-zinc-950 font-bold shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    R$ {val >= 1000 ? `${val / 1000}k` : val}
                  </button>
                ))}
              </div>
            </div>

            {/* Seletor de Parcelas (Stepper + Slider Premium) */}
            <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                    Condição de Pagamento
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    {simInstallments === 1 ? 'À vista (sem parcelamento)' : `Parcelado em ${simInstallments} vezes`}
                  </span>
                </div>

                {/* Stepper (- / +) */}
                <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/90 p-1 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60">
                  <button
                    type="button"
                    onClick={() => setSimInstallments(Math.max(1, simInstallments - 1))}
                    disabled={simInstallments <= 1}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs"
                    title="Diminuir parcela"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span className="w-10 text-center font-mono-numbers font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                    {simInstallments}x
                  </span>

                  <button
                    type="button"
                    onClick={() => setSimInstallments(Math.min(24, simInstallments + 1))}
                    disabled={simInstallments >= 24}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs"
                    title="Aumentar parcela"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Slider com Trilha Estilizada Suave */}
              <div className="relative flex items-center w-full py-1">
                {/* Trilha de preenchimento com gradiente esmeralda */}
                <div className="absolute left-0 right-0 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 pointer-events-none overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-75"
                    style={{
                      width: `${Math.min(100, Math.max(0, ((simInstallments - 1) / 23) * 100))}%`,
                    }}
                  />
                </div>

                <input
                  type="range"
                  min={1}
                  max={24}
                  step={1}
                  value={simInstallments}
                  onChange={(e) => setSimInstallments(Number(e.target.value))}
                  className="fintech-range-slider relative z-10"
                />
              </div>

              {/* Marcadores de Parcelas */}
              <div className="flex justify-between text-[10px] text-zinc-400 dark:text-zinc-500 font-mono-numbers px-0.5">
                <span className={simInstallments === 1 ? 'text-emerald-500 font-bold' : ''}>1x (À vista)</span>
                <span className={simInstallments === 6 ? 'text-emerald-500 font-bold' : ''}>6x</span>
                <span className={simInstallments === 12 ? 'text-emerald-500 font-bold' : ''}>12x</span>
                <span className={simInstallments === 18 ? 'text-emerald-500 font-bold' : ''}>18x</span>
                <span className={simInstallments === 24 ? 'text-emerald-500 font-bold' : ''}>24x</span>
              </div>

              {/* Pills Rápidas de Parcelas Mais Comuns */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[1, 2, 3, 6, 8, 10, 12, 18, 24].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSimInstallments(n)}
                    className={`px-2 py-1 rounded-lg text-xs font-mono-numbers transition-all ${
                      simInstallments === n
                        ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {n === 1 ? '1x à vista' : `${n}x`}
                  </button>
                ))}
              </div>
            </div>

            {/* Painel de Resultado & Diagnóstico de Impacto */}
            <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-zinc-50 via-white to-emerald-50/20 dark:from-zinc-950/90 dark:via-zinc-900/50 dark:to-emerald-950/20 border border-emerald-500/20 dark:border-emerald-500/20 shadow-xs space-y-4">
              
              {/* Destaque da Parcela Mensal */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200/70 dark:border-zinc-800/70">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Parcela Mensal Estimada
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl sm:text-3xl font-extrabold font-mono-numbers text-zinc-900 dark:text-white">
                      {formatCurrency(installmentPerMonth, privacyMode)}
                    </span>
                    <span className="text-xs font-semibold text-zinc-500">
                      / mês ({simInstallments}x)
                    </span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-semibold self-start sm:self-auto">
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>{simInstallments === 1 ? 'Liquidação Imediata' : `${simInstallments} Faturas Consecutivas`}</span>
                </div>
              </div>

              {/* Grid Comparativo */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800/70">
                  <span className="text-zinc-500 dark:text-zinc-400 block text-[11px] mb-0.5">
                    Limite Comprometido
                  </span>
                  <span className="font-mono-numbers font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(simAmount, privacyMode)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800/70">
                  <span className="text-zinc-500 dark:text-zinc-400 block text-[11px] mb-0.5">
                    Nova Despesa Mensal
                  </span>
                  <span className="font-mono-numbers font-bold text-sm text-purple-600 dark:text-purple-400">
                    {formatCurrency(newProjectedExpenses, privacyMode)}
                  </span>
                </div>
              </div>

              {/* Diagnóstico em Prosa Técnica */}
              <div className="p-3 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/80 border border-zinc-200/70 dark:border-zinc-800/70 flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  Esta aquisição comprometerá <strong className="text-zinc-900 dark:text-white font-mono-numbers">{formatCurrency(simAmount, privacyMode)}</strong> de limite e debitará <strong className="text-emerald-600 dark:text-emerald-400 font-mono-numbers">{formatCurrency(installmentPerMonth, privacyMode)}</strong> nos seus vencimentos pelos próximos <strong className="text-zinc-900 dark:text-white">{simInstallments} meses</strong>.
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}
