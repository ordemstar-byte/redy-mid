import type { BankAccount, AccountType } from '../types'
import { getBankBranding } from '../lib/bankBranding'
import { formatCurrency } from '../lib/utils'
import { Wifi, Landmark } from 'lucide-react'

interface BankAccountVisualProps {
  account: BankAccount & { currentBalance?: number; transactionsCount?: number }
  privacyMode?: boolean
  isSelected?: boolean
  onClick?: () => void
}

const accountTypeLabels: Record<AccountType, string> = {
  checking: 'Conta Corrente',
  investment: 'Investimentos',
  savings: 'Poupança',
  cash: 'Dinheiro em Espécie',
}

export function BankAccountVisual({
  account,
  privacyMode = false,
  isSelected = false,
  onClick,
}: BankAccountVisualProps) {
  const brand = getBankBranding(account.bank)
  const balance = account.currentBalance ?? account.initialBalance

  return (
    <div
      onClick={onClick}
      className={`relative w-full rounded-2xl p-5 text-white transition-all duration-300 cursor-pointer overflow-hidden select-none border shadow-lg ${
        brand.bgClass
      } ${
        isSelected
          ? 'ring-2 ring-emerald-500 shadow-2xl scale-[1.02]'
          : 'hover:scale-[1.01] opacity-95 hover:opacity-100 hover:shadow-xl'
      }`}
    >
      {/* Sombra de reflexo de luz e acabamento metálico */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none" />

      {/* Top Header: Logo do Banco e Ícone Contactless */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          {/* Emblema Oficial do Banco */}
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs tracking-tighter shadow-md shrink-0 ${brand.emblemBg}`}
          >
            {brand.emblemText}
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold opacity-75 block">
              {brand.name}
            </span>
            <h3 className="text-sm font-bold tracking-tight text-white/95 leading-tight truncate max-w-[200px]">
              {account.name}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-white/60 rotate-90" />
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${brand.badgeBg}`}>
            {accountTypeLabels[account.accountType] || 'Conta'}
          </span>
        </div>
      </div>

      {/* Chip Bancário Inteligente */}
      <div className="relative z-10 flex items-center justify-between my-3">
        <div className="w-9 h-6 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 p-[1px] shadow-sm">
          <div className="w-full h-full rounded-[4px] bg-[#c4923e] flex items-center justify-between px-1 border border-amber-300/40 opacity-90">
            <div className="w-1.5 h-2.5 border-r border-amber-900/40" />
            <div className="w-2 h-2 rounded-full border border-amber-900/40" />
            <div className="w-1.5 h-2.5 border-l border-amber-900/40" />
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono-numbers text-white/70 bg-black/30 px-2.5 py-1 rounded-lg border border-white/10">
          <Landmark className="w-3 h-3 text-white/60" />
          <span>
            {account.agency && account.accountNumber
              ? `Ag ${account.agency} • Cc ${account.accountNumber}`
              : `Conta Ativa`}
          </span>
        </div>
      </div>

      {/* Saldo Disponível em Destaque */}
      <div className="relative z-10 pt-2 border-t border-white/10 flex items-end justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-white/60 block font-medium">
            Saldo Disponível
          </span>
          <div className="text-xl sm:text-2xl font-extrabold font-mono-numbers tracking-tight text-white">
            {formatCurrency(balance, privacyMode)}
          </div>
        </div>

        {typeof account.transactionsCount === 'number' && (
          <span className="text-[10px] text-white/60 font-mono-numbers bg-white/10 px-2 py-0.5 rounded-md">
            {account.transactionsCount} mov.
          </span>
        )}
      </div>
    </div>
  )
}
