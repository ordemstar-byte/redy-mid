export interface BankBrandConfig {
  id: string
  name: string
  shortName: string
  category: 'bank' | 'gateway' | 'investment'
  primaryColor: string
  secondaryColor: string
  bgClass: string
  accentColor: string
  badgeBg: string
  badgeBorder: string
  emblemText: string
  emblemBg: string
  tagColor: string
}

export const BANK_PRESETS: BankBrandConfig[] = [
  // --- BANCOS DE PRESTÍGIO & TRADICIONAIS ---
  {
    id: 'safra',
    name: 'Banco Safra',
    shortName: 'Safra',
    category: 'bank',
    primaryColor: '#C5A059',
    secondaryColor: '#0B132B',
    bgClass: 'bg-gradient-to-br from-[#0B132B] via-[#070D1E] to-[#C5A059]/20 border-[#C5A059]/40',
    accentColor: '#C5A059',
    badgeBg: 'bg-[#C5A059]/20 text-[#E5C378] border-[#C5A059]/40',
    badgeBorder: 'border-[#C5A059]/40',
    emblemText: 'SAFRA',
    emblemBg: 'bg-gradient-to-br from-[#D4AF37] to-[#997A25] text-zinc-950 font-black tracking-tight',
    tagColor: '#C5A059',
  },
  {
    id: 'itau',
    name: 'Itaú Unibanco',
    shortName: 'Itaú',
    category: 'bank',
    primaryColor: '#EC7000',
    secondaryColor: '#002B7F',
    bgClass: 'bg-gradient-to-br from-[#1E2025] via-[#141518] to-[#EC7000]/25 border-orange-500/30',
    accentColor: '#EC7000',
    badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    badgeBorder: 'border-orange-500/40',
    emblemText: 'itaú',
    emblemBg: 'bg-gradient-to-br from-[#EC7000] to-[#C95500] text-white font-bold',
    tagColor: '#EC7000',
  },
  {
    id: 'btg',
    name: 'BTG Pactual',
    shortName: 'BTG',
    category: 'investment',
    primaryColor: '#002244',
    secondaryColor: '#D4AF37',
    bgClass: 'bg-gradient-to-br from-[#001E3D] via-[#001226] to-[#0A0D14] border-blue-500/30',
    accentColor: '#D4AF37',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    badgeBorder: 'border-blue-500/40',
    emblemText: 'BTG',
    emblemBg: 'bg-gradient-to-br from-[#002244] to-[#001122] text-[#D4AF37] border border-[#D4AF37]/40 font-bold',
    tagColor: '#0055A5',
  },
  {
    id: 'xp',
    name: 'XP Investimentos',
    shortName: 'XP',
    category: 'investment',
    primaryColor: '#000000',
    secondaryColor: '#FFD700',
    bgClass: 'bg-gradient-to-br from-[#18181B] via-[#0E0E10] to-[#050506] border-zinc-700/60',
    accentColor: '#FFD700',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    badgeBorder: 'border-amber-500/40',
    emblemText: 'XP',
    emblemBg: 'bg-zinc-900 text-[#FFD700] border border-[#FFD700]/30 font-black',
    tagColor: '#FFD700',
  },
  {
    id: 'bradesco',
    name: 'Bradesco Prime',
    shortName: 'Bradesco',
    category: 'bank',
    primaryColor: '#CC092F',
    secondaryColor: '#800018',
    bgClass: 'bg-gradient-to-br from-[#990022] via-[#660017] to-[#2B000A] border-rose-500/30',
    accentColor: '#CC092F',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    badgeBorder: 'border-rose-500/40',
    emblemText: 'bra',
    emblemBg: 'bg-[#CC092F] text-white font-bold',
    tagColor: '#CC092F',
  },
  {
    id: 'santander',
    name: 'Santander Select',
    shortName: 'Santander',
    category: 'bank',
    primaryColor: '#EC0000',
    secondaryColor: '#7A0000',
    bgClass: 'bg-gradient-to-br from-[#B30000] via-[#730000] to-[#330000] border-red-500/30',
    accentColor: '#EC0000',
    badgeBg: 'bg-red-500/20 text-red-300 border-red-500/30',
    badgeBorder: 'border-red-500/40',
    emblemText: 'san',
    emblemBg: 'bg-[#EC0000] text-white font-bold',
    tagColor: '#EC0000',
  },
  {
    id: 'bb',
    name: 'Banco do Brasil',
    shortName: 'BB',
    category: 'bank',
    primaryColor: '#003399',
    secondaryColor: '#FDF000',
    bgClass: 'bg-gradient-to-br from-[#002B80] via-[#001A4D] to-[#FDF000]/10 border-blue-400/30',
    accentColor: '#FDF000',
    badgeBg: 'bg-amber-400/20 text-yellow-300 border-yellow-400/30',
    badgeBorder: 'border-yellow-400/40',
    emblemText: 'BB',
    emblemBg: 'bg-[#003399] text-[#FDF000] border border-[#FDF000]/40 font-extrabold',
    tagColor: '#FDF000',
  },
  {
    id: 'inter',
    name: 'Banco Inter',
    shortName: 'Inter',
    category: 'bank',
    primaryColor: '#FF7A00',
    secondaryColor: '#CC5500',
    bgClass: 'bg-gradient-to-br from-[#E65C00] via-[#A83E00] to-[#4D1C00] border-orange-500/30',
    accentColor: '#FF7A00',
    badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    badgeBorder: 'border-orange-500/40',
    emblemText: 'inter',
    emblemBg: 'bg-[#FF7A00] text-white font-bold',
    tagColor: '#FF7A00',
  },
  {
    id: 'c6',
    name: 'C6 Bank',
    shortName: 'C6',
    category: 'bank',
    primaryColor: '#242424',
    secondaryColor: '#CCCCCC',
    bgClass: 'bg-gradient-to-br from-[#242426] via-[#151517] to-[#0A0A0B] border-zinc-600/40',
    accentColor: '#FFFFFF',
    badgeBg: 'bg-zinc-700/40 text-zinc-200 border-zinc-600/30',
    badgeBorder: 'border-zinc-500/40',
    emblemText: 'C6',
    emblemBg: 'bg-zinc-800 text-white font-extrabold border border-zinc-600',
    tagColor: '#CCCCCC',
  },
  {
    id: 'caixa',
    name: 'Caixa Econômica',
    shortName: 'Caixa',
    category: 'bank',
    primaryColor: '#0066B3',
    secondaryColor: '#F26F21',
    bgClass: 'bg-gradient-to-br from-[#00518C] via-[#00355C] to-[#F26F21]/15 border-blue-500/30',
    accentColor: '#F26F21',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    badgeBorder: 'border-blue-500/40',
    emblemText: 'X',
    emblemBg: 'bg-gradient-to-br from-[#0066B3] to-[#F26F21] text-white font-black',
    tagColor: '#F26F21',
  },
  {
    id: 'sicoob',
    name: 'Sicoob Cooperativa',
    shortName: 'Sicoob',
    category: 'bank',
    primaryColor: '#003641',
    secondaryColor: '#8DC63F',
    bgClass: 'bg-gradient-to-br from-[#003641] via-[#002229] to-[#8DC63F]/20 border-[#8DC63F]/30',
    accentColor: '#8DC63F',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    badgeBorder: 'border-emerald-500/40',
    emblemText: 'sicoob',
    emblemBg: 'bg-[#003641] text-[#8DC63F] border border-[#8DC63F]/40 font-bold',
    tagColor: '#8DC63F',
  },
  {
    id: 'sicredi',
    name: 'Sicredi Cooperativa',
    shortName: 'Sicredi',
    category: 'bank',
    primaryColor: '#005C29',
    secondaryColor: '#72BF44',
    bgClass: 'bg-gradient-to-br from-[#005C29] via-[#003B1A] to-[#72BF44]/20 border-[#72BF44]/30',
    accentColor: '#72BF44',
    badgeBg: 'bg-green-500/20 text-green-300 border-green-500/30',
    badgeBorder: 'border-green-500/40',
    emblemText: 'sicredi',
    emblemBg: 'bg-[#005C29] text-white font-bold',
    tagColor: '#72BF44',
  },

  // --- GATEWAYS DE PAGAMENTO, MAQUININHAS & CHECKOUT ---
  {
    id: 'ton',
    name: 'Ton Pagamentos',
    shortName: 'Ton',
    category: 'gateway',
    primaryColor: '#00D05E',
    secondaryColor: '#003816',
    bgClass: 'bg-gradient-to-br from-[#003D1A] via-[#00210E] to-[#00D05E]/20 border-emerald-400/40',
    accentColor: '#00D05E',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    badgeBorder: 'border-emerald-500/40',
    emblemText: 'ton',
    emblemBg: 'bg-[#00D05E] text-zinc-950 font-black',
    tagColor: '#00D05E',
  },
  {
    id: 'cakto',
    name: 'Cakto Pagamentos',
    shortName: 'Cakto',
    category: 'gateway',
    primaryColor: '#FF3366',
    secondaryColor: '#660022',
    bgClass: 'bg-gradient-to-br from-[#3D0A1C] via-[#21040D] to-[#FF3366]/20 border-rose-500/40',
    accentColor: '#FF3366',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    badgeBorder: 'border-rose-500/40',
    emblemText: 'cakto',
    emblemBg: 'bg-gradient-to-br from-[#FF3366] to-[#C90038] text-white font-bold tracking-tight',
    tagColor: '#FF3366',
  },
  {
    id: 'asaas',
    name: 'Asaas Conta PJ',
    shortName: 'Asaas',
    category: 'gateway',
    primaryColor: '#0030B8',
    secondaryColor: '#00C3FF',
    bgClass: 'bg-gradient-to-br from-[#00258C] via-[#001347] to-[#00C3FF]/20 border-blue-500/40',
    accentColor: '#00C3FF',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    badgeBorder: 'border-blue-500/40',
    emblemText: 'asaas',
    emblemBg: 'bg-[#0030B8] text-white font-bold',
    tagColor: '#00C3FF',
  },
  {
    id: 'mercadopago',
    name: 'Mercado Pago',
    shortName: 'Mercado Pago',
    category: 'gateway',
    primaryColor: '#009EE3',
    secondaryColor: '#004B6E',
    bgClass: 'bg-gradient-to-br from-[#004B6E] via-[#002B40] to-[#009EE3]/25 border-cyan-500/30',
    accentColor: '#009EE3',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    badgeBorder: 'border-sky-500/40',
    emblemText: 'MP',
    emblemBg: 'bg-[#009EE3] text-white font-extrabold',
    tagColor: '#009EE3',
  },
  {
    id: 'pagbank',
    name: 'PagBank PagSeguro',
    shortName: 'PagBank',
    category: 'gateway',
    primaryColor: '#00A868',
    secondaryColor: '#F7B500',
    bgClass: 'bg-gradient-to-br from-[#004028] via-[#002416] to-[#F7B500]/15 border-emerald-500/30',
    accentColor: '#F7B500',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    badgeBorder: 'border-emerald-500/40',
    emblemText: 'PAG',
    emblemBg: 'bg-[#00A868] text-white font-bold',
    tagColor: '#00A868',
  },
  {
    id: 'infinitepay',
    name: 'InfinitePay',
    shortName: 'InfinitePay',
    category: 'gateway',
    primaryColor: '#00FF66',
    secondaryColor: '#08080A',
    bgClass: 'bg-gradient-to-br from-[#0E1A12] via-[#080E0A] to-[#00FF66]/15 border-emerald-400/40',
    accentColor: '#00FF66',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    badgeBorder: 'border-emerald-500/40',
    emblemText: '∞',
    emblemBg: 'bg-zinc-950 text-[#00FF66] border border-[#00FF66]/40 font-bold',
    tagColor: '#00FF66',
  },
  {
    id: 'stone',
    name: 'Stone Pagamentos',
    shortName: 'Stone',
    category: 'gateway',
    primaryColor: '#00A868',
    secondaryColor: '#003822',
    bgClass: 'bg-gradient-to-br from-[#003822] via-[#002014] to-[#00A868]/20 border-emerald-500/30',
    accentColor: '#00A868',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    badgeBorder: 'border-emerald-500/40',
    emblemText: 'stone',
    emblemBg: 'bg-[#00A868] text-white font-bold',
    tagColor: '#00A868',
  },
  {
    id: 'kiwify',
    name: 'Kiwify',
    shortName: 'Kiwify',
    category: 'gateway',
    primaryColor: '#10B981',
    secondaryColor: '#0F172A',
    bgClass: 'bg-gradient-to-br from-[#0F1E19] via-[#09120F] to-[#10B981]/20 border-emerald-500/40',
    accentColor: '#10B981',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    badgeBorder: 'border-emerald-500/40',
    emblemText: 'KIWI',
    emblemBg: 'bg-[#10B981] text-zinc-950 font-bold',
    tagColor: '#10B981',
  },
  {
    id: 'hotmart',
    name: 'Hotmart',
    shortName: 'Hotmart',
    category: 'gateway',
    primaryColor: '#F04E23',
    secondaryColor: '#2B0C04',
    bgClass: 'bg-gradient-to-br from-[#3D1409] via-[#210904] to-[#F04E23]/25 border-orange-500/40',
    accentColor: '#F04E23',
    badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    badgeBorder: 'border-orange-500/40',
    emblemText: 'HOT',
    emblemBg: 'bg-[#F04E23] text-white font-bold',
    tagColor: '#F04E23',
  },
]

