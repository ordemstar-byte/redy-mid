import { useState, useRef, useEffect } from 'react'
import type { AppTab, PeriodFilter, AppTheme } from '../types'
import {
  Wallet,
  CreditCard as CreditCardIcon,
  Landmark,
  PieChart,
  Eye,
  EyeOff,
  Plus,
  Download,
  Upload,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Sun,
  Moon,
  Smartphone,
  X,
  Sparkles,
  Lock,
} from 'lucide-react'

interface HeaderProps {
  activeTab: AppTab
  setActiveTab: (tab: AppTab) => void
  period: PeriodFilter
  setPeriod: (period: PeriodFilter) => void
  privacyMode: boolean
  togglePrivacyMode: () => void
  theme: AppTheme
  toggleTheme: () => void
  onOpenNewTransaction: () => void
  onOpenNewCard: () => void
  onOpenNewAccount: () => void
  onExportBackup: () => void
  onImportBackup: (jsonStr: string) => void
  onResetData: () => void
  onLockApp?: () => void
  totalCardsCount: number
  totalAccountsCount: number
  pendingTxCount: number
}

export function Header({
  activeTab,
  setActiveTab,
  period,
  setPeriod,
  privacyMode,
  togglePrivacyMode,
  theme,
  toggleTheme,
  onOpenNewTransaction,
  onOpenNewCard,
  onOpenNewAccount,
  onExportBackup,
  onImportBackup,
  onResetData,
  onLockApp,
  totalCardsCount,
  totalAccountsCount,
  pendingTxCount,
}: HeaderProps) {
  const [showDataMenu, setShowDataMenu] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [showInstallGuide, setShowInstallGuide] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt()
        const choice = await deferredPrompt.userChoice
        if (choice && choice.outcome === 'accepted') {
          setIsInstallable(false)
          setDeferredPrompt(null)
        }
      } catch (err) {
        setShowInstallGuide(true)
      }
    } else {
      setShowInstallGuide(true)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        onImportBackup(content)
      }
    }
    reader.readAsText(file)
  }

  const periodOptions: { value: PeriodFilter; label: string }[] = [
    { value: 'this_month', label: 'Mês Atual' },
    { value: 'next_month', label: 'Próximo Mês' },
    { value: 'last_month', label: 'Mês Anterior' },
    { value: 'next_30_days', label: 'Próximos 30 dias' },
    { value: 'next_90_days', label: 'Próximos 90 dias' },
    { value: 'this_year', label: 'Ano de 2026' },
    { value: 'all', label: 'Todo o Histórico' },
  ]

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#090A0F]/95 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800/80 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-3">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-zinc-900 dark:text-white text-sm sm:text-base">AEGIS</span>
                <span className="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase px-1 sm:px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  FINANCE
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 font-normal hidden lg:block">
                Fluxo de Caixa, Contas & Cartões
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop & Tablet: hidden on mobile) */}
          <nav className="hidden md:flex items-center p-1 bg-zinc-100 dark:bg-zinc-900/90 rounded-xl border border-zinc-200 dark:border-zinc-800/80 shadow-inner">
            <button
              onClick={() => setActiveTab('cashflow')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'cashflow'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-700/60'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-500" />
              <span>Fluxo de Caixa</span>
              {pendingTxCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono-numbers bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  {pendingTxCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('accounts')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'accounts'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-700/60'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Landmark className="w-3.5 h-3.5 text-blue-500" />
              <span>Contas</span>
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono-numbers bg-blue-500/20 text-blue-700 dark:text-blue-300">
                {totalAccountsCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('cards')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'cards'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-700/60'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <CreditCardIcon className="w-3.5 h-3.5 text-purple-500" />
              <span>Cartões</span>
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono-numbers bg-purple-500/20 text-purple-700 dark:text-purple-300">
                {totalCardsCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('planning')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'planning'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-700/60'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <PieChart className="w-3.5 h-3.5 text-amber-500" />
              <span>DRE & Metas</span>
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Period Selector (Available on all screens) */}
            <div className="relative">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
                className="appearance-none bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-[11px] sm:text-xs font-medium pl-2 sm:pl-3 pr-6 sm:pr-8 py-1.5 sm:py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-sm max-w-[105px] sm:max-w-none text-ellipsis"
              >
                {periodOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-zinc-400 absolute right-1.5 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Lock App Button */}
            {onLockApp && (
              <button
                onClick={onLockApp}
                title="Bloquear aplicativo com senha PIN"
                className="p-1.5 sm:p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-sm"
              >
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
              </button>
            )}

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'light' ? 'Mudar para Tema Escuro' : 'Mudar para Tema Claro'}
              className="p-1.5 sm:p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all shadow-sm"
            >
              {theme === 'light' ? <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />}
            </button>

            {/* Privacy Mode Toggle */}
            <button
              onClick={togglePrivacyMode}
              title={privacyMode ? 'Modo Discreto Ativo' : 'Ativar Modo Discreto'}
              className={`p-1.5 sm:p-2 rounded-xl border transition-all shadow-sm ${
                privacyMode
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border-zinc-200 dark:border-zinc-800'
              }`}
            >
              {privacyMode ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>

            {/* Install App CTA Button (hidden on mobile, inside menu on mobile) */}
            <button
              onClick={handleInstallClick}
              title="Instalar aplicativo no dispositivo"
              className="hidden lg:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all shadow-sm"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Instalar App</span>
              {isInstallable && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>

            {/* Settings & Data Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDataMenu((prev) => !prev)}
                className="p-1.5 sm:p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-800 transition-all shadow-sm"
                title="Gestão de Dados & Backup"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {showDataMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDataMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl py-1 z-50 text-xs text-zinc-700 dark:text-zinc-300">
                    <button
                      onClick={() => {
                        setShowDataMenu(false)
                        handleInstallClick()
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors text-emerald-600 dark:text-emerald-400 font-medium"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Instalar como Aplicativo (PWA)</span>
                    </button>

                    <div className="border-t border-zinc-200 dark:border-zinc-800 my-1" />

                    <button
                      onClick={() => {
                        onExportBackup()
                        setShowDataMenu(false)
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Exportar Backup (JSON)</span>
                    </button>

                    <button
                      onClick={() => {
                        fileInputRef.current?.click()
                        setShowDataMenu(false)
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Restaurar Backup (JSON)</span>
                    </button>

                    <div className="border-t border-zinc-200 dark:border-zinc-800 my-1" />

                    <button
                      onClick={() => {
                        if (confirm('Atenção: Deseja realmente zerar e apagar todos os lançamentos, contas e cartões cadastrados?')) {
                          onResetData()
                        }
                        setShowDataMenu(false)
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors font-medium"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Zerar Todos os Dados do App</span>
                    </button>
                  </div>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Quick Actions (Desktop only) */}
            <button
              onClick={onOpenNewAccount}
              className="hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm"
            >
              <Landmark className="w-3.5 h-3.5 text-blue-500" />
              <span>+ Conta</span>
            </button>

            <button
              onClick={onOpenNewCard}
              className="hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm"
            >
              <CreditCardIcon className="w-3.5 h-3.5 text-purple-500" />
              <span>+ Cartão</span>
            </button>

            {/* Primary CTA: Add Transaction */}
            <button
              onClick={onOpenNewTransaction}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-zinc-950 bg-emerald-500 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Novo Lançamento</span>
              <span className="sm:hidden">Lançar</span>
            </button>

          </div>
        </div>

        {/* Mobile Navigation Segmented Tabs (Visible on screens < md) */}
        <div className="md:hidden pb-2.5 pt-0.5">
          <nav className="grid grid-cols-4 gap-1 p-1 bg-zinc-100 dark:bg-zinc-900/90 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-inner">
            <button
              onClick={() => setActiveTab('cashflow')}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[10px] font-semibold transition-all relative ${
                activeTab === 'cashflow'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-700/60'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              <Wallet className="w-4 h-4 text-emerald-500 mb-0.5" />
              <span>Fluxo</span>
              {pendingTxCount > 0 && (
                <span className="absolute top-1 right-1 px-1 py-0.1 rounded-full text-[9px] font-mono-numbers bg-emerald-500 text-zinc-950 font-bold">
                  {pendingTxCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('accounts')}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[10px] font-semibold transition-all relative ${
                activeTab === 'accounts'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-700/60'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              <Landmark className="w-4 h-4 text-blue-500 mb-0.5" />
              <span>Contas</span>
              {totalAccountsCount > 0 && (
                <span className="absolute top-1 right-1 px-1 py-0.1 rounded-full text-[9px] font-mono-numbers bg-blue-500 text-white font-bold">
                  {totalAccountsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('cards')}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[10px] font-semibold transition-all relative ${
                activeTab === 'cards'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-700/60'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              <CreditCardIcon className="w-4 h-4 text-purple-500 mb-0.5" />
              <span>Cartões</span>
              {totalCardsCount > 0 && (
                <span className="absolute top-1 right-1 px-1 py-0.1 rounded-full text-[9px] font-mono-numbers bg-purple-500 text-white font-bold">
                  {totalCardsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('planning')}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[10px] font-semibold transition-all ${
                activeTab === 'planning'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-700/60'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              <PieChart className="w-4 h-4 text-amber-500 mb-0.5" />
              <span>DRE</span>
            </button>
          </nav>
        </div>

      </div>

      {/* PWA Install Guidance Modal */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center border border-emerald-500/30">
                  <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-white text-base">Instalar Aegis Finance</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Aplicativo nativo para celular ou computador</p>
                </div>
              </div>
              <button
                onClick={() => setShowInstallGuide(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-zinc-600 dark:text-zinc-300">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60">
                <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white mb-0.5">Vantagens do App Instalado</p>
                  <p className="text-zinc-500 dark:text-zinc-400">Funciona sem barra de endereço do navegador, carrega instantaneamente em tela cheia e opera com segurança máxima.</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <p className="font-bold text-zinc-900 dark:text-white mb-1">📱 No iPhone / iPad (Safari):</p>
                  <ol className="list-decimal list-inside space-y-1 text-zinc-500 dark:text-zinc-400">
                    <li>Toque no botão de <strong>Compartilhar</strong> (ícone com quadrado e seta para cima).</li>
                    <li>Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>.</li>
                    <li>Toque em <strong>Adicionar</strong> no canto superior direito.</li>
                  </ol>
                </div>

                <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <p className="font-bold text-zinc-900 dark:text-white mb-1">💻 No Computador / Android (Chrome ou Edge):</p>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    Clique no ícone de <strong>Instalar</strong> que aparece na barra de endereço (lado direito da URL) ou abra o menu do navegador (três pontos) e clique em <strong>"Instalar Aegis Finance"</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setShowInstallGuide(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors shadow-sm"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
