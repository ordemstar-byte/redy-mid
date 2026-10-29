import { useState, useMemo } from 'react'
import type { Transaction, CashFlowSummary } from '../types'
import { formatCurrency } from '../lib/utils'
import {
  PieChart,
  Calculator,
  Compass,
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

        {/* Simulador de Compra Parcelada */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800/80 p-6 shadow-sm backdrop-blur-sm space-y-5">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-900 dark:text-white">
              Simulador de Impacto Financeiro
            </h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Deseja fazer uma nova compra? Simule o impacto das parcelas no seu fluxo de caixa mensal antes de passar o cartão.
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-zinc-600 dark:text-zinc-400 block mb-1">Valor Total da Compra (R$)</label>
              <input
                type="number"
                value={simAmount}
                onChange={(e) => setSimAmount(Number(e.target.value))}
                className="w-full bg-zinc-50 dark:bg-zinc-900 text-sm font-mono-numbers text-zinc-900 dark:text-white px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                <span>Número de Parcelas:</span>
                <strong className="font-mono-numbers text-emerald-600 dark:text-emerald-400">{simInstallments}x</strong>
              </div>
              <input
                type="range"
                min={1}
                max={24}
                value={simInstallments}
                onChange={(e) => setSimInstallments(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 font-mono-numbers mt-1">
                <span>1x (À vista)</span>
                <span>12x</span>
                <span>24x</span>
              </div>
            </div>

            {/* Resultado da Simulação */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500 dark:text-zinc-400">Parcela mensal adicional:</span>
                <strong className="font-mono-numbers text-purple-600 dark:text-purple-400">
                  {formatCurrency(installmentPerMonth, privacyMode)} / mês
                </strong>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-zinc-500 dark:text-zinc-400">Nova despesa média mensal:</span>
                <span className="font-mono-numbers text-zinc-900 dark:text-zinc-200 font-semibold">
                  {formatCurrency(newProjectedExpenses, privacyMode)}
                </span>
              </div>

              <div className="text-[11px] text-zinc-500 pt-2 border-t border-zinc-200 dark:border-zinc-800/80">
                Essa compra comprometerá <strong className="text-zinc-800 dark:text-zinc-300 font-mono-numbers">{formatCurrency(simAmount, privacyMode)}</strong> do seu limite total pelos próximos <strong className="text-zinc-800 dark:text-zinc-300">{simInstallments} meses</strong>.
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}
