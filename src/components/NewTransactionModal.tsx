import { useState } from 'react'
import type { CreditCard, BankAccount, Transaction, TransactionType, PaymentMethod, CategoryGroup } from '../types'
import { DEFAULT_CATEGORIES } from '../lib/constants'
import { calculateInvoiceDueDate, formatCurrency } from '../lib/utils'
import { X, CreditCard as CreditCardIcon, Plus, DollarSign, Landmark } from 'lucide-react'

interface NewTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  cards: CreditCard[]
  accounts: BankAccount[]
  onSave: (data: Omit<Transaction, 'id' | 'createdAt'>, generateInstallments: boolean) => void
}

export function NewTransactionModal({
  isOpen,
  onClose,
  cards,
  accounts,
  onSave,
}: NewTransactionModalProps) {
  const todayStr = new Date().toISOString().split('T')[0]

  const [type, setType] = useState<TransactionType>('expense')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card')
  const [creditCardId, setCreditCardId] = useState<string>(cards[0]?.id || '')
  const [bankAccountId, setBankAccountId] = useState<string>(accounts[0]?.id || '')
  const [category, setCategory] = useState<string>('Supermercado & Feira')
  const [installmentsTotal, setInstallmentsTotal] = useState<number>(1)
  const [generateAllInstallments, setGenerateAllInstallments] = useState(true)
  const [date, setDate] = useState(todayStr)
  const [status, setStatus] = useState<'paid' | 'pending'>('pending')
  const [notes, setNotes] = useState('')

  if (!isOpen) return null

  const isCard = paymentMethod === 'credit_card'
  const selectedCard = isCard ? cards.find((c) => c.id === creditCardId) : null

  // Calcula a data de vencimento automática com base no cartão
  let estimatedDueDate = date
  if (isCard && selectedCard) {
    const { dueDate } = calculateInvoiceDueDate(date, selectedCard.closingDay, selectedCard.dueDay)
    estimatedDueDate = dueDate
  }

  const numAmount = parseFloat(amount.replace(',', '.')) || 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || numAmount <= 0) return

    const selectedCatObj = DEFAULT_CATEGORIES.find((c) => c.name === category)
    const categoryGroup: CategoryGroup =
      type === 'income' ? 'revenue' : selectedCatObj?.group || 'essential'

    onSave(
      {
        description: description.trim(),
        amount: numAmount,
        type,
        paymentMethod,
        creditCardId: isCard ? creditCardId : undefined,
        bankAccountId: !isCard ? bankAccountId : undefined,
        installmentsTotal: isCard && installmentsTotal > 1 ? installmentsTotal : 1,
        installmentNumber: 1,
        category,
        categoryGroup,
        date,
        dueDate: estimatedDueDate,
        status,
        notes: notes.trim() || undefined,
      },
      generateAllInstallments
    )

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 text-zinc-800 dark:text-zinc-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">Novo Lançamento Financeiro</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Cadastre receitas, despesas em conta bancária ou compras parceladas no cartão
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          
          {/* Tipo de Operação */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setType('expense')
                if (paymentMethod === 'bank_transfer') setPaymentMethod('credit_card')
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'expense'
                  ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Despesa / Saída
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income')
                setPaymentMethod('bank_transfer')
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'income'
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Receita / Entrada
            </button>
          </div>

          {/* Descrição e Valor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Descrição do Lançamento
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Assinatura OpenAI, Mercado..."
                className="w-full bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Valor Total (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="w-full bg-zinc-50 dark:bg-zinc-950 font-mono-numbers text-xs text-zinc-900 dark:text-white px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Método de Pagamento */}
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Origem / Meio de Pagamento
            </label>
            <div className="grid grid-cols-3 gap-2">
              {type === 'expense' && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`py-2 px-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'credit_card'
                      ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/40'
                      : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                  }`}
                >
                  <CreditCardIcon className="w-3.5 h-3.5" />
                  <span>Cartão</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`py-2 px-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'bank_transfer'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                    : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                }`}
              >
                <Landmark className="w-3.5 h-3.5" />
                <span>Conta Bancária</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={`py-2 px-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'pix'
                    ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/40'
                    : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>PIX</span>
              </button>
            </div>
          </div>

          {/* Selecionar Conta Bancária (Se não for Cartão de Crédito) */}
          {!isCard && accounts.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Vincular a uma Conta Bancária
              </label>
              <select
                value={bankAccountId}
                onChange={(e) => setBankAccountId(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-200 px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.bank})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Configurações de Cartão (Se Cartão selecionado) */}
          {isCard && (
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-purple-200 dark:border-purple-900/30 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Selecionar Cartão de Crédito
                  </label>
                  <select
                    value={creditCardId}
                    onChange={(e) => setCreditCardId(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-200 px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                  >
                    {cards.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (•••• {c.lastFourDigits})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Parcelamento
                  </label>
                  <select
                    value={installmentsTotal}
                    onChange={(e) => setInstallmentsTotal(Number(e.target.value))}
                    className="w-full bg-white dark:bg-zinc-900 font-mono-numbers text-xs text-zinc-900 dark:text-zinc-200 px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value={1}>1x (À vista na fatura)</option>
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24].map((n) => (
                      <option key={n} value={n}>
                        {n}x de {formatCurrency(numAmount > 0 ? numAmount / n : 0)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {installmentsTotal > 1 && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="genInstallments"
                    checked={generateAllInstallments}
                    onChange={(e) => setGenerateAllInstallments(e.target.checked)}
                    className="w-4 h-4 rounded bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="genInstallments" className="text-[11px] text-zinc-700 dark:text-zinc-300 cursor-pointer">
                    Gerar automaticamente todas as {installmentsTotal} parcelas nas faturas seguintes
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Categoria e Datas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-200 px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {DEFAULT_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Data do Registro / Compra
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 text-xs font-mono-numbers text-zinc-900 dark:text-zinc-200 px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Observações / Detalhes (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Nota fiscal 4810, almoço com cliente..."
              className="w-full bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Status Inicial */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs">
            <span className="text-zinc-600 dark:text-zinc-400">Status financeiro:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStatus('pending')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  status === 'pending'
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
              >
                Previsto / Agendado
              </button>
              <button
                type="button"
                onClick={() => setStatus('paid')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  status === 'paid'
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
              >
                Liquidado / Pago
              </button>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Salvar Lançamento</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
