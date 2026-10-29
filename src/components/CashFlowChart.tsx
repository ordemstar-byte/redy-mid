import { useState, useMemo, useRef } from 'react'
import type { CashFlowDay } from '../types'
import { formatCurrency, formatDayMonth, formatDateBR } from '../lib/utils'
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Activity,
  CandlestickChart,
  LineChart,
  BarChart3,
} from 'lucide-react'

interface CashFlowChartProps {
  timeline: CashFlowDay[]
  privacyMode?: boolean
}

type ChartType = 'dual_lines' | 'candlestick' | 'cumulative'

export function CashFlowChart({ timeline, privacyMode = false }: CashFlowChartProps) {
  const [chartType, setChartType] = useState<ChartType>('dual_lines')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const points = useMemo(() => timeline, [timeline])

  // Dados acumulados para o modo de evolução
  const processedPoints = useMemo(() => {
    let runningIncome = 0
    let runningExpense = 0

    return points.map((p) => {
      runningIncome += p.incomes
      runningExpense += p.expenses

      // Modelagem de Candlestick B3 para cada dia de fluxo
      const open = p.projectedBalance - p.net
      const close = p.projectedBalance
      const maxSwing = Math.max(p.incomes, p.expenses)
      const high = Math.max(open, close) + maxSwing * 0.15
      const low = Math.min(open, close) - maxSwing * 0.15

      return {
        ...p,
        cumIncome: runningIncome,
        cumExpense: runningExpense,
        candle: {
          open,
          close,
          high,
          low,
          isBullish: close >= open,
        },
      }
    })
  }, [points])

  // Métricas do "Ticker" de Mercado (Estilo Bolsa B3 / TradingView)
  const marketMetrics = useMemo(() => {
    if (points.length === 0) {
      return {
        currentBalance: 0,
        netChange: 0,
        percentChange: 0,
        high: 0,
        low: 0,
        totalVolume: 0,
        totalGains: 0,
        totalLosses: 0,
      }
    }

    const currentBalance = points[points.length - 1]?.projectedBalance || 0
    const initialBalance = points[0] ? points[0].projectedBalance - points[0].net : 0
    const netChange = currentBalance - initialBalance
    const percentChange = initialBalance !== 0 ? (netChange / Math.abs(initialBalance)) * 100 : 0

    const totalGains = points.reduce((acc, p) => acc + p.incomes, 0)
    const totalLosses = points.reduce((acc, p) => acc + p.expenses, 0)
    const totalVolume = totalGains + totalLosses

    let high = 0
    let low = 0

    if (chartType === 'candlestick') {
      high = Math.max(...processedPoints.map((p) => Math.max(p.candle.high, p.projectedBalance)))
      low = Math.min(...processedPoints.map((p) => Math.min(p.candle.low, p.projectedBalance)))
    } else if (chartType === 'cumulative') {
      const lastPoint = processedPoints[processedPoints.length - 1]
      high = Math.max(100, lastPoint ? Math.max(lastPoint.cumIncome, lastPoint.cumExpense) : 100)
      low = 0
    } else {
      high = Math.max(100, ...points.map((p) => Math.max(p.incomes, p.expenses)))
      low = 0
    }

    return {
      currentBalance,
      netChange,
      percentChange,
      high,
      low,
      totalVolume,
      totalGains,
      totalLosses,
    }
  }, [points, processedPoints, chartType])

  // Dimensões do Canvas do Gráfico (com escala na direita estilo TradingView)
  const svgWidth = 860
  const svgHeight = 250
  const padTop = 25
  const padBottom = 35
  const padLeft = 20
  const padRight = 75 // Espaço reservado para o painel de cotação na direita da bolsa

  const plotWidth = svgWidth - padLeft - padRight
  const plotHeight = svgHeight - padTop - padBottom

  // Escala Y adaptável
  const scale = useMemo(() => {
    if (points.length === 0) {
      return {
        minVal: 0,
        maxVal: 1000,
        range: 1000,
        getY: () => padTop + plotHeight / 2,
        zeroY: padTop + plotHeight,
      }
    }

    let minVal = 0
    let maxVal = 100

    if (chartType === 'candlestick') {
      const highs = processedPoints.map((p) => p.candle.high)
      const lows = processedPoints.map((p) => p.candle.low)
      maxVal = Math.max(...highs)
      minVal = Math.min(...lows)
    } else if (chartType === 'cumulative') {
      const last = processedPoints[processedPoints.length - 1]
      maxVal = last ? Math.max(last.cumIncome, last.cumExpense) : 100
      minVal = 0
    } else {
      maxVal = Math.max(100, ...points.map((p) => Math.max(p.incomes, p.expenses)))
      minVal = 0
    }

    if (maxVal === minVal) {
      maxVal += 1000
    }

    // Margem de respiro superior e inferior
    const margin = (maxVal - minVal) * 0.15 || 500
    const finalMax = maxVal + margin
    const finalMin = chartType === 'candlestick' ? minVal - margin : 0
    const range = finalMax - finalMin || 1

    const getY = (val: number) => {
      const clamped = Math.max(finalMin, Math.min(finalMax, val))
      const ratio = (clamped - finalMin) / range
      return padTop + plotHeight - ratio * plotHeight
    }

    const zeroY = getY(0)

    return { minVal: finalMin, maxVal: finalMax, range, getY, zeroY }
  }, [points, processedPoints, chartType, plotHeight, padTop])

  // Coordenadas das Linhas B3 (Verde para Ganhos e Vermelha para Gastos)
  const { greenPts, redPts, stepX } = useMemo(() => {
    if (points.length === 0) return { greenPts: [], redPts: [], stepX: 0 }

    const step = points.length > 1 ? plotWidth / (points.length - 1) : plotWidth

    const gPts = processedPoints.map((p, i) => {
      const val = chartType === 'cumulative' ? p.cumIncome : p.incomes
      return {
        x: padLeft + i * step,
        y: scale.getY(val),
        val,
      }
    })

    const rPts = processedPoints.map((p, i) => {
      const val = chartType === 'cumulative' ? p.cumExpense : p.expenses
      return {
        x: padLeft + i * step,
        y: scale.getY(val),
        val,
      }
    })

    return { greenPts: gPts, redPts: rPts, stepX: step }
  }, [points, processedPoints, chartType, scale, padLeft, plotWidth])

  // Gerador de curva suave spline (estilo TradingView / Apple Stocks)
  const createSmoothLine = (pts: { x: number; y: number }[]): string => {
    if (pts.length === 0) return ''
    if (pts.length === 1) return `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`

    let path = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)]
      const p1 = pts[i]
      const p2 = pts[i + 1]
      const p3 = pts[Math.min(pts.length - 1, i + 2)]

      const cp1x = p1.x + (p2.x - p0.x) / 6
      const cp1y = p1.y + (p2.y - p0.y) / 6
      const cp2x = p2.x - (p3.x - p1.x) / 6
      const cp2y = p2.y - (p3.y - p1.y) / 6

      path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`
    }
    return path
  }

  const greenLinePath = useMemo(() => createSmoothLine(greenPts), [greenPts])
  const redLinePath = useMemo(() => createSmoothLine(redPts), [redPts])

  const greenAreaPath = useMemo(() => {
    if (greenPts.length < 2) return ''
    const last = greenPts[greenPts.length - 1]
    const first = greenPts[0]
    return `${greenLinePath} L ${last.x.toFixed(1)},${scale.zeroY} L ${first.x.toFixed(1)},${scale.zeroY} Z`
  }, [greenLinePath, greenPts, scale.zeroY])

  const redAreaPath = useMemo(() => {
    if (redPts.length < 2) return ''
    const last = redPts[redPts.length - 1]
    const first = redPts[0]
    return `${redLinePath} L ${last.x.toFixed(1)},${scale.zeroY} L ${first.x.toFixed(1)},${scale.zeroY} Z`
  }, [redLinePath, redPts, scale.zeroY])

  // Formatação para os Marcadores do Eixo Direito (Preços da Bolsa)
  const formatRightAxisLabel = (val: number) => {
    if (val === 0) return '0,00'
    if (Math.abs(val) >= 1000) {
      const k = val / 1000
      return `${k.toFixed(k % 1 === 0 ? 0 : 1)}k`
    }
    return val.toFixed(0)
  }

  // Linhas de Grade Horizontais e Verticais (Grade de Terminal de Negociação)
  const gridTicksY = [
    { label: formatRightAxisLabel(scale.maxVal * 0.9), y: padTop + plotHeight * 0.1 },
    { label: formatRightAxisLabel(scale.maxVal * 0.65), y: padTop + plotHeight * 0.35 },
    { label: formatRightAxisLabel(scale.maxVal * 0.4), y: padTop + plotHeight * 0.6 },
    { label: formatRightAxisLabel(scale.maxVal * 0.15), y: padTop + plotHeight * 0.85 },
  ]

  // Linhas verticais da grade
  const gridTicksX = useMemo(() => {
    if (points.length <= 1) return []
    const count = Math.min(6, points.length)
    const indices: number[] = []
    for (let i = 0; i < count; i++) {
      indices.push(Math.floor((i / (count - 1)) * (points.length - 1)))
    }
    return indices
  }, [points])

  // Valores da última cotação para os pills do eixo direito
  const latestGreen = greenPts[greenPts.length - 1]
  const latestRed = redPts[redPts.length - 1]
  const latestPoint = processedPoints[processedPoints.length - 1]

  const activeDay = hoveredIndex !== null ? processedPoints[hoveredIndex] : null
  const activeGreen = hoveredIndex !== null ? greenPts[hoveredIndex] : null
  const activeRed = hoveredIndex !== null ? redPts[hoveredIndex] : null

  // Manipulador de mouse para o crosshair estilo TradingView
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const xRatio = (e.clientX - rect.left) / rect.width
    const svgX = xRatio * svgWidth

    const clampedX = Math.max(padLeft, Math.min(padLeft + plotWidth, svgX))
    const index = Math.round((clampedX - padLeft) / Math.max(1, stepX))
    const safeIndex = Math.max(0, Math.min(points.length - 1, index))

    setHoveredIndex(safeIndex)

    const yRatio = (e.clientY - rect.top) / rect.height
    const svgY = yRatio * svgHeight
    setMousePos({ x: clampedX, y: svgY })
  }

  const handleMouseLeave = () => {
    setHoveredIndex(null)
    setMousePos(null)
  }

  if (points.length === 0) {
    return (
      <div className="h-56 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 text-xs bg-white dark:bg-zinc-900/60 rounded-2xl border border-zinc-200/90 dark:border-zinc-800/80 p-6">
        <Activity className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mb-2" />
        <span>Nenhum dado temporal registrado no período selecionado.</span>
      </div>
    )
  }

  return (
    <div className="relative w-full rounded-2xl bg-white dark:bg-[#0B0C10] border border-zinc-200/90 dark:border-zinc-800/80 p-5 shadow-sm backdrop-blur-sm transition-all overflow-hidden">
      
      {/* =========================================================================
          PAINEL DE COTAÇÃO ESTILO BOLSA DE VALORES (TICKER HEADER)
          ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800/60">
        
        {/* Ativo e Cotação Principal */}
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs tracking-wider text-zinc-900 dark:text-white uppercase font-mono">
                AEGIS // FLUXO & LIQUIDEZ (B3)
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                AO VIVO
              </span>
            </div>

            {/* Cotação do Saldo Atual / Inspecionado */}
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono-numbers text-zinc-900 dark:text-white">
                {formatCurrency(activeDay ? activeDay.projectedBalance : marketMetrics.currentBalance, privacyMode)}
              </span>

              {/* Variação em % e R$ */}
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold font-mono-numbers ${
                  marketMetrics.netChange >= 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                    : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'
                }`}
              >
                {marketMetrics.netChange >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                <span>
                  {marketMetrics.netChange >= 0 ? '+' : ''}
                  {formatCurrency(marketMetrics.netChange, privacyMode)} (
                  {marketMetrics.percentChange.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Mini Estatísticas de Pregão (Máxima, Mínima, Volume) */}
          <div className="hidden sm:flex items-center gap-4 pl-4 border-l border-zinc-200 dark:border-zinc-800 text-[11px] font-mono-numbers">
            <div>
              <span className="text-zinc-400 block text-[9px] uppercase tracking-wider font-sans font-semibold">
                Máx Período
              </span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {formatCurrency(marketMetrics.high, privacyMode)}
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[9px] uppercase tracking-wider font-sans font-semibold">
                Vol. Entradas
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                +{formatCurrency(marketMetrics.totalGains, privacyMode)}
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[9px] uppercase tracking-wider font-sans font-semibold">
                Vol. Saídas
              </span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                -{formatCurrency(marketMetrics.totalLosses, privacyMode)}
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SELETOR DE TIPOS DE GRÁFICO DA BOLSA (LINHAS / CANDLESTICK / ACUMULADO)
            ========================================================================= */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Seletor de Tipo */}
          <div className="flex items-center p-0.5 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
            <button
              onClick={() => setChartType('dual_lines')}
              title="Gráfico com 2 Linhas: Verde para Ganhos e Vermelha para Gastos"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                chartType === 'dual_lines'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <LineChart className="w-3.5 h-3.5 text-emerald-500" />
              <span>Linhas B3 (Ganhos vs Gastos)</span>
            </button>

            <button
              onClick={() => setChartType('candlestick')}
              title="Velas Japonesas da Bolsa de Valores (Candlesticks)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                chartType === 'candlestick'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <CandlestickChart className="w-3.5 h-3.5 text-purple-500" />
              <span>Candlestick</span>
            </button>

            <button
              onClick={() => setChartType('cumulative')}
              title="Evolução acumulada contínua no mês"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                chartType === 'cumulative'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
              <span>Acumulado</span>
            </button>
          </div>

          {/* Legenda com Indicadores Oficiais da Bolsa */}
          <div className="flex items-center gap-3 text-xs font-medium pl-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold font-mono-numbers">
                Ganhos (Linha Verde)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs shadow-rose-500/50" />
              <span className="text-rose-700 dark:text-rose-400 font-semibold font-mono-numbers">
                Gastos (Linha Vermelha)
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* =========================================================================
          CANVAS GRÁFICO (TRADING TERMINAL SVG) COM CROSSHAIR E ESCALA NA DIREITA
          ========================================================================= */}
      <div className="relative w-full pt-4 select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-64 sm:h-72 overflow-visible cursor-crosshair"
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Gradiente Verde de Alta da Bolsa */}
            <linearGradient id="b3GreenArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="80%" stopColor="#10B981" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>

            {/* Gradiente Vermelho de Baixa da Bolsa */}
            <linearGradient id="b3RedArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.22" />
              <stop offset="80%" stopColor="#EF4444" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
            </linearGradient>

            {/* Filtros de Resplendor Neon da Bolsa */}
            <filter id="b3GlowGreen" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="3" floodColor="#10B981" floodOpacity="0.45" />
            </filter>
            <filter id="b3GlowRed" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="3" floodColor="#EF4444" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* Grade de Negociação Vertical */}
          {gridTicksX.map((idx) => {
            const x = padLeft + idx * stepX
            return (
              <line
                key={`grid-x-${idx}`}
                x1={x}
                y1={padTop}
                x2={x}
                y2={padTop + plotHeight}
                stroke="currentColor"
                className="text-zinc-100 dark:text-zinc-800/40"
                strokeWidth="1"
                strokeDasharray="2 3"
              />
            )
          })}

          {/* Grade de Negociação Horizontal e Marcadores de Preço à Direita */}
          {gridTicksY.map((tick, i) => (
            <g key={`grid-y-${i}`}>
              <line
                x1={padLeft}
                y1={tick.y}
                x2={padLeft + plotWidth}
                y2={tick.y}
                stroke="currentColor"
                className="text-zinc-200/80 dark:text-zinc-800/70"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              {/* Cotação no Eixo Direito (Right Axis) */}
              <text
                x={padLeft + plotWidth + 8}
                y={tick.y + 3}
                className="text-[10px] font-mono-numbers fill-zinc-400 dark:fill-zinc-500 font-semibold"
              >
                R$ {tick.label}
              </text>
            </g>
          ))}

          {/* Linha de Base Zero */}
          <line
            x1={padLeft}
            y1={scale.zeroY}
            x2={padLeft + plotWidth}
            y2={scale.zeroY}
            stroke="#94A3B8"
            strokeWidth="1"
            className="opacity-40"
          />

          {/* =====================================================================
              MODO 1 & 3: LINHAS DUPLAS B3 (GANHOS VS GASTOS) & ACUMULADO
              ===================================================================== */}
          {chartType !== 'candlestick' && (
            <>
              {/* Área com degradê sob a linha de ganhos */}
              {greenAreaPath && <path d={greenAreaPath} fill="url(#b3GreenArea)" />}

              {/* Área com degradê sob a linha de gastos */}
              {redAreaPath && <path d={redAreaPath} fill="url(#b3RedArea)" />}

              {/* 1. LINHA VERMELHA (Gastos da Bolsa) */}
              {redLinePath && (
                <path
                  d={redLinePath}
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="2.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#b3GlowRed)"
                />
              )}

              {/* 2. LINHA VERDE (Ganhos da Bolsa) */}
              {greenLinePath && (
                <path
                  d={greenLinePath}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#b3GlowGreen)"
                />
              )}

              {/* Pontos nas transações ativas */}
              {chartType === 'dual_lines' &&
                processedPoints.map((p, i) => {
                  const gPt = greenPts[i]
                  const rPt = redPts[i]
                  return (
                    <g key={`dots-${p.date}`}>
                      {p.incomes > 0 && gPt && (
                        <circle
                          cx={gPt.x}
                          cy={gPt.y}
                          r="3.5"
                          fill="#10B981"
                          stroke="#FFFFFF"
                          strokeWidth="1.5"
                        />
                      )}
                      {p.expenses > 0 && rPt && (
                        <circle
                          cx={rPt.x}
                          cy={rPt.y}
                          r="3.5"
                          fill="#EF4444"
                          stroke="#FFFFFF"
                          strokeWidth="1.5"
                        />
                      )}
                    </g>
                  )
                })}

              {/* Ponto Pulsante Ao Vivo na última cotação (Live Ticker Pulse) */}
              {latestGreen && (
                <g>
                  <circle
                    cx={latestGreen.x}
                    cy={latestGreen.y}
                    r="4"
                    fill="#10B981"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                  <circle
                    cx={latestGreen.x}
                    cy={latestGreen.y}
                    r="8"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="1.5"
                    className="animate-ping origin-center"
                    style={{ transformOrigin: `${latestGreen.x}px ${latestGreen.y}px` }}
                  />
                </g>
              )}
            </>
          )}

          {/* =====================================================================
              MODO 2: VELAS JAPONESAS (CANDLESTICKS B3)
              ===================================================================== */}
          {chartType === 'candlestick' &&
            processedPoints.map((p, i) => {
              const x = padLeft + i * stepX
              const candleW = Math.max(4, Math.min(14, stepX * 0.6))
              const { open, close, high, low, isBullish } = p.candle

              const yHigh = scale.getY(high)
              const yLow = scale.getY(low)
              const yOpen = scale.getY(open)
              const yClose = scale.getY(close)

              const topBody = Math.min(yOpen, yClose)
              const bottomBody = Math.max(yOpen, yClose)
              const bodyHeight = Math.max(2, bottomBody - topBody)
              const color = isBullish ? '#10B981' : '#EF4444'

              return (
                <g key={`candle-${p.date}`} className="cursor-pointer">
                  {/* Pavio Superior e Inferior */}
                  <line
                    x1={x}
                    y1={yHigh}
                    x2={x}
                    y2={yLow}
                    stroke={color}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />

                  {/* Corpo da Vela (Candle Body) */}
                  <rect
                    x={x - candleW / 2}
                    y={topBody}
                    width={candleW}
                    height={bodyHeight}
                    fill={color}
                    rx={1.5}
                    className="hover:opacity-100 transition-opacity"
                  />
                </g>
              )
            })}

          {/* =====================================================================
              TAGS DE COTAÇÃO ATUAL FIXAS NO EIXO DIREITO (ESTILO TRADINGVIEW)
              ===================================================================== */}
          {latestGreen && latestRed && chartType !== 'candlestick' && (
            <g className="pointer-events-none font-mono-numbers">
              {/* Badge Verde de Ganhos no Eixo Direito */}
              <rect
                x={padLeft + plotWidth + 3}
                y={latestGreen.y - 8}
                width={65}
                height={16}
                rx={4}
                fill="#10B981"
              />
              <text
                x={padLeft + plotWidth + 8}
                y={latestGreen.y + 4}
                className="text-[9px] fill-white font-bold"
              >
                +{formatRightAxisLabel(latestPoint?.incomes || 0)}
              </text>

              {/* Badge Vermelho de Gastos no Eixo Direito */}
              <rect
                x={padLeft + plotWidth + 3}
                y={latestRed.y - 8}
                width={65}
                height={16}
                rx={4}
                fill="#EF4444"
              />
              <text
                x={padLeft + plotWidth + 8}
                y={latestRed.y + 4}
                className="text-[9px] fill-white font-bold"
              >
                -{formatRightAxisLabel(latestPoint?.expenses || 0)}
              </text>
            </g>
          )}

          {/* =====================================================================
              CROSSHAIR INTERATIVO DUPLO DA BOLSA (TRADINGVIEW CROSSHAIR)
              ===================================================================== */}
          {hoveredIndex !== null && activeGreen && activeRed && mousePos && (
            <g className="pointer-events-none">
              {/* Linha Vertical da Retícula */}
              <line
                x1={activeGreen.x}
                y1={padTop}
                x2={activeGreen.x}
                y2={padTop + plotHeight}
                stroke="#64748B"
                strokeWidth="1.25"
                strokeDasharray="3 3"
                className="opacity-80"
              />

              {/* Linha Horizontal da Retícula seguindo a altura do mouse */}
              <line
                x1={padLeft}
                y1={mousePos.y}
                x2={padLeft + plotWidth}
                y2={mousePos.y}
                stroke="#64748B"
                strokeWidth="1"
                strokeDasharray="3 3"
                className="opacity-60"
              />

              {/* Indicador de Preço no Cursor Y (Pill no Eixo Direito) */}
              <rect
                x={padLeft + plotWidth + 3}
                y={mousePos.y - 8}
                width={65}
                height={16}
                rx={4}
                fill="#334155"
              />
              <text
                x={padLeft + plotWidth + 8}
                y={mousePos.y + 4}
                className="text-[9px] font-mono-numbers fill-white font-bold"
              >
                R$ {formatRightAxisLabel(scale.minVal + (1 - (mousePos.y - padTop) / plotHeight) * scale.range)}
              </text>

              {/* Pontos de Interseção nas Linhas B3 */}
              {chartType !== 'candlestick' && (
                <>
                  {/* Ponto Verde (Ganhos) */}
                  <circle
                    cx={activeGreen.x}
                    cy={activeGreen.y}
                    r="6.5"
                    fill="#10B981"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    filter="url(#b3GlowGreen)"
                  />
                  <circle cx={activeGreen.x} cy={activeGreen.y} r="2.5" fill="#FFFFFF" />

                  {/* Ponto Vermelho (Gastos) */}
                  <circle
                    cx={activeRed.x}
                    cy={activeRed.y}
                    r="6.5"
                    fill="#EF4444"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    filter="url(#b3GlowRed)"
                  />
                  <circle cx={activeRed.x} cy={activeRed.y} r="2.5" fill="#FFFFFF" />
                </>
              )}
            </g>
          )}

          {/* Zonas Invisíveis de Interação do Mouse por Dia */}
          {processedPoints.map((p, i) => {
            const x = padLeft + i * stepX
            const triggerW = Math.max(stepX, 16)
            return (
              <rect
                key={`trigger-${p.date}`}
                x={x - triggerW / 2}
                y={padTop}
                width={triggerW}
                height={plotHeight}
                fill="transparent"
                className="cursor-crosshair"
              />
            )
          })}
        </svg>

        {/* Eixo X com Datas da Bolsa */}
        <div className="flex justify-between items-center text-[10px] text-zinc-400 dark:text-zinc-500 font-mono-numbers mt-2 px-1 pr-16">
          <span>{formatDayMonth(points[0].date)}</span>
          {points.length > 8 && (
            <span>{formatDayMonth(points[Math.floor(points.length * 0.25)].date)}</span>
          )}
          {points.length > 15 && (
            <span>{formatDayMonth(points[Math.floor(points.length * 0.5)].date)}</span>
          )}
          {points.length > 22 && (
            <span>{formatDayMonth(points[Math.floor(points.length * 0.75)].date)}</span>
          )}
          <span>{formatDayMonth(points[points.length - 1].date)}</span>
        </div>

        {/* =========================================================================
            TOOLTIP DE INSPEÇÃO TÉCNICA FLUTUANTE (TRADINGVIEW HOVER INSPECTOR)
            ========================================================================= */}
        {activeDay && hoveredIndex !== null && (
          <div
            className="absolute z-30 pointer-events-none transition-all duration-75"
            style={{
              left: `${Math.min(78, Math.max(16, (hoveredIndex / Math.max(1, points.length - 1)) * 100))}%`,
              bottom: '55px',
              transform: 'translateX(-50%)',
            }}
          >
            <div className="bg-white/95 dark:bg-[#12141A]/95 backdrop-blur-md rounded-xl p-3 border border-zinc-200 dark:border-zinc-700/80 shadow-2xl text-xs space-y-2 min-w-[220px]">
              
              {/* Header do Tooltip com Data e Dia da Semana */}
              <div className="font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  {formatDateBR(activeDay.date)}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">
                  {formatDayMonth(activeDay.date)}
                </span>
              </div>

              {/* Informações de Mercado (Ganhos vs Gastos e Balanço) */}
              <div className="space-y-1 font-mono-numbers">
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-1 font-semibold text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Ganhos (Verde):
                  </span>
                  <span className="font-bold">
                    +{formatCurrency(chartType === 'cumulative' ? activeDay.cumIncome : activeDay.incomes, privacyMode)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                  <span className="flex items-center gap-1 font-semibold text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Gastos (Vermelho):
                  </span>
                  <span className="font-bold">
                    -{formatCurrency(chartType === 'cumulative' ? activeDay.cumExpense : activeDay.expenses, privacyMode)}
                  </span>
                </div>

                <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-500 text-[11px] font-sans">
                    {chartType === 'cumulative' ? 'Saldo Acumulado:' : 'Resultado do Dia:'}
                  </span>
                  <span
                    className={`font-bold ${
                      (chartType === 'cumulative' ? activeDay.cumIncome - activeDay.cumExpense : activeDay.net) >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {formatCurrency(
                      chartType === 'cumulative' ? activeDay.cumIncome - activeDay.cumExpense : activeDay.net,
                      privacyMode
                    )}
                  </span>
                </div>
              </div>

              {/* Se houver lançamentos no dia */}
              {activeDay.transactions.length > 0 && (
                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-1 text-[10px] text-zinc-500 dark:text-zinc-400">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {activeDay.transactions.length} operação(ões) registrada(s):
                  </span>
                  <div className="truncate max-w-[210px] text-[10px] font-mono mt-0.5">
                    {activeDay.transactions.map((t) => t.description).join(', ')}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  )
}
