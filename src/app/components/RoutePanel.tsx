'use client'

import { useState } from 'react'
import { LatLng, RouteInfo, PriceBreakdown, PointSelectionMode } from '../../types'
import { PriceService } from '../lib/priceService'

interface RoutePanelProps {
  pickup: LatLng | null
  delivery: LatLng | null
  route: RouteInfo | null
  price: PriceBreakdown | null
  selectionMode: PointSelectionMode
  onCalculateRoute: () => void
  onSelectionModeChange: (mode: PointSelectionMode) => void
  onSwapPoints: () => void
  onClearAll: () => void
  onShareQuote: () => void
  isCalculating: boolean
}

const formatDistance = (km: number) => `${km.toFixed(2)} km`

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}min`
  return `${minutes} min`
}

function Icon({
  name,
  className = 'h-4 w-4',
}: {
  name:
    | 'route'
    | 'clock'
    | 'swap'
    | 'eraser'
    | 'whatsapp'
    | 'chevronRight'
    | 'sparkle'
    | 'pin'
    | 'flag'
    | 'alert'
    | 'check'
    | 'minimize'
    | 'expand'
  className?: string
}) {
  const common = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  switch (name) {
    case 'route':
      return (
        <svg {...common}>
          <circle cx="6" cy="19" r="2" />
          <circle cx="18" cy="5" r="2" />
          <path d="M8 19h6a4 4 0 0 0 0-8H10a4 4 0 0 1 0-8h6" />
        </svg>
      )
    case 'clock':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      )
    case 'swap':
      return (
        <svg {...common}>
          <path d="M7 7h13l-3-3" />
          <path d="M17 17H4l3 3" />
        </svg>
      )
    case 'eraser':
      return (
        <svg {...common}>
          <path d="M3 17l6 6h9l-9-9" />
          <path d="M14 5l5 5-7 7-5-5z" />
        </svg>
      )
    case 'whatsapp':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.52 3.48A11.77 11.77 0 0 0 12.05 0C5.5 0 .18 5.32.18 11.87a11.8 11.8 0 0 0 1.6 5.94L0 24l6.36-1.67a11.87 11.87 0 0 0 5.69 1.45h.01c6.55 0 11.87-5.32 11.87-11.87 0-3.17-1.24-6.15-3.41-8.43ZM12.06 21.5h-.01a9.62 9.62 0 0 1-4.9-1.34l-.35-.21-3.77.99 1-3.67-.23-.38a9.6 9.6 0 0 1-1.47-5.02c0-5.3 4.32-9.62 9.63-9.62 2.57 0 4.99 1 6.81 2.82a9.56 9.56 0 0 1 2.82 6.81c0 5.31-4.32 9.62-9.62 9.62Zm5.28-7.21c-.29-.14-1.71-.84-1.97-.94-.27-.1-.46-.14-.66.15s-.76.94-.93 1.14c-.17.19-.34.22-.63.07-.29-.15-1.22-.45-2.32-1.43a8.8 8.8 0 0 1-1.62-2.02c-.17-.29-.02-.45.13-.59.13-.13.29-.34.43-.5.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.14-.66-1.59-.9-2.18-.24-.57-.48-.5-.66-.51l-.56-.01c-.19 0-.5.07-.77.36-.27.29-1.02 1-1.02 2.44 0 1.44 1.05 2.84 1.2 3.04.14.19 2.07 3.15 5.02 4.42.7.3 1.25.48 1.68.62.7.22 1.34.19 1.84.11.56-.08 1.71-.7 1.95-1.37.24-.67.24-1.24.17-1.37-.07-.12-.26-.19-.55-.34Z" />
        </svg>
      )
    case 'chevronRight':
      return (
        <svg {...common}>
          <path d="M9 6l6 6-6 6" />
        </svg>
      )
    case 'sparkle':
      return (
        <svg {...common}>
          <path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3z" />
        </svg>
      )
    case 'pin':
      return (
        <svg {...common}>
          <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      )
    case 'flag':
      return (
        <svg {...common}>
          <path d="M5 21V5" />
          <path d="M5 5h11l-2 3 2 3H5" />
        </svg>
      )
    case 'alert':
      return (
        <svg {...common}>
          <path d="M12 3 1.5 21h21L12 3z" />
          <path d="M12 10v5" />
          <path d="M12 18h.01" />
        </svg>
      )
    case 'check':
      return (
        <svg {...common}>
          <path d="M5 12l5 5 9-11" />
        </svg>
      )
    case 'minimize':
      return (
        <svg {...common}>
          <path d="M5 12h14" />
        </svg>
      )
    case 'expand':
      return (
        <svg {...common}>
          <path d="M4 14h6v6" />
          <path d="M20 10h-6V4" />
          <path d="M14 10l7-7" />
          <path d="M10 14l-7 7" />
        </svg>
      )
  }
}

function PointRow({
  label,
  hint,
  active,
  filled,
  coords,
  variant,
  onClick,
  step,
}: {
  label: string
  hint: string
  active: boolean
  filled: boolean
  coords: LatLng | null
  variant: 'pickup' | 'delivery'
  onClick: () => void
  step: number
}) {
  const accent =
    variant === 'pickup'
      ? {
          ring: 'ring-emerald-200/80 border-emerald-300',
          chip: 'bg-emerald-500',
          soft: 'bg-emerald-50',
          text: 'text-emerald-700',
        }
      : {
          ring: 'ring-rose-200/80 border-rose-300',
          chip: 'bg-rose-500',
          soft: 'bg-rose-50',
          text: 'text-rose-700',
        }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left group flex items-center gap-3 rounded-xl border p-3 transition focus-ring ${
        active
          ? `${accent.ring} ring-2 bg-white shadow-sm`
          : 'border-slate-200/80 bg-white/60 hover:bg-white hover:border-slate-300'
      }`}
    >
      <div className="relative flex-shrink-0">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${accent.chip}`}
        >
          {filled ? <Icon name="check" className="h-4 w-4" /> : step}
        </div>
        {active && (
          <span className="pointer-events-none absolute inset-0 rounded-full animate-pingSoft bg-current opacity-0" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-800">{label}</p>
          {active && (
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${accent.soft} ${accent.text}`}
            >
              Activo
            </span>
          )}
        </div>
        {coords ? (
          <p className="truncate font-mono text-[11px] text-slate-500">
            {coords.lat.toFixed(5)}°, {coords.lng.toFixed(5)}°
          </p>
        ) : (
          <p className="text-xs text-slate-400">{hint}</p>
        )}
      </div>
      <Icon
        name="chevronRight"
        className="h-4 w-4 text-slate-300 transition group-hover:text-slate-500"
      />
    </button>
  )
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: 'route' | 'clock'
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/80 p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        <Icon name={icon} className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  )
}

