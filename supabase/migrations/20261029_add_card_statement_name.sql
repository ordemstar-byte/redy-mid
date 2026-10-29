-- ==============================================================================
-- AEGIS FINANCE - MIGRAÇÃO INCREMENTAL: Nome na Fatura do Cartão
-- ==============================================================================
-- Adiciona a coluna `card_statement_name` para permitir conciliação exata de compras
-- cujo nome no extrato do cartão de crédito é diferente do nome real do estabelecimento.

ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS card_statement_name TEXT;

-- Índice para acelerar buscas por nome na fatura
CREATE INDEX IF NOT EXISTS idx_transactions_card_statement_name 
ON public.transactions(card_statement_name);
