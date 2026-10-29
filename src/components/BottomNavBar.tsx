import type { AppTab } from '../types'
import { Wallet, Landmark, CreditCard, PieChart, Plus } from 'lucide-react'

interface BottomNavBarProps {
  activeTab: AppTab
  setActiveTab: (tab: AppTab) => void
  onOpenNewTransaction: () => void
  pendingTxCount: number
  totalAccountsCount: number
  totalCardsCount: number
}

export function BottomNavBar({
  activeTab,
  setActiveTab,
  onOpenNewTransaction,
  pendingTxCount,
  totalAccountsCount,
  totalCardsCount,
}: BottomNavBarProps) {
  const tabs = [
    {
      id: 'cashflow' as AppTab,
      label: 'Fluxo',
      icon: Wallet,
      badge: pendingTxCount > 0 ? pendingTxCount : null,
      badgeColor: 'bg-emerald-500 text-zinc-950',
    },
    {
      id: 'accounts' as AppTab,
      label: 'Contas',
      icon: Landmark,
      badge: totalAccountsCount > 0 ? totalAccountsCount : null,
      badgeColor: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
    },
    {
      id: 'cards' as AppTab,
      label: 'Cartões',
      icon: CreditCard,
      badge: totalCardsCount > 0 ? totalCardsCount : null,
      badgeColor: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
    },
    {
      id: 'planning' as AppTab,
      label: 'DRE',
      icon: PieChart,
      badge: null,
      badgeColor: '',
    },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)] pb-[max(env(safe-area-inset-bottom,8px),8px)] pt-1.5 transition-colors">
      <div className="max-w-md mx-auto px-3 flex items-center justify-between relative">
        
        {/* Primeiras 2 Tabs */}
        {tabs.slice(0, 2).map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all relative ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {tab.badge !== null && (
                  <span
                    className={`absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-mono-numbers font-extrabold flex items-center justify-center ${tab.badgeColor}`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight leading-none">{tab.label}</span>
            </button>
          )
        })}

        {/* Botão Central de Destaque: Novo Lançamento (+) */}
        <div className="px-2">
          <button
            type="button"
            onClick={onOpenNewTransaction}
            className="w-12 h-12 -mt-4 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-zinc-950 flex items-center justify-center shadow-lg shadow-emerald-500/35 border-2 border-white dark:border-zinc-900 active:scale-95 transition-all"
            title="Novo Lançamento Rápido"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Últimas 2 Tabs */}
        {tabs.slice(2, 4).map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all relative ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {tab.badge !== null && (
                  <span
                    className={`absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-mono-numbers font-extrabold flex items-center justify-center ${tab.badgeColor}`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight leading-none">{tab.label}</span>
            </button>
          )
        })}

      </div>
    </div>
  )
}
