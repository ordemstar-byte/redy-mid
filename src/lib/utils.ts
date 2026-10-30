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
 * Formata data e horário no padrão PT-BR (DD/MM/AAAA às HH:mm)
 */
export function formatDateTimeBR(isoDate: string, time?: string): string {
  const dateFormatted = formatDateBR(isoDate)
  if (!time) return dateFormatted
  return `${dateFormatted} às ${time}`
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
 * Retorna o mês e ano formatados em português a partir de qualquer data ISO (YYYY-MM-DD ou YYYY-MM)
 */
export function formatMonthYearFromDate(isoDate: string, short = false): string {
  if (!isoDate) return ''
  const parts = isoDate.split('-').map(Number)
  if (parts.length < 2) return ''
  const [year, month] = parts
  const d = new Date(year, month - 1, 1)
  if (short) {
    const monthShort = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
    return `${monthShort.charAt(0).toUpperCase() + monthShort.slice(1)}/${year}`
  }
  const monthName = d.toLocaleDateString('pt-BR', { month: 'long' })
  return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${year}`
}

/**
 * Calcula o mês e ano em que uma compra parcelada irá terminar
 */
export function calculateInstallmentEndDate(
  currentDueDate: string,
  totalInstallments: number,
  currentInstallmentNumber = 1
): { endDueDate: string; endMonthYearText: string; endMonthYearShort: string } {
  if (!currentDueDate || totalInstallments <= 1) {
    const text = formatMonthYearFromDate(currentDueDate)
    const shortText = formatMonthYearFromDate(currentDueDate, true)
    return { endDueDate: currentDueDate, endMonthYearText: text, endMonthYearShort: shortText }
  }

  const [year, month, day] = currentDueDate.split('-').map(Number)
  const remainingSteps = Math.max(0, totalInstallments - currentInstallmentNumber)

  let endMonth = month + remainingSteps
  let endYear = year
  while (endMonth > 12) {
    endMonth -= 12
    endYear += 1
  }

  const daysInEndMonth = new Date(endYear, endMonth, 0).getDate()
  const clampedDay = Math.min(day || 1, daysInEndMonth)
  const endDueDate = `${endYear}-${String(endMonth).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`

  return {
    endDueDate,
    endMonthYearText: formatMonthYearFromDate(endDueDate),
    endMonthYearShort: formatMonthYearFromDate(endDueDate, true),
  }
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

/**
 * Retorna as datas de fechamento e vencimento de um ciclo de fatura,
 * considerando corretamente quando o vencimento é no mês seguinte ao fechamento.
 */
export function getInvoiceCycleDates(
  dueYearMonth: string,
  closingDay: number,
  dueDay: number
): { closingDate: string; dueDate: string } {
  const [dueYear, dueMonth] = dueYearMonth.split('-').map(Number)
  const dueDaysInMonth = new Date(dueYear, dueMonth, 0).getDate()
  const clampedDueDay = Math.min(dueDay, dueDaysInMonth)
  const dueDate = `${dueYear}-${String(dueMonth).padStart(2, '0')}-${String(clampedDueDay).padStart(2, '0')}`

  let closeYear = dueYear
  let closeMonth = dueMonth

  // Se o dia de vencimento for menor que o dia de fechamento (ex: fecha dia 28, vence dia 10),
  // o fechamento ocorreu no mês anterior ao vencimento
  if (dueDay < closingDay) {
    closeMonth -= 1
    if (closeMonth < 1) {
      closeMonth = 12
      closeYear -= 1
    }
  }

  const closeDaysInMonth = new Date(closeYear, closeMonth, 0).getDate()
  const clampedCloseDay = Math.min(closingDay, closeDaysInMonth)
  const closingDate = `${closeYear}-${String(closeMonth).padStart(2, '0')}-${String(clampedCloseDay).padStart(2, '0')}`

  return { closingDate, dueDate }
}
