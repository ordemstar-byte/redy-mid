import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { BankAccount, CreditCard, Transaction, AccountType, CardBrand, CardColorScheme, TransactionType, PaymentMethod, TransactionStatus, CategoryGroup } from '../types'

// ============================================================================
// SERVIÇO DE SINCRONIZAÇÃO COMPLETA COM O BANCO DE DADOS SUPABASE
// ============================================================================

// --- CONTAS BANCÁRIAS ---

export async function fetchAccountsFromSupabase(): Promise<BankAccount[]> {
  if (!isSupabaseConfigured) return []

  try {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Erro ao carregar contas do Supabase:', error.message)
      return []
    }

    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      bank: row.bank,
      accountType: (row.account_type as AccountType) || 'checking',
      initialBalance: Number(row.initial_balance) || 0,
      color: row.color || '#C5A059',
      customBgColor: row.custom_bg_color || undefined,
      agency: row.agency || undefined,
      accountNumber: row.account_number || undefined,
      notes: row.notes || undefined,
      createdAt: row.created_at || new Date().toISOString(),
    }))
  } catch (err) {
    console.warn('Exceção ao carregar contas do Supabase:', err)
    return []
  }
}

export async function saveAccountToSupabase(account: BankAccount): Promise<boolean> {
  if (!isSupabaseConfigured) return false

  const payload: Record<string, unknown> = {
    id: account.id,
    name: account.name,
    bank: account.bank,
    account_type: account.accountType,
    initial_balance: account.initialBalance,
    color: account.color,
    agency: account.agency || null,
    account_number: account.accountNumber || null,
    notes: account.notes || null,
    created_at: account.createdAt,
    updated_at: new Date().toISOString(),
  }

  // Tenta salvar com custom_bg_color se fornecido
  if (account.customBgColor) {
    payload.custom_bg_color = account.customBgColor
  }

  try {
    let { error } = await supabase.from('bank_accounts').upsert(payload)

    // Se falhar porque a coluna custom_bg_color ainda não foi criada no banco
    if (error && error.code === '42703' && payload.custom_bg_color) {
      delete payload.custom_bg_color
      const retry = await supabase.from('bank_accounts').upsert(payload)
      error = retry.error
    }

    if (error) {
      console.error('Erro ao salvar conta no Supabase:', error.message)
      return false
    }

    return true
  } catch (err) {
    console.error('Exceção ao salvar conta no Supabase:', err)
    return false
  }
}

export async function updateAccountInSupabase(id: string, updates: Partial<BankAccount>): Promise<boolean> {
  if (!isSupabaseConfigured) return false

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (updates.name !== undefined) payload.name = updates.name
  if (updates.bank !== undefined) payload.bank = updates.bank
  if (updates.accountType !== undefined) payload.account_type = updates.accountType
  if (updates.initialBalance !== undefined) payload.initial_balance = updates.initialBalance
  if (updates.color !== undefined) payload.color = updates.color
  if (updates.agency !== undefined) payload.agency = updates.agency || null
  if (updates.accountNumber !== undefined) payload.account_number = updates.accountNumber || null
  if (updates.notes !== undefined) payload.notes = updates.notes || null
  if (updates.customBgColor !== undefined) payload.custom_bg_color = updates.customBgColor || null

  try {
    let { error } = await supabase.from('bank_accounts').update(payload).eq('id', id)

    if (error && error.code === '42703' && payload.custom_bg_color !== undefined) {
      delete payload.custom_bg_color
      const retry = await supabase.from('bank_accounts').update(payload).eq('id', id)
      error = retry.error
    }

    if (error) {
      console.error('Erro ao atualizar conta no Supabase:', error.message)
      return false
    }

    return true
  } catch (err) {
    console.error('Exceção ao atualizar conta no Supabase:', err)
    return false
  }
}

export async function deleteAccountFromSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false

  try {
    const { error } = await supabase.from('bank_accounts').delete().eq('id', id)
    if (error) {
      console.error('Erro ao deletar conta no Supabase:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.error('Exceção ao deletar conta no Supabase:', err)
    return false
  }
}

// --- CARTÕES DE CRÉDITO ---

export async function fetchCardsFromSupabase(): Promise<CreditCard[]> {
  if (!isSupabaseConfigured) return []

  try {
    const { data, error } = await supabase
      .from('credit_cards')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Erro ao carregar cartões do Supabase:', error.message)
      return []
    }

    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      bank: row.bank,
      brand: (row.brand as CardBrand) || 'visa',
      lastFourDigits: row.last_four_digits || '0000',
      colorScheme: (row.color_scheme as CardColorScheme) || 'black',
      creditLimit: Number(row.credit_limit) || 0,
      closingDay: Number(row.closing_day) || 10,
      dueDay: Number(row.due_day) || 17,
      isVirtual: Boolean(row.is_virtual),
      notes: row.notes || undefined,
      createdAt: row.created_at || new Date().toISOString(),
    }))
  } catch (err) {
    console.warn('Exceção ao carregar cartões do Supabase:', err)
    return []
  }
}

