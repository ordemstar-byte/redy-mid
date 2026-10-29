import type { Category, CreditCard, Transaction, BankAccount } from '../types'

export const DEFAULT_CATEGORIES: Category[] = [
  // Receitas
  { id: 'cat_salario', name: 'Salário & Honorários', icon: 'Briefcase', group: 'revenue', color: '#10B981' },
  { id: 'cat_dividendos', name: 'Dividendos & Rendimentos', icon: 'TrendingUp', group: 'revenue', color: '#059669' },
  { id: 'cat_vendas', name: 'Vendas & Consultoria', icon: 'BadgeDollarSign', group: 'revenue', color: '#34D399' },
  { id: 'cat_outras_rec', name: 'Outras Receitas', icon: 'PlusCircle', group: 'revenue', color: '#6EE7B7' },

  // Essenciais
  { id: 'cat_moradia', name: 'Moradia & Condomínio', icon: 'Home', group: 'essential', color: '#3B82F6' },
  { id: 'cat_mercado', name: 'Supermercado & Feira', icon: 'ShoppingCart', group: 'essential', color: '#60A5FA' },
  { id: 'cat_saude', name: 'Saúde & Farmácia', icon: 'HeartPulse', group: 'essential', color: '#F43F5E' },
  { id: 'cat_utilidades', name: 'Energia, Água & Internet', icon: 'Zap', group: 'essential', color: '#F59E0B' },
  { id: 'cat_transporte', name: 'Transporte & Combustível', icon: 'Car', group: 'essential', color: '#6366F1' },

  // Estilo de Vida
  { id: 'cat_restaurantes', name: 'Restaurantes & Gastronomia', icon: 'UtensilsCrossed', group: 'lifestyle', color: '#EC4899' },
  { id: 'cat_assinaturas', name: 'Assinaturas & Streaming', icon: 'Tv', group: 'lifestyle', color: '#A855F7' },
  { id: 'cat_compras', name: 'Compras & Shopping', icon: 'ShoppingBag', group: 'lifestyle', color: '#8B5CF6' },
  { id: 'cat_viagens', name: 'Viagens & Hospedagem', icon: 'Plane', group: 'lifestyle', color: '#06B6D4' },
  { id: 'cat_lazer', name: 'Lazer & Entretenimento', icon: 'Sparkles', group: 'lifestyle', color: '#D946EF' },

  // Negócios & Tecnologia
  { id: 'cat_tech', name: 'Tecnologia & Equipamentos', icon: 'Laptop', group: 'business', color: '#64748B' },
  { id: 'cat_software', name: 'Softwares, IA & Cloud', icon: 'Cpu', group: 'business', color: '#475569' },

  // Investimentos
  { id: 'cat_investimentos', name: 'Aportes & Reserva de Valor', icon: 'Vault', group: 'investment', color: '#10B981' },
]

// Base de dados limpa (sem dados fictícios/exemplos)
export const INITIAL_ACCOUNTS: BankAccount[] = []

export const INITIAL_CARDS: CreditCard[] = []

export const generateInitialTransactions = (): Transaction[] => {
  return []
}
