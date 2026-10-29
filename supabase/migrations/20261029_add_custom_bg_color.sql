-- ==============================================================================
-- AEGIS FINANCE - MIGRAÇÃO INCREMENTAL: Cor de Fundo Personalizada de Contas
-- ==============================================================================
-- Adiciona a coluna `custom_bg_color` na tabela `bank_accounts` para suportar
-- personalização estética opcional selecionada pelo usuário.

ALTER TABLE public.bank_accounts 
ADD COLUMN IF NOT EXISTS custom_bg_color TEXT;
