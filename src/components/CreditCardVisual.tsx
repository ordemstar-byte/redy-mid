import { useRef } from 'react'
import type { CreditCard, CardColorScheme } from '../types'
import { formatCurrency } from '../lib/utils'
import { Wifi } from 'lucide-react'

interface CreditCardVisualProps {
  card: CreditCard
  usedLimit?: number
  privacyMode?: boolean
  isSelected?: boolean
  onClick?: () => void
  onTripleClick?: (card: CreditCard) => void
  showDetails?: boolean
}

export function CreditCardVisual({
  card,
  usedLimit = 0,
  privacyMode = false,
  isSelected = false,
  onClick,
  onTripleClick,
  showDetails = true,
}: CreditCardVisualProps) {
  const availableLimit = Math.max(0, card.creditLimit - usedLimit)
  const usagePercentage = Math.min(100, (usedLimit / card.creditLimit) * 100)

  const colorStyles: Record<CardColorScheme, { cardClass: string; badge: string; border: string }> = {
    black: {
      cardClass: 'card-metal-black',
      badge: 'bg-zinc-800 text-zinc-300 border-zinc-700/60',
      border: 'hover:border-zinc-500/50',
    },
    titanium: {
      cardClass: 'card-metal-titanium',
      badge: 'bg-zinc-700 text-zinc-200 border-zinc-600/60',
      border: 'hover:border-zinc-400/50',
    },
    emerald: {
      cardClass: 'card-metal-emerald',
      badge: 'bg-emerald-950 text-emerald-300 border-emerald-700/60',
      border: 'hover:border-emerald-500/50',
    },
    gold: {
      cardClass: 'card-metal-gold',
      badge: 'bg-amber-950 text-amber-300 border-amber-700/60',
      border: 'hover:border-amber-500/50',
    },
    purple: {
      cardClass: 'card-metal-purple',
      badge: 'bg-purple-950 text-purple-300 border-purple-700/60',
      border: 'hover:border-purple-500/50',
    },
    blue: {
      cardClass: 'card-metal-blue',
      badge: 'bg-blue-950 text-blue-300 border-blue-700/60',
      border: 'hover:border-blue-500/50',
    },
  }

  const currentStyle = colorStyles[card.colorScheme] || colorStyles.black

  const clickCountRef = useRef(0)
  const lastClickTimeRef = useRef(0)

  const handleCardClick = (e: React.MouseEvent) => {
    const now = Date.now()
    const diff = now - lastClickTimeRef.current
    if (diff < 500) {
      clickCountRef.current += 1
    } else {
      clickCountRef.current = 1
    }
    lastClickTimeRef.current = now

    if (clickCountRef.current >= 3 || e.detail >= 3) {
      clickCountRef.current = 0
      if (onTripleClick) {
        onTripleClick(card)
        return
      }
    }

    if (onClick) {
      onClick()
    }
  }

  return (
    <div
      onClick={handleCardClick}
      title="Clique para selecionar • 3 cliques para editar ou excluir"
      className={`relative w-full aspect-[1.586/1] max-w-[380px] rounded-2xl p-5 text-white transition-all duration-300 cursor-pointer overflow-hidden select-none ${
        currentStyle.cardClass
      } ${currentStyle.border} ${
        isSelected
          ? 'ring-2 ring-emerald-500/80 scale-[1.02] shadow-2xl'
          : 'hover:scale-[1.01] opacity-90 hover:opacity-100 shadow-lg'
      }`}
    >
      {/* Texture noise & light reflections */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none" />

      {/* Top Header: Bank Name & Brand */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-400 block">
            {card.bank}
          </span>
          <span className="text-sm font-semibold tracking-tight text-white/90">
            {card.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-zinc-400 rotate-90" />
          <span className="text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded border text-zinc-300 bg-black/40 border-white/10">
            {card.brand.toUpperCase()}
          </span>
        </div>
      </div>

      {/* EMV Smart Chip */}
      <div className="relative z-10 flex items-center gap-3 my-2">
        <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 p-[1px] shadow-sm">
          <div className="w-full h-full rounded-[5px] bg-[#d9a84e] flex items-center justify-between px-1 border border-amber-300/40 opacity-90">
            <div className="w-2 h-3 border-r border-amber-800/40" />
            <div className="w-2.5 h-2.5 rounded-full border border-amber-800/40" />
            <div className="w-2 h-3 border-l border-amber-800/40" />
          </div>
        </div>
        <span className="font-mono-numbers text-xs tracking-[0.3em] text-zinc-400">
          •••• •••• •••• {card.lastFourDigits}
        </span>
      </div>

      {/* Footer Info: Closing / Due days & Limit */}
      <div className="relative z-10 mt-auto pt-3">
        {showDetails ? (
          <div>
            <div className="flex justify-between items-end text-xs mb-1.5">
              <span className="text-zinc-400 text-[11px]">
                Disp: <strong className="text-emerald-400 font-semibold">{formatCurrency(availableLimit, privacyMode)}</strong>
              </span>
              <span className="text-zinc-400 text-[11px]">
                Total: <span className="font-mono-numbers text-zinc-200">{formatCurrency(card.creditLimit, privacyMode)}</span>
              </span>
            </div>

            {/* Gauge progress bar */}
            <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  usagePercentage > 85
                    ? 'bg-rose-500'
                    : usagePercentage > 60
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.max(2, usagePercentage)}%` }}
              />
            </div>

            <div className="flex justify-between items-center mt-2 text-[10px] text-zinc-400 font-medium">
              <span>Fecha dia <strong className="text-zinc-200">{card.closingDay}</strong></span>
              <span>Vence dia <strong className="text-zinc-200">{card.dueDay}</strong></span>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center text-xs text-zinc-400">
            <span>•••• {card.lastFourDigits}</span>
            <span>Vence dia {card.dueDay}</span>
          </div>
        )}
      </div>
    </div>
  )
}