export async function saveCardToSupabase(card: CreditCard): Promise<boolean> {
  if (!isSupabaseConfigured) return false

  const payload = {
    id: card.id,
    name: card.name,
    bank: card.bank,
    brand: card.brand,
    last_four_digits: card.lastFourDigits,
    color_scheme: card.colorScheme,
    credit_limit: card.creditLimit,
    closing_day: card.closingDay,
    due_day: card.dueDay,
    is_virtual: Boolean(card.isVirtual),
    notes: card.notes || null,
    created_at: card.createdAt,
    updated_at: new Date().toISOString(),
  }

  try {
    const { error } = await supabase.from('credit_cards').upsert(payload)
    if (error) {
      console.error('Erro ao salvar cartão no Supabase:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.error('Exceção ao salvar cartão no Supabase:', err)
    return false
  }
}

export async function updateCardInSupabase(id: string, updates: Partial<CreditCard>): Promise<boolean> {
  if (!isSupabaseConfigured) return false

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (updates.name !== undefined) payload.name = updates.name
  if (updates.bank !== undefined) payload.bank = updates.bank
  if (updates.brand !== undefined) payload.brand = updates.brand
  if (updates.lastFourDigits !== undefined) payload.last_four_digits = updates.lastFourDigits
  if (updates.colorScheme !== undefined) payload.color_scheme = updates.colorScheme
  if (updates.creditLimit !== undefined) payload.credit_limit = updates.creditLimit
  if (updates.closingDay !== undefined) payload.closing_day = updates.closingDay
  if (updates.dueDay !== undefined) payload.due_day = updates.dueDay
  if (updates.isVirtual !== undefined) payload.is_virtual = updates.isVirtual
  if (updates.notes !== undefined) payload.notes = updates.notes || null

  try {
    const { error } = await supabase.from('credit_cards').update(payload).eq('id', id)
    if (error) {
      console.error('Erro ao atualizar cartão no Supabase:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.error('Exceção ao atualizar cartão no Supabase:', err)
    return false
  }
}

export async function deleteCardFromSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false

  try {
    const { error } = await supabase.from('credit_cards').delete().eq('id', id)
    if (error) {
      console.error('Erro ao deletar cartão no Supabase:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.error('Exceção ao deletar cartão no Supabase:', err)
    return false
  }
}

// --- TRANSAÇÕES & LANÇAMENTOS ---

export async function fetchTransactionsFromSupabase(): Promise<Transaction[]> {
  if (!isSupabaseConfigured) return []

  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Erro ao carregar transações do Supabase:', error.message)
      return []
    }

    return (data || []).map((row) => ({
      id: row.id,
      description: row.description,
      cardStatementName: row.card_statement_name || undefined,
      amount: Number(row.amount) || 0,
      type: (row.type as TransactionType) || 'expense',
      paymentMethod: (row.payment_method as PaymentMethod) || 'cash_or_account',
      bankAccountId: row.bank_account_id || undefined,
      creditCardId: row.credit_card_id || undefined,
      installmentsTotal: row.installments_total || 1,
      installmentNumber: row.installment_number || 1,
      parentInstallmentId: row.parent_installment_id || undefined,
      category: row.category,
      categoryGroup: (row.category_group as CategoryGroup) || 'other',
      date: row.date,
      time: row.time || undefined,
      dueDate: row.due_date || row.date,
      status: (row.status as TransactionStatus) || 'paid',
      notes: row.notes || undefined,
      tags: row.tags || undefined,
      createdAt: row.created_at || new Date().toISOString(),
    }))
  } catch (err) {
    console.warn('Exceção ao carregar transações do Supabase:', err)
    return []
  }
}

export async function saveTransactionToSupabase(tx: Transaction): Promise<boolean> {
  if (!isSupabaseConfigured) return false

  const payload: Record<string, unknown> = {
    id: tx.id,
    description: tx.description,
    card_statement_name: tx.cardStatementName || null,
    amount: tx.amount,
    type: tx.type,
    payment_method: tx.paymentMethod,
    bank_account_id: tx.bankAccountId || null,
    credit_card_id: tx.creditCardId || null,
    installments_total: tx.installmentsTotal || 1,
    installment_number: tx.installmentNumber || 1,
    parent_installment_id: tx.parentInstallmentId || null,
    category: tx.category,
    category_group: tx.categoryGroup,
    date: tx.date,
    time: tx.time || '12:00',
    due_date: tx.dueDate,
    status: tx.status,
    notes: tx.notes || null,
    tags: tx.tags || null,
    created_at: tx.createdAt,
    updated_at: new Date().toISOString(),
  }

  try {
    let { error } = await supabase.from('transactions').upsert(payload)

    // Se falhar porque a coluna card_statement_name ainda não foi criada no banco
    if (error && (error.code === 'PGRST204' || error.code === '42703' || error.message?.includes('card_statement_name'))) {
      delete payload.card_statement_name
      const retry = await supabase.from('transactions').upsert(payload)
      error = retry.error
    }

    if (error) {
      console.error('Erro ao salvar transação no Supabase:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.error('Exceção ao salvar transação no Supabase:', err)
    return false
  }
}

export async function saveTransactionsBatchToSupabase(txs: Transaction[]): Promise<boolean> {
  if (!isSupabaseConfigured || txs.length === 0) return false

  const payloads: Record<string, unknown>[] = txs.map((tx) => ({
    id: tx.id,
    description: tx.description,
    card_statement_name: tx.cardStatementName || null,
    amount: tx.amount,
    type: tx.type,
    payment_method: tx.paymentMethod,
    bank_account_id: tx.bankAccountId || null,
    credit_card_id: tx.creditCardId || null,
    installments_total: tx.installmentsTotal || 1,
    installment_number: tx.installmentNumber || 1,
    parent_installment_id: tx.parentInstallmentId || null,
    category: tx.category,
    category_group: tx.categoryGroup,
    date: tx.date,
    time: tx.time || '12:00',
    due_date: tx.dueDate,
    status: tx.status,
    notes: tx.notes || null,
    tags: tx.tags || null,
    created_at: tx.createdAt,
    updated_at: new Date().toISOString(),
  }))

  try {
    let { error } = await supabase.from('transactions').upsert(payloads)

    // Se falhar por conta da coluna card_statement_name inexistente no schema do banco
    if (error && (error.code === 'PGRST204' || error.code === '42703' || error.message?.includes('card_statement_name'))) {
      const strippedPayloads = payloads.map((p) => {
        const { card_statement_name, ...rest } = p
        return rest
      })
      const retry = await supabase.from('transactions').upsert(strippedPayloads)
      error = retry.error
    }

    if (error) {
      console.error('Erro ao salvar lote de transações no Supabase:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.error('Exceção ao salvar lote de transações no Supabase:', err)
    return false
  }
}

export async function updateTransactionInSupabase(id: string, updates: Partial<Transaction>): Promise<boolean> {
  if (!isSupabaseConfigured) return false

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (updates.description !== undefined) payload.description = updates.description
  if (updates.cardStatementName !== undefined) payload.card_statement_name = updates.cardStatementName || null
  if (updates.amount !== undefined) payload.amount = updates.amount
  if (updates.type !== undefined) payload.type = updates.type
  if (updates.paymentMethod !== undefined) payload.payment_method = updates.paymentMethod
  if (updates.bankAccountId !== undefined) payload.bank_account_id = updates.bankAccountId || null
  if (updates.creditCardId !== undefined) payload.credit_card_id = updates.creditCardId || null
  if (updates.category !== undefined) payload.category = updates.category
  if (updates.categoryGroup !== undefined) payload.category_group = updates.categoryGroup
  if (updates.date !== undefined) payload.date = updates.date
  if (updates.time !== undefined) payload.time = updates.time || null
  if (updates.dueDate !== undefined) payload.due_date = updates.dueDate
  if (updates.status !== undefined) payload.status = updates.status
  if (updates.notes !== undefined) payload.notes = updates.notes || null
  if (updates.tags !== undefined) payload.tags = updates.tags || null

  try {
    let { error } = await supabase.from('transactions').update(payload).eq('id', id)

    // Se falhar por conta de card_statement_name
    if (error && (error.code === 'PGRST204' || error.code === '42703' || error.message?.includes('card_statement_name'))) {
      delete payload.card_statement_name
      const retry = await supabase.from('transactions').update(payload).eq('id', id)
      error = retry.error
    }

    if (error) {
      console.error('Erro ao atualizar transação no Supabase:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.error('Exceção ao atualizar transação no Supabase:', err)
    return false
  }
}

export async function deleteTransactionFromSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false

  try {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) {
      console.error('Erro ao deletar transação no Supabase:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.error('Exceção ao deletar transação no Supabase:', err)
    return false
  }
}

export async function deleteTransactionsBatchFromSupabase(ids: string[]): Promise<boolean> {
  if (!isSupabaseConfigured || ids.length === 0) return false

  try {
    const { error } = await supabase.from('transactions').delete().in('id', ids)
    if (error) {
      console.error('Erro ao deletar lote de transações no Supabase:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.error('Exceção ao deletar lote de transações no Supabase:', err)
    return false
  }
}

export async function deleteInstallmentSeriesFromSupabase(parentInstallmentId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !parentInstallmentId) return false

  try {
    const { error } = await supabase.from('transactions').delete().eq('parent_installment_id', parentInstallmentId)
    if (error) {
      console.error('Erro ao deletar parcelamento no Supabase:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.error('Exceção ao deletar parcelamento no Supabase:', err)
    return false
  }
}
