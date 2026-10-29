-- ==============================================================================
-- AEGIS FINANCE - ESQUEMA DE BANCO DE DADOS & RLS (SUPABASE)
-- Execute este script no SQL Editor do seu painel Supabase
-- ==============================================================================

-- 1. TABELA DE CONTAS BANCÁRIAS
CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    name TEXT NOT NULL,
    bank TEXT NOT NULL,
    account_type TEXT NOT NULL DEFAULT 'checking' CHECK (account_type IN ('checking', 'investment', 'savings', 'cash')),
    initial_balance NUMERIC(14, 2) NOT NULL DEFAULT 0,
    color TEXT DEFAULT '#EC7000',
    agency TEXT,
    account_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura de contas bancárias" ON public.bank_accounts;
CREATE POLICY "Permitir leitura de contas bancárias"
ON public.bank_accounts FOR SELECT
USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Permitir inserção de contas bancárias" ON public.bank_accounts;
CREATE POLICY "Permitir inserção de contas bancárias"
ON public.bank_accounts FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Permitir atualização de contas bancárias" ON public.bank_accounts;
CREATE POLICY "Permitir atualização de contas bancárias"
ON public.bank_accounts FOR UPDATE
USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Permitir exclusão de contas bancárias" ON public.bank_accounts;
CREATE POLICY "Permitir exclusão de contas bancárias"
ON public.bank_accounts FOR DELETE
USING (auth.uid() = user_id OR auth.uid() IS NULL);


-- 2. TABELA DE CARTÕES DE CRÉDITO
CREATE TABLE IF NOT EXISTS public.credit_cards (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    name TEXT NOT NULL,
    bank TEXT NOT NULL,
    brand TEXT NOT NULL DEFAULT 'visa',
    last_four_digits TEXT NOT NULL,
    color_scheme TEXT NOT NULL DEFAULT 'black',
    credit_limit NUMERIC(14, 2) NOT NULL DEFAULT 0,
    closing_day INTEGER NOT NULL CHECK (closing_day >= 1 AND closing_day <= 31),
    due_day INTEGER NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
    is_virtual BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura de cartões" ON public.credit_cards;
CREATE POLICY "Permitir leitura de cartões"
ON public.credit_cards FOR SELECT
USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Permitir inserção de cartões" ON public.credit_cards;
CREATE POLICY "Permitir inserção de cartões"
ON public.credit_cards FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Permitir atualização de cartões" ON public.credit_cards;
CREATE POLICY "Permitir atualização de cartões"
ON public.credit_cards FOR UPDATE
USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Permitir exclusão de cartões" ON public.credit_cards;
CREATE POLICY "Permitir exclusão de cartões"
ON public.credit_cards FOR DELETE
USING (auth.uid() = user_id OR auth.uid() IS NULL);


-- 3. TABELA DE TRANSAÇÕES E FLUXO DE CAIXA
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    description TEXT NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    payment_method TEXT NOT NULL,
    bank_account_id TEXT REFERENCES public.bank_accounts(id) ON DELETE SET NULL,
    credit_card_id TEXT REFERENCES public.credit_cards(id) ON DELETE SET NULL,
    installments_total INTEGER DEFAULT 1,
    installment_number INTEGER DEFAULT 1,
    parent_installment_id TEXT,
    category TEXT NOT NULL,
    category_group TEXT NOT NULL,
    date DATE NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('paid', 'pending')),
    notes TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura de transações" ON public.transactions;
CREATE POLICY "Permitir leitura de transações"
ON public.transactions FOR SELECT
USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Permitir inserção de transações" ON public.transactions;
CREATE POLICY "Permitir inserção de transações"
ON public.transactions FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Permitir atualização de transações" ON public.transactions;
CREATE POLICY "Permitir atualização de transações"
ON public.transactions FOR UPDATE
USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Permitir exclusão de transações" ON public.transactions;
CREATE POLICY "Permitir exclusão de transações"
ON public.transactions FOR DELETE
USING (auth.uid() = user_id OR auth.uid() IS NULL);


-- 4. ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_transactions_due_date ON public.transactions(due_date);
CREATE INDEX IF NOT EXISTS idx_transactions_bank_account ON public.transactions(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_credit_card ON public.transactions(credit_card_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