export function getBankBranding(bankName: string): BankBrandConfig {
  const normalized = (bankName || '').toLowerCase().trim()

  if (normalized.includes('safra')) {
    return BANK_PRESETS.find((p) => p.id === 'safra')!
  }
  if (normalized.includes('ton')) {
    return BANK_PRESETS.find((p) => p.id === 'ton')!
  }
  if (normalized.includes('cakto')) {
    return BANK_PRESETS.find((p) => p.id === 'cakto')!
  }
  if (normalized.includes('asaas')) {
    return BANK_PRESETS.find((p) => p.id === 'asaas')!
  }
  if (normalized.includes('mercado') || normalized.includes('mp')) {
    return BANK_PRESETS.find((p) => p.id === 'mercadopago')!
  }
  if (normalized.includes('pagbank') || normalized.includes('pagseguro') || normalized.includes('pag')) {
    return BANK_PRESETS.find((p) => p.id === 'pagbank')!
  }
  if (normalized.includes('infinite') || normalized.includes('infinitepay')) {
    return BANK_PRESETS.find((p) => p.id === 'infinitepay')!
  }
  if (normalized.includes('stone')) {
    return BANK_PRESETS.find((p) => p.id === 'stone')!
  }
  if (normalized.includes('kiwify')) {
    return BANK_PRESETS.find((p) => p.id === 'kiwify')!
  }
  if (normalized.includes('hotmart')) {
    return BANK_PRESETS.find((p) => p.id === 'hotmart')!
  }
  if (normalized.includes('itau') || normalized.includes('itaú') || normalized.includes('personnalite')) {
    return BANK_PRESETS.find((p) => p.id === 'itau')!
  }
  if (normalized.includes('btg')) {
    return BANK_PRESETS.find((p) => p.id === 'btg')!
  }
  if (normalized.includes('xp')) {
    return BANK_PRESETS.find((p) => p.id === 'xp')!
  }
  if (normalized.includes('bradesco')) {
    return BANK_PRESETS.find((p) => p.id === 'bradesco')!
  }
  if (normalized.includes('santander')) {
    return BANK_PRESETS.find((p) => p.id === 'santander')!
  }
  if (normalized.includes('brasil') || normalized.includes('bb')) {
    return BANK_PRESETS.find((p) => p.id === 'bb')!
  }
  if (normalized.includes('inter')) {
    return BANK_PRESETS.find((p) => p.id === 'inter')!
  }
  if (normalized.includes('c6')) {
    return BANK_PRESETS.find((p) => p.id === 'c6')!
  }
  if (normalized.includes('caixa')) {
    return BANK_PRESETS.find((p) => p.id === 'caixa')!
  }
  if (normalized.includes('sicoob')) {
    return BANK_PRESETS.find((p) => p.id === 'sicoob')!
  }
  if (normalized.includes('sicredi')) {
    return BANK_PRESETS.find((p) => p.id === 'sicredi')!
  }

  // Fallback genérico executivo
  return {
    id: 'generic',
    name: bankName || 'Conta Bancária / Gateway',
    shortName: bankName?.substring(0, 8) || 'Conta',
    category: 'bank',
    primaryColor: '#10B981',
    secondaryColor: '#059669',
    bgClass: 'bg-gradient-to-br from-zinc-900 via-zinc-950 to-emerald-950/30 border-zinc-800',
    accentColor: '#10B981',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    badgeBorder: 'border-emerald-500/40',
    emblemText: bankName?.substring(0, 2).toUpperCase() || 'BC',
    emblemBg: 'bg-emerald-600 text-white font-bold',
    tagColor: '#10B981',
  }
}
