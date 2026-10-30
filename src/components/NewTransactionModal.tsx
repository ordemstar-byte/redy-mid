import { useState, useEffect } from 'react'
import type { CreditCard, BankAccount, Transaction, TransactionType, PaymentMethod, CategoryGroup } from '../types'
import { DEFAULT_CATEGORIES } from '../lib/constants'
import { calculateInvoiceDueDate, formatCurrency } from '../lib/utils'
import { X, CreditCard as CreditCardIcon, Plus, DollarSign, Landmark, Save, Trash2, Sparkles, Calendar } from 'lucide-react'

interface NewTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  cards: CreditCard[]
  accounts: BankAccount[]
  onSave: (data: Omit<Transaction, 'id' | 'createdAt'>, generateInstallments: boolean) => void
  editTransaction?: Transaction | null
  onUpdate?: (id: string, updates: Partial<Transaction>) => void
  onDelete?: (id: string) => void
}

export function NewTransactionModal({
  isOpen,
  onClose,
  cards,
  accounts,
  onSave,
  editTransaction,
  onUpdate,
  onDelete,
}: NewTransactionModalProps) {
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  const [type, setType] = useState<TransactionType>('expense')
  const [description, setDescription] = useState('')
  const [cardStatementName, setCardStatementName] = useState('')
  const [amount, setAmount] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card')
  const [creditCardId, setCreditCardId] = useState<string>(cards[0]?.id || '')
  const [bankAccountId, setBankAccountId] = useState<string>(accounts[0]?.id || '')
  const [category, setCategory] = useState<string>('Supermercado & Feira')
  const [installmentsTotal, setInstallmentsTotal] = useState<number>(1)
  const [generateAllInstallments, setGenerateAllInstallments] = useState(true)
  const [date, setDate] = useState(todayStr)
  const [time, setTime] = useState(defaultTime)
  const [dueDate, setDueDate] = useState<string>(todayStr)
  const [isDueDateManuallyEdited, setIsDueDateManuallyEdited] = useState(false)
  const [status, setStatus] = useState<'paid' | 'pending'>('pending')
  const [notes, setNotes] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Sincroniza formulário com o lançamento a ser editado (ou reseta para novo)
  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type)
      setDescription(editTransaction.description)
      setCardStatementName(editTransaction.cardStatementName || '')
      setAmount(String(editTransaction.amount))
      setPaymentMethod(editTransaction.paymentMethod)
      setCreditCardId(editTransaction.creditCardId || cards[0]?.id || '')
      setBankAccountId(editTransaction.bankAccountId || accounts[0]?.id || '')
      setCategory(editTransaction.category)
      setInstallmentsTotal(editTransaction.installmentsTotal || 1)
      setDate(editTransaction.date)
      setTime(editTransaction.time || defaultTime)
      setDueDate(editTransaction.dueDate || editTransaction.date)
      setIsDueDateManuallyEdited(true)
      setStatus(editTransaction.status)
      setNotes(editTransaction.notes || '')
      setConfirmDelete(false)
    } else {
      setType('expense')
      setDescription('')
      setCardStatementName('')
      setAmount('')
      setPaymentMethod('credit_card')
      const initialCardId = cards[0]?.id || ''
      setCreditCardId(initialCardId)
      setBankAccountId(accounts[0]?.id || '')
      setCategory('Supermercado & Feira')
      setInstallmentsTotal(1)
      setGenerateAllInstallments(true)
      setDate(todayStr)
      setTime(defaultTime)
      setIsDueDateManuallyEdited(false)
      const firstCard = cards.find((c) => c.id === initialCardId) || cards[0]
      if (firstCard) {
        const { dueDate: initialDue } = calculateInvoiceDueDate(todayStr, firstCard.closingDay, firstCard.dueDay)
        setDueDate(initialDue)
      } else {
        setDueDate(todayStr)
      }
      setStatus('pending')
      setNotes('')
      setConfirmDelete(false)
    }
  }, [editTransaction, isOpen, cards, accounts])

  const isEditing = Boolean(editTransaction)
  const isCard = paymentMethod === 'credit_card'
  const selectedCard = isCard ? cards.find((c) => c.id === creditCardId) : null

  // Atualiza data de vencimento automática quando o usuário altera a data da compra ou o cartão
  useEffect(() => {
    if (!isOpen || isEditing || isDueDateManuallyEdited) return

    if (isCard && selectedCard) {
      const { dueDate: autoDue } = calculateInvoiceDueDate(date, selectedCard.closingDay, selectedCard.dueDay)
      setDueDate(autoDue)
    } else {
      setDueDate(date)
    }
  }, [date, creditCardId, isCard, selectedCard, isDueDateManuallyEdited, isOpen, isEditing])

  if (!isOpen) return null

  const numAmount = parseFloat(amount.replace(',', '.')) || 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || numAmount <= 0) return

    const selectedCatObj = DEFAULT_CATEGORIES.find((c) => c.name === category)
    const categoryGroup: CategoryGroup =
      type === 'income' ? 'revenue' : selectedCatObj?.group || 'essential'

    const finalDueDate = dueDate || date

    if (isEditing && editTransaction && onUpdate) {
      onUpdate(editTransaction.id, {
        description: description.trim(),
        cardStatementName: isCard && cardStatementName.trim() ? cardStatementName.trim() : undefined,
        amount: numAmount,
        type,
        paymentMethod,
        creditCardId: isCard ? creditCardId : undefined,
        bankAccountId: !isCard ? bankAccountId : undefined,
        installmentsTotal: isCard && installmentsTotal > 1 ? installmentsTotal : 1,
        category,
        categoryGroup,
        date,
        time: time || undefined,
        dueDate: finalDueDate,
        status,
        notes: notes.trim() || undefined,
      })
    } else {
      onSave(
        {
          description: description.trim(),
          cardStatementName: isCard && cardStatementName.trim() ? cardStatementName.trim() : undefined,
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
          time: time || undefined,
          dueDate: finalDueDate,
          status,
          notes: notes.trim() || undefined,
        },
        generateAllInstallments
      )
    }

    onClose()
  }

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    if (editTransaction && onDelete) {
      onDelete(editTransaction.id)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center p-0 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md overflow-hidden">
      <div className="w-full max-w-lg max-h-[92vh] sm:max-h-[88vh] rounded-t-3xl sm:rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col text-zinc-800 dark:text-zinc-200 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 overflow-hidden">
        
        {/* Mobile Drag Indicator Bar */}
        <div className="w-12 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* Header Fixo */}
        <div className="flex items-center justify-between p-4 sm:p-6 pb-3 sm:pb-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                {isEditing ? 'Editar Lançamento' : 'Novo Lançamento'}
              </h2>
              {isEditing && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800/60">
                  Edição
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {isEditing
                ? 'Atualize os detalhes, valor, vencimento ou status deste lançamento'
                : 'Receitas, despesas em conta bancária ou compras no cartão'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
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
                Descrição do Gasto (com o que gastou)
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Almoço executivo no restaurante, Mercado do mês, Monitor..."
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
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-2">
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

                  {date < todayStr && (
                    <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-[11px] text-purple-900 dark:text-purple-300 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold block text-purple-950 dark:text-purple-200">
                          Contabilidade Retroativa Inteligente:
                        </strong>
                        Como esta compra é de meses anteriores, as parcelas já vencidas até hoje serão contabilizadas automaticamente como <strong>pagas</strong>. Apenas as parcelas a partir da fatura atual comprometerão o limite do cartão!
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Ciclo e Data de Vencimento da Fatura do Cartão */}
              <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-500" />
                    Ciclo e Vencimento da Fatura
                  </span>
                  {selectedCard && (
                    <span className="text-[11px] font-mono text-purple-700 dark:text-purple-300">
                      Fecha dia <strong>{selectedCard.closingDay}</strong> • Vence dia <strong>{selectedCard.dueDay}</strong>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                      Data de Vencimento da Fatura
                    </label>
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => {
                        setDueDate(e.target.value)
                        setIsDueDateManuallyEdited(true)
                      }}
                      className="w-full bg-white dark:bg-zinc-900 font-mono-numbers text-xs text-zinc-900 dark:text-zinc-200 px-3 py-2 rounded-xl border border-purple-300 dark:border-purple-800/80 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex flex-col justify-center text-[10px] text-zinc-500 dark:text-zinc-400 pt-1">
                    {isDueDateManuallyEdited ? (
                      <div className="space-y-1">
                        <span className="text-purple-600 dark:text-purple-400 font-medium block">
                          Vencimento personalizado
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsDueDateManuallyEdited(false)
                            if (selectedCard) {
                              const { dueDate: autoDue } = calculateInvoiceDueDate(date, selectedCard.closingDay, selectedCard.dueDay)
                              setDueDate(autoDue)
                            }
                          }}
                          className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                        >
                          ↺ Recalcular pelo ciclo do cartão
                        </button>
                      </div>
                    ) : (
                      <span>
                        Calculado automaticamente com base na data da compra e no ciclo (fecha dia {selectedCard?.closingDay || 10}, vence dia {selectedCard?.dueDay || 17}).
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Nome como aparece na fatura do cartão */}
              <div className="pt-2 border-t border-purple-200/60 dark:border-purple-900/40">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-purple-900 dark:text-purple-300">
                    Nome na Fatura do Cartão (como vem no extrato)
                  </label>
                  <span className="text-[10px] text-zinc-400">
                    Opcional • Conciliação
                  </span>
                </div>
                <input
                  type="text"
                  value={cardStatementName}
                  onChange={(e) => setCardStatementName(e.target.value)}
                  placeholder="Ex: PAG*OUTBACK 04, MP*PADARIA-REAL, IFOOD*PEDIDO..."
                  className="w-full bg-white dark:bg-zinc-900 font-mono text-xs text-zinc-900 dark:text-zinc-200 px-3 py-2 rounded-xl border border-purple-300 dark:border-purple-800/80 focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder:text-zinc-400"
                />
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                  Permite identificar compras quando a cobrança na fatura vem com sigla, razão social ou intermediador diferente do nome do estabelecimento.
                </p>
              </div>
            </div>
          )}

          {/* Categoria, Data e Horário */}
          <div className="space-y-3">
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

            {!isCard ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Data da Operação
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 text-xs font-mono-numbers text-zinc-900 dark:text-zinc-200 px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Data de Vencimento
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => {
                      setDueDate(e.target.value)
                      setIsDueDateManuallyEdited(true)
                    }}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 text-xs font-mono-numbers text-zinc-900 dark:text-zinc-200 px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Horário (HH:mm)
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 text-xs font-mono-numbers text-zinc-900 dark:text-zinc-200 px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Data da Compra
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 text-xs font-mono-numbers text-zinc-900 dark:text-zinc-200 px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Horário (HH:mm)
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 text-xs font-mono-numbers text-zinc-900 dark:text-zinc-200 px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}
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
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div>
              {isEditing && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    confirmDelete
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{confirmDelete ? 'Confirmar Exclusão?' : 'Excluir'}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
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
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Atualizar Lançamento</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Salvar Lançamento</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  )
}