export default function RoutePanel({
  pickup,
  delivery,
  route,
  price,
  selectionMode,
  onCalculateRoute,
  onSelectionModeChange,
  onSwapPoints,
  onClearAll,
  onShareQuote,
  isCalculating,
}: RoutePanelProps) {
  const [collapsed, setCollapsed] = useState(false)
  const canCalculate = Boolean(pickup && delivery) && !isCalculating
  const canSwap = Boolean(pickup && delivery) && !isCalculating
  const showResults = route && price && !isCalculating
  const minimumApplied =
    price && price.total === price.minimumCharge &&
    price.distanceCost + price.basePrice < price.minimumCharge

  if (collapsed) {
    return (
      <div className="glass flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 md:w-auto animate-fadeUp">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white">
          <Icon name="sparkle" className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Cotizador
          </p>
          {showResults && price ? (
            <p className="text-sm font-bold tabular-nums text-slate-900">
              {PriceService.formatCurrency(price.total)}
              <span className="ml-1 text-[11px] font-medium text-slate-500">
                · {formatDistance(route!.distance)}
              </span>
            </p>
          ) : (
            <p className="truncate text-sm font-semibold text-slate-800">
              {pickup && delivery
                ? 'Listo para calcular'
                : pickup
                  ? 'Falta el destino'
                  : delivery
                    ? 'Falta el origen'
                    : 'Selecciona puntos'}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          aria-label="Expandir panel"
          title="Expandir panel"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 focus-ring"
        >
          <Icon name="expand" className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="glass w-full overflow-hidden rounded-2xl md:w-[28rem] animate-fadeUp">
      <div className="relative px-6 pb-5 pt-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-brand-gradient opacity-[0.08]" />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-700">
              <Icon name="sparkle" className="h-3.5 w-3.5" />
              Cotizador
            </div>
            <h1 className="mt-2 text-xl font-bold leading-tight text-slate-900">
              Calculadora de <span className="brand-text">fletes</span>
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Marca dos puntos en el mapa y obtén tu tarifa al instante.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="Contraer panel"
            title="Contraer panel"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white/80 text-slate-600 transition hover:bg-white hover:text-slate-900 focus-ring"
          >
            <Icon name="minimize" className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-6">
        <div className="divider" />
      </div>

      <div className="space-y-4 px-6 py-5">
        {/* Segmented mode selector */}
        <div
          role="tablist"
          aria-label="Modo de selección"
          className="relative grid grid-cols-2 rounded-xl bg-slate-100/80 p-1 text-sm font-semibold"
        >
          <button
            role="tab"
            aria-selected={selectionMode === 'pickup'}
            onClick={() => onSelectionModeChange('pickup')}
            className={`relative z-10 rounded-lg px-3 py-2 transition focus-ring ${
              selectionMode === 'pickup'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Origen
            </span>
          </button>
          <button
            role="tab"
            aria-selected={selectionMode === 'delivery'}
            onClick={() => onSelectionModeChange('delivery')}
            className={`relative z-10 rounded-lg px-3 py-2 transition focus-ring ${
              selectionMode === 'delivery'
                ? 'bg-white text-rose-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              Destino
            </span>
          </button>
        </div>

        {/* Point rows */}
        <div className="space-y-2.5">
          <PointRow
            label="Punto de origen"
            hint="Toca el mapa para fijar"
            active={selectionMode === 'pickup'}
            filled={!!pickup}
            coords={pickup}
            variant="pickup"
            step={1}
            onClick={() => onSelectionModeChange('pickup')}
          />
          <PointRow
            label="Punto de destino"
            hint="Toca el mapa para fijar"
            active={selectionMode === 'delivery'}
            filled={!!delivery}
            coords={delivery}
            variant="delivery"
            step={2}
            onClick={() => onSelectionModeChange('delivery')}
          />
        </div>

        {/* Action bar */}
        <div className="flex items-stretch gap-2">
          <button
            onClick={onCalculateRoute}
            disabled={!canCalculate}
            className="group relative flex-1 overflow-hidden rounded-xl bg-brand-gradient px-4 py-3 text-sm font-semibold text-white shadow-soft transition disabled:cursor-not-allowed disabled:bg-none disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none focus-ring"
          >
            <span className="relative z-10 inline-flex items-center justify-center gap-2">
              {isCalculating ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Calculando…
                </>
              ) : (
                <>
                  <Icon name="route" className="h-4 w-4" />
                  Calcular ruta
                </>
              )}
            </span>
            {!isCalculating && canCalculate && (
              <span
                aria-hidden
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
              />
            )}
          </button>
          <button
            onClick={onSwapPoints}
            disabled={!canSwap}
            title="Intercambiar origen y destino"
            aria-label="Intercambiar origen y destino"
            className="flex h-auto items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 focus-ring"
          >
            <Icon name="swap" className="h-4 w-4" />
          </button>
          <button
            onClick={onClearAll}
            disabled={isCalculating || (!pickup && !delivery)}
            title="Limpiar selección"
            aria-label="Limpiar selección"
            className="flex h-auto items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 focus-ring"
          >
            <Icon name="eraser" className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        {showResults && route && price && (
          <div className="space-y-4 animate-fadeUp">
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Distancia" value={formatDistance(route.distance)} icon="route" />
              <Stat label="Tiempo est." value={formatDuration(route.duration)} icon="clock" />
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">
                  Desglose de precio
                </h3>
                {minimumApplied && (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 ring-1 ring-amber-200">
                    Mínimo aplicado
                  </span>
                )}
              </div>

              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Tarifa base</dt>
                  <dd className="font-medium tabular-nums text-slate-800">
                    {PriceService.formatCurrency(price.basePrice)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">
                    Distancia{' '}
                    <span className="text-[11px] text-slate-400">
                      ({price.distanceKm.toFixed(2)} km ×{' '}
                      {PriceService.formatCurrency(price.pricePerKm)})
                    </span>
                  </dt>
                  <dd className="font-medium tabular-nums text-slate-800">
                    {PriceService.formatCurrency(price.distanceCost)}
                  </dd>
                </div>
                {minimumApplied && (
                  <div className="flex items-center justify-between text-amber-700">
                    <dt>Cargo mínimo</dt>
                    <dd className="font-medium tabular-nums">
                      {PriceService.formatCurrency(price.minimumCharge)}
                    </dd>
                  </div>
                )}
              </dl>

              <div className="my-3 divider" />

              <div className="flex items-end justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Total estimado
                </p>
                <p className="text-2xl font-bold tabular-nums text-slate-900">
                  {PriceService.formatCurrency(price.total)}
                </p>
              </div>
            </div>

            <button
              onClick={onShareQuote}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-[#1ebe5d] focus-ring"
            >
              <Icon name="whatsapp" className="h-4 w-4" />
              Compartir por WhatsApp
            </button>
          </div>
        )}

        {/* Empty hint */}
        {(!pickup || !delivery) && !showResults && (
          <div className="flex items-start gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-600">
            <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
              <Icon name="sparkle" className="h-3.5 w-3.5" />
            </div>
            <p>
              Selecciona el{' '}
              <span className="font-semibold text-emerald-700">origen</span> y
              el <span className="font-semibold text-rose-700">destino</span>{' '}
              haciendo clic en el mapa. También puedes arrastrar los marcadores
              para ajustar.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
