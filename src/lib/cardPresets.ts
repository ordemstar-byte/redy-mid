import type { CardBrand, CardColorScheme } from '../types'

export interface CardPresetItem {
  id: string
  name: string
  bank: string
  brand: CardBrand
  tier: 'basic' | 'intermediate' | 'premium'
  tierLabel: string
  colorScheme: CardColorScheme
  defaultLimit: number
  closingDay: number
  dueDay: number
  keywords: string[]
  notes?: string
}

export const CARD_PRESETS_CATALOG: CardPresetItem[] = [
  // --- BÁSICOS, ENTRADA & SEM ANUIDADE ---
  {
    id: 'santander-sx',
    name: 'Santander SX',
    bank: 'Santander',
    brand: 'visa',
    tier: 'basic',
    tierLabel: 'Básico / Sem Anuidade',
    colorScheme: 'black',
    defaultLimit: 3000,
    closingDay: 10,
    dueDay: 17,
    keywords: ['santander', 'sx', 'visa', 'facil', 'basico', 'vermelho'],
    notes: 'Zero anuidade gastando R$ 100 por mês ou cadastrando chave Pix',
  },
  {
    id: 'itau-click',
    name: 'Itaú Click',
    bank: 'Itaú Unibanco',
    brand: 'mastercard',
    tier: 'basic',
    tierLabel: 'Básico / Sem Anuidade',
    colorScheme: 'black',
    defaultLimit: 4000,
    closingDay: 25,
    dueDay: 3,
    keywords: ['itau', 'click', 'mastercard', 'itaucard', 'basico', 'sem anuidade'],
    notes: 'Anuidade grátis para sempre, limite flexível',
  },
  {
    id: 'bradesco-neo',
    name: 'Bradesco Neo Visa',
    bank: 'Bradesco',
    brand: 'visa',
    tier: 'basic',
    tierLabel: 'Básico / Sem Anuidade',
    colorScheme: 'titanium',
    defaultLimit: 2800,
    closingDay: 14,
    dueDay: 21,
    keywords: ['bradesco', 'neo', 'visa', 'basico', 'facil'],
    notes: 'Zero anuidade gastando R$ 50 no mês no cartão de crédito',
  },
  {
    id: 'inter-gold',
    name: 'Inter Gold Mastercard',
    bank: 'Banco Inter',
    brand: 'mastercard',
    tier: 'basic',
    tierLabel: 'Básico Digital',
    colorScheme: 'gold',
    defaultLimit: 3500,
    closingDay: 15,
    dueDay: 22,
    keywords: ['inter', 'gold', 'laranja', 'banco inter', 'digital'],
    notes: 'Cartão internacional sem anuidade com cashback direto na conta',
  },
  {
    id: 'c6-standard',
    name: 'C6 Bank Standard',
    bank: 'C6 Bank',
    brand: 'mastercard',
    tier: 'basic',
    tierLabel: 'Básico Digital',
    colorScheme: 'black',
    defaultLimit: 3200,
    closingDay: 20,
    dueDay: 27,
    keywords: ['c6', 'c6 bank', 'standard', 'basico', 'taggy'],
    notes: 'Sem anuidade, acumula pontos Átomos que não expiram',
  },
  {
    id: 'bb-ourocard-facil',
    name: 'Ourocard Fácil',
    bank: 'Banco do Brasil',
    brand: 'visa',
    tier: 'basic',
    tierLabel: 'Básico / Sem Anuidade',
    colorScheme: 'gold',
    defaultLimit: 2500,
    closingDay: 18,
    dueDay: 25,
    keywords: ['bb', 'ourocard', 'facil', 'banco do brasil', 'visa'],
    notes: 'Zero anuidade gastando R$ 100 ao mês',
  },
  {
    id: 'caixa-sim',
    name: 'Caixa Sim',
    bank: 'Caixa Econômica',
    brand: 'visa',
    tier: 'basic',
    tierLabel: 'Básico / Econômico',
    colorScheme: 'blue',
    defaultLimit: 2000,
    closingDay: 8,
    dueDay: 15,
    keywords: ['caixa', 'sim', 'cef', 'economica', 'visa'],
    notes: 'Taxas reduzidas, sem cobrança de taxa de manutenção/anuidade',
  },
  {
    id: 'digio-visa',
    name: 'Digio Internacional',
    bank: 'Digio',
    brand: 'visa',
    tier: 'basic',
    tierLabel: 'Básico Digital',
    colorScheme: 'blue',
    defaultLimit: 3000,
    closingDay: 12,
    dueDay: 19,
    keywords: ['digio', 'visa', 'digital', 'elo', 'banco digio'],
    notes: 'Sem anuidade, descontos no DigioClub',
  },
  {
    id: 'neon-visa',
    name: 'Neon Visa Internacional',
    bank: 'Neon',
    brand: 'visa',
    tier: 'basic',
    tierLabel: 'Básico Digital',
    colorScheme: 'blue',
    defaultLimit: 2500,
    closingDay: 16,
    dueDay: 23,
    keywords: ['neon', 'visa', 'azul', 'digital'],
    notes: 'Sem mensalidade e com cashback Turbo',
  },
  {
    id: 'will-bank',
    name: 'Will Bank Mastercard',
    bank: 'Will Bank',
    brand: 'mastercard',
    tier: 'basic',
    tierLabel: 'Básico Digital',
    colorScheme: 'gold',
    defaultLimit: 2200,
    closingDay: 11,
    dueDay: 18,
    keywords: ['will', 'will bank', 'amarelo', 'mastercard'],
    notes: 'Zero anuidade, limite aprovado para autônomos',
  },
  {
    id: 'mercadopago-visa',
    name: 'Mercado Pago Internacional',
    bank: 'Mercado Pago',
    brand: 'visa',
    tier: 'basic',
    tierLabel: 'Básico / Carteira Digital',
    colorScheme: 'blue',
    defaultLimit: 3500,
    closingDay: 5,
    dueDay: 12,
    keywords: ['mercado pago', 'mp', 'mercadolivre', 'visa'],
    notes: 'Zero anuidade, pontos no Mercado Pontos e parcelamento em 18x no ML',
  },
  {
    id: 'pagbank-visa',
    name: 'PagBank Internacional',
    bank: 'PagBank',
    brand: 'visa',
    tier: 'basic',
    tierLabel: 'Básico / Adquirente',
    colorScheme: 'emerald',
    defaultLimit: 3000,
    closingDay: 7,
    dueDay: 14,
    keywords: ['pagbank', 'pagseguro', 'visa', 'uol'],
    notes: 'Sem anuidade e limite garantido pelos investimentos em CDB',
  },
  {
    id: 'ton-card',
    name: 'Ton Cartão de Negócios',
    bank: 'Ton',
    brand: 'mastercard',
    tier: 'basic',
    tierLabel: 'Básico / PJ & Autônomo',
    colorScheme: 'emerald',
    defaultLimit: 4000,
    closingDay: 15,
    dueDay: 22,
    keywords: ['ton', 'stone', 'verde', 'maquininha', 'autonomo'],
    notes: 'Uso do saldo das vendas com limite de compras e saques',
  },

  // --- INTERMEDIÁRIOS & PLATINUM ---
  {
    id: 'safra-platinum',
    name: 'Banco Safra Visa Platinum',
    bank: 'Banco Safra',
    brand: 'visa',
    tier: 'intermediate',
    tierLabel: 'Intermediário / Platinum',
    colorScheme: 'gold',
    defaultLimit: 18000,
    closingDay: 18,
    dueDay: 25,
    keywords: ['safra', 'platinum', 'banco safra', 'visa platinum'],
    notes: 'Pontuação Safra Rewards e seguros de viagem e proteção de preço',
  },
  {
    id: 'itau-uniclass-platinum',
    name: 'Itaú Uniclass Platinum',
    bank: 'Itaú Unibanco',
    brand: 'mastercard',
    tier: 'intermediate',
    tierLabel: 'Intermediário / Platinum',
    colorScheme: 'black',
    defaultLimit: 15000,
    closingDay: 22,
    dueDay: 29,
    keywords: ['itau', 'uniclass', 'platinum', 'itaucard'],
    notes: 'Pontos IUPP, concierge e seguro emergencial',
  },
  {
    id: 'bradesco-exclusive-platinum',
    name: 'Bradesco Exclusive Platinum',
    bank: 'Bradesco',
    brand: 'visa',
    tier: 'intermediate',
    tierLabel: 'Intermediário / Platinum',
    colorScheme: 'titanium',
    defaultLimit: 16000,
    closingDay: 14,
    dueDay: 21,
    keywords: ['bradesco', 'exclusive', 'platinum', 'visa'],
    notes: 'Programa Livelo com acúmulo acelerado',
  },
  {
    id: 'inter-platinum',
    name: 'Inter Platinum Mastercard',
    bank: 'Banco Inter',
    brand: 'mastercard',
    tier: 'intermediate',
    tierLabel: 'Intermediário / Platinum',
    colorScheme: 'titanium',
    defaultLimit: 14000,
    closingDay: 15,
    dueDay: 22,
    keywords: ['inter', 'platinum', 'mastercard', 'investimento'],
    notes: 'Sem anuidade para investimentos a partir de R$ 50 mil',
  },
  {
    id: 'c6-platinum',
    name: 'C6 Bank Platinum',
    bank: 'C6 Bank',
    brand: 'mastercard',
    tier: 'intermediate',
    tierLabel: 'Intermediário / Platinum',
    colorScheme: 'titanium',
    defaultLimit: 15000,
    closingDay: 20,
    dueDay: 27,
    keywords: ['c6', 'platinum', 'mastercard', 'atomos'],
    notes: 'Benefícios Mastercard Platinum com zero anuidade',
  },

  // --- ALTA RENDA, BLACK & INFINITE ---
  {
    id: 'safra-infinite',
    name: 'Safra Visa Infinite',
    bank: 'Banco Safra',
    brand: 'visa',
    tier: 'premium',
    tierLabel: 'Alta Renda / Infinite',
    colorScheme: 'gold',
    defaultLimit: 60000,
    closingDay: 20,
    dueDay: 27,
    keywords: ['safra', 'infinite', 'visa infinite', 'safra first', 'alta renda', 'ouro'],
    notes: 'Acesso a salas VIP LoungeKey, pontuação de até 3.0 por dólar',
  },
  {
    id: 'xp-infinite',
    name: 'XP Visa Infinite',
    bank: 'XP Investimentos',
    brand: 'visa',
    tier: 'premium',
    tierLabel: 'Alta Renda / Infinite',
    colorScheme: 'titanium',
    defaultLimit: 50000,
    closingDay: 18,
    dueDay: 25,
    keywords: ['xp', 'investimentos', 'infinite', 'visa infinite', 'investback'],
    notes: 'Investback de 1% em todas as compras e acesso a salas VIP DragonPass',
  },
  {
    id: 'btg-ultrablue',
    name: 'BTG Pactual Ultrablue Metal',
    bank: 'BTG Pactual',
    brand: 'mastercard',
    tier: 'premium',
    tierLabel: 'Alta Renda / Black Metal',
    colorScheme: 'blue',
    defaultLimit: 75000,
    closingDay: 12,
    dueDay: 19,
    keywords: ['btg', 'ultrablue', 'btg pactual', 'metal', 'black', 'investimento'],
    notes: 'Cartão de metal, salas VIP LoungeKey ilimitadas, cashback ou pontos',
  },
  {
    id: 'itau-personnalite-black',
    name: 'Itaú Personnalité Black',
    bank: 'Itaú Unibanco',
    brand: 'mastercard',
    tier: 'premium',
    tierLabel: 'Alta Renda / Black',
    colorScheme: 'black',
    defaultLimit: 55000,
    closingDay: 28,
    dueDay: 5,
    keywords: ['itau', 'personnalite', 'black', 'mastercard black', 'the one'],
    notes: 'Pontos que não expiram, salas VIP Mastercard Black em GRU e LoungeKey',
  },
  {
    id: 'bradesco-prime-infinite',
    name: 'Bradesco Prime Visa Infinite',
    bank: 'Bradesco',
    brand: 'visa',
    tier: 'premium',
    tierLabel: 'Alta Renda / Infinite',
    colorScheme: 'black',
    defaultLimit: 45000,
    closingDay: 14,
    dueDay: 21,
    keywords: ['bradesco', 'prime', 'infinite', 'nanquim', 'elo nanquim', 'aeternum'],
    notes: 'Salas VIP Bradesco Cartões e parceiros, pontuação Livelo alta',
  },
  {
    id: 'santander-unlimited',
    name: 'Santander Unlimited Black',
    bank: 'Santander',
    brand: 'mastercard',
    tier: 'premium',
    tierLabel: 'Alta Renda / Black',
    colorScheme: 'black',
    defaultLimit: 65000,
    closingDay: 10,
    dueDay: 17,
    keywords: ['santander', 'unlimited', 'unique', 'mastercard black', 'select'],
    notes: 'Salas VIP LoungeKey ilimitadas com convidados e pontos Esfera',
  },
  {
    id: 'c6-carbon',
    name: 'C6 Carbon Black',
    bank: 'C6 Bank',
    brand: 'mastercard',
    tier: 'premium',
    tierLabel: 'Alta Renda / Black',
    colorScheme: 'black',
    defaultLimit: 35000,
    closingDay: 20,
    dueDay: 27,
    keywords: ['c6', 'carbon', 'black', 'mastercard black'],
    notes: '2.5 pontos por dólar, 4 acessos anuais a salas VIP LoungeKey',
  },
  {
    id: 'inter-black',
    name: 'Inter Black Mastercard',
    bank: 'Banco Inter',
    brand: 'mastercard',
    tier: 'premium',
    tierLabel: 'Alta Renda / Black',
    colorScheme: 'gold',
    defaultLimit: 30000,
    closingDay: 15,
    dueDay: 22,
    keywords: ['inter', 'black', 'win', 'duogourmet', 'mastercard black'],
    notes: 'Salas VIP ilimitadas LoungeKey com Duo Gourmet ou investimentos',
  },
  {
    id: 'bb-ourocard-infinite',
    name: 'Ourocard Visa Infinite',
    bank: 'Banco do Brasil',
    brand: 'visa',
    tier: 'premium',
    tierLabel: 'Alta Renda / Infinite',
    colorScheme: 'gold',
    defaultLimit: 40000,
    closingDay: 18,
    dueDay: 25,
    keywords: ['bb', 'ourocard', 'infinite', 'estilo', 'visa infinite'],
    notes: 'Programa Pontos pra Você, seguros e proteção Visa Infinite',
  },
]

function normalize(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/**
 * Busca inteligente de cartões no catálogo por texto livre.
 * Encontra tanto nomes exatos como instituições, bandeiras ou níveis de classe.
 */
export function searchCardPresets(query: string): CardPresetItem[] {
  const q = normalize(query)
  if (!q) {
    // Retorna uma seleção balanceada (básicos e famosos)
    return CARD_PRESETS_CATALOG.slice(0, 8)
  }

  const terms = q.split(/\s+/).filter(Boolean)

  return CARD_PRESETS_CATALOG.filter((item) => {
    const itemTarget = normalize(
      `${item.name} ${item.bank} ${item.brand} ${item.tierLabel} ${item.keywords.join(' ')}`
    )
    return terms.every((term) => itemTarget.includes(term))
  })
}

/**
 * Detecção automática com base no que o usuário digita no input.
 */
export function autoDetectCardPreset(input: string): CardPresetItem | null {
  const q = normalize(input)
  if (!q || q.length < 2) return null

  // Tentativa de correspondência exata ou forte
  const matches = searchCardPresets(input)
  if (matches.length > 0) {
    // Se encontrar correspondência direta no nome ou banco
    return matches[0]
  }

  return null
}
