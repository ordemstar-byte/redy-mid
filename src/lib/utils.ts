import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata valores monetários no padrão Real Brasileiro (BRL)
 */
export function formatCurrency(value: number, privacyMode = false): string {
  if (privacyMode) {
    return 'R$ ••••••'
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Formata números percentuais
 */
export function formatPercent(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100)
}

/**
 * Formata data ISO (YYYY-MM-DD) para PT-BR (DD/MM/AAAA)
 */
export function formatDateBR(isoDate: string): string {
  if (!isoDate) return ''
  const parts = isoDate.split('-')
  if (parts.length !== 3) return isoDate
  return `${parts[2]}/${parts[1]}/${parts[0]}`
}

/**
 * Retorna nome abreviado do dia da semana e dia
 */
export function formatDayMonth(isoDate: string): string {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

/**
 * Retorna o nome do mês e ano em português
 */
export function formatMonthYearHeader(yearMonth: string): string {
  if (!yearMonth) return ''
  const [year, month] = yearMonth.split('-').map(Number)
  const d = new Date(year, month - 1, 1)
  const monthName = d.toLocaleDateString('pt-BR', { month: 'long' })
  return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${year}`
}

/**
 * Calcula a data de vencimento da fatura para uma compra realizada em determinada data
 */
export function calculateInvoiceDueDate(
  purchaseDateStr: string,
  closingDay: number,
  dueDay: number
): { dueDate: string; invoiceMonthYear: string } {
  const [pYear, pMonth, pDay] = purchaseDateStr.split('-').map(Number)
  
  let invoiceYear = pYear
  let invoiceMonth = pMonth

  // Se a compra foi feita DEPOIS do dia de fechamento, entra na fatura do mês seguinte
  if (pDay >= closingDay) {
    invoiceMonth += 1
    if (invoiceMonth > 12) {
      invoiceMonth = 1
      invoiceYear += 1
    }
  }

  // Se o dia de vencimento for menor que o dia de fechamento (ex: fecha dia 28, vence dia 5),
  // o vencimento ocorre no mês seguinte ao fechamento
  let dueYear = invoiceYear
  let dueMonth = invoiceMonth
  if (dueDay < closingDay) {
    dueMonth += 1
    if (dueMonth > 12) {
      dueMonth = 1
      dueYear += 1
    }
  }

  const dueDateStr = `${dueYear}-${String(dueMonth).padStart(2, '0')}-${String(dueDay).padStart(2, '0')}`
  const invoiceMonthYearStr = `${invoiceYear}-${String(invoiceMonth).padStart(2, '0')}`

  return {
    dueDate: dueDateStr,
    invoiceMonthYear: invoiceMonthYearStr,
  }
}

/**
 * Calcula o melhor dia de compra para o cartão (dia seguinte ao fechamento)
 */
export function getBestPurchaseDay(closingDay: number): number {
  return closingDay === 31 ? 1 : closingDay + 1
}

/**
 * Calcula quantos dias faltam para o fechamento
 */
export function getDaysUntilClosing(closingDay: number): { days: number; isClosingSoon: boolean } {
  const today = new Date()
  const currentDay = today.getDate()
  
  let days: number
  if (currentDay <= closingDay) {
    days = closingDay - currentDay
  } else {
    // Dias restantes no mês + closingDay
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
    days = (daysInMonth - currentDay) + closingDay
  }

  return {
    days,
    isClosingSoon: days <= 3,
  }
}
