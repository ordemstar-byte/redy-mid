export interface BankBrandConfig {
  id: string
  name: string
  shortName: string
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
  {
    id: 'itau',
    name: 'Itaú Unibanco',
    shortName: 'Itaú',
    primaryColor: '#EC7000',
    secondaryColor: '#002B7F',
    bgClass: 'bg-gradient-to-br from-[#1E2025] via-[#141518] to-[#EC7000]/25 border-orange-500/30',
    accentColor: '#EC7000',
    badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    badgeBorder: 'border-orange-500/40',
    emblemText: 'itaú',
    emblemBg: 'bg-gradient-to-br from-[#EC7000] to-[#C95500] text-white',
    tagColor: '#EC7000',
  },
  {
    id: 'btg',
    name: 'BTG Pactual',
    shortName: 'BTG',
    primaryColor: '#002244',
    secondaryColor: '#D4AF37',
    bgClass: 'bg-gradient-to-br from-[#001E3D] via-[#001226] to-[#0A0D14] border-blue-500/30',
    accentColor: '#D4AF37',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    badgeBorder: 'border-blue-500/40',
    emblemText: 'BTG',
    emblemBg: 'bg-gradient-to-br from-[#002244] to-[#001122] text-[#D4AF37] border border-[#D4AF37]/40',
    tagColor: '#0055A5',
  },
  {
    id: 'nubank',
    name: 'Nubank',
    shortName: 'Nubank',
    primaryColor: '#820AD1',
    secondaryColor: '#9B30FF',
    bgClass: 'bg-gradient-to-br from-[#5E0899] via-[#3E0466] to-[#1D0133] border-purple-500/30',
    accentColor: '#820AD1',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    badgeBorder: 'border-purple-500/40',
    emblemText: 'nu',
    emblemBg: 'bg-[#820AD1] text-white font-bold',
    tagColor: '#820AD1',
  },
  {
    id: 'xp',
    name: 'XP Investimentos',
    shortName: 'XP',
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
]

export function getBankBranding(bankName: string): BankBrandConfig {
  const normalized = (bankName || '').toLowerCase().trim()

  if (normalized.includes('itau') || normalized.includes('itaú') || normalized.includes('personnalite')) {
    return BANK_PRESETS[0]
  }
  if (normalized.includes('btg')) {
    return BANK_PRESETS[1]
  }
  if (normalized.includes('nu') || normalized.includes('nubank') || normalized.includes('ultravioleta')) {
    return BANK_PRESETS[2]
  }
  if (normalized.includes('xp')) {
    return BANK_PRESETS[3]
  }
  if (normalized.includes('bradesco')) {
    return BANK_PRESETS[4]
  }
  if (normalized.includes('santander')) {
    return BANK_PRESETS[5]
  }
  if (normalized.includes('brasil') || normalized.includes('bb')) {
    return BANK_PRESETS[6]
  }
  if (normalized.includes('inter')) {
    return BANK_PRESETS[7]
  }
  if (normalized.includes('c6')) {
    return BANK_PRESETS[8]
  }
  if (normalized.includes('caixa')) {
    return BANK_PRESETS[9]
  }

  // Fallback genérico executivo
  return {
    id: 'generic',
    name: bankName || 'Conta Bancária',
    shortName: bankName?.substring(0, 8) || 'Banco',
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
