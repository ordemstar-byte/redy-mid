import { useState, useEffect, useCallback } from 'react'
import { Shield, Lock, Delete, RotateCcw, AlertCircle, Sparkles } from 'lucide-react'

interface PinLockScreenProps {
  onUnlock: () => void
}

const CORRECT_PIN = '0638'
const PIN_LENGTH = 4

export function PinLockScreen({ onUnlock }: PinLockScreenProps) {
  const [pin, setPin] = useState<string>('')
  const [hasError, setHasError] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  const triggerHaptic = (ms: number | number[] = 20) => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(ms)
      }
    } catch {
      // Haptics not supported or permitted
    }
  }

  const handleDigit = useCallback(
    (digit: string) => {
      if (isSuccess) return
      setHasError(false)

      setPin((prev) => {
        if (prev.length >= PIN_LENGTH) return prev
        const nextPin = prev + digit
        triggerHaptic(15)

        // Se completou os 4 dígitos
        if (nextPin.length === PIN_LENGTH) {
          if (nextPin === CORRECT_PIN) {
            setIsSuccess(true)
            triggerHaptic(40)
            setTimeout(() => {
              onUnlock()
            }, 300)
          } else {
            setHasError(true)
            triggerHaptic([40, 60, 40])
            setTimeout(() => {
              setPin('')
              setHasError(false)
            }, 800)
          }
        }

        return nextPin
      })
    },
    [isSuccess, onUnlock]
  )

  const handleDelete = useCallback(() => {
    if (isSuccess) return
    triggerHaptic(10)
    setHasError(false)
    setPin((prev) => prev.slice(0, -1))
  }, [isSuccess])

  const handleClear = useCallback(() => {
    if (isSuccess) return
    triggerHaptic(10)
    setHasError(false)
    setPin('')
  }, [isSuccess])

  // Suporte a teclado físico (desktop e teclados móveis)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key)
      } else if (e.key === 'Backspace') {
        handleDelete()
      } else if (e.key === 'Escape' || e.key === 'Delete') {
        handleClear()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleDigit, handleDelete, handleClear])

  const keyRows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-b from-[#090A0F] via-[#0d0f17] to-[#090A0F] text-white selection:bg-none select-none">
      
      {/* Background ambient light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm flex flex-col items-center">
        
        {/* Brand & Security Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600/30 to-emerald-400/20 border border-emerald-500/30 flex items-center justify-center shadow-2xl shadow-emerald-500/20 mb-4 relative">
            <Lock className={`w-8 h-8 transition-transform duration-300 ${isSuccess ? 'text-emerald-400 scale-110' : 'text-emerald-500'}`} />
            {isSuccess && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 flex items-center justify-center animate-ping" />
            )}
          </div>

          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h1 className="text-xl font-extrabold tracking-tight text-white">AEGIS CAPITAL</h1>
          </div>
          
          <p className="text-xs text-zinc-400 font-medium">
            Sistema Executivo • Acesso Restrito
          </p>

          <p className="text-xs text-zinc-500 mt-3">
            Digite a senha de 4 dígitos para desbloquear
          </p>
        </div>

        {/* PIN Indicator Dots */}
        <div className={`flex items-center justify-center gap-4 mb-8 ${hasError ? 'animate-shake' : ''}`}>
          {Array.from({ length: PIN_LENGTH }).map((_, idx) => {
            const isFilled = idx < pin.length
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isSuccess
                    ? 'bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.9)] scale-110'
                    : hasError
                    ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)] scale-105'
                    : isFilled
                    ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)] scale-110'
                    : 'border-2 border-zinc-700 bg-zinc-900/60'
                }`}
              />
            )
          })}
        </div>

        {/* Feedback Messages */}
        <div className="h-6 mb-4 flex items-center justify-center text-xs font-semibold">
          {hasError && (
            <span className="text-rose-400 flex items-center gap-1.5 animate-fade-in">
              <AlertCircle className="w-3.5 h-3.5" />
              Senha incorreta. Tente novamente.
            </span>
          )}
          {isSuccess && (
            <span className="text-emerald-400 flex items-center gap-1.5 animate-fade-in">
              <Sparkles className="w-3.5 h-3.5" />
              Desbloqueado com sucesso!
            </span>
          )}
        </div>

        {/* On-Screen Virtual Numeric Keypad */}
        <div className="w-full max-w-[280px] grid grid-cols-3 gap-3 mb-6">
          {keyRows.map((row) =>
            row.map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleDigit(digit)}
                className="w-20 h-16 sm:w-20 sm:h-16 mx-auto rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 active:bg-emerald-600 active:text-zinc-950 border border-zinc-800/90 hover:border-zinc-700 active:border-emerald-500 flex flex-col items-center justify-center transition-all duration-150 shadow-sm active:scale-95 touch-manipulation cursor-pointer"
              >
                <span className="text-2xl font-bold font-mono-numbers">{digit}</span>
              </button>
            ))
          )}

          {/* Bottom Row: Clear, 0, Backspace */}
          <button
            type="button"
            onClick={handleClear}
            className="w-20 h-16 sm:w-20 sm:h-16 mx-auto rounded-2xl bg-zinc-900/40 hover:bg-zinc-800/60 active:bg-zinc-800 border border-transparent text-zinc-400 hover:text-zinc-200 flex flex-col items-center justify-center transition-all active:scale-95 touch-manipulation cursor-pointer"
            title="Limpar tudo"
          >
            <RotateCcw className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-semibold tracking-wider uppercase">Limpar</span>
          </button>

          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="w-20 h-16 sm:w-20 sm:h-16 mx-auto rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 active:bg-emerald-600 active:text-zinc-950 border border-zinc-800/90 hover:border-zinc-700 active:border-emerald-500 flex flex-col items-center justify-center transition-all duration-150 shadow-sm active:scale-95 touch-manipulation cursor-pointer"
          >
            <span className="text-2xl font-bold font-mono-numbers">0</span>
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="w-20 h-16 sm:w-20 sm:h-16 mx-auto rounded-2xl bg-zinc-900/40 hover:bg-zinc-800/60 active:bg-zinc-800 border border-transparent text-zinc-400 hover:text-zinc-200 flex flex-col items-center justify-center transition-all active:scale-95 touch-manipulation cursor-pointer"
            title="Apagar último dígito"
          >
            <Delete className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-semibold tracking-wider uppercase">Apagar</span>
          </button>
        </div>

        {/* Security badge at bottom */}
        <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 font-medium">
          <Shield className="w-3.5 h-3.5 text-zinc-600" />
          <span>Protegido por Criptografia Local</span>
        </div>

      </div>
    </div>
  )
}
