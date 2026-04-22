'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import {
  LatLng,
  RouteInfo,
  PriceBreakdown,
  PointSelectionMode,
} from '../types'
import { RouteService } from './lib/routeService'
import { PriceService } from './lib/priceService'
import RoutePanel from './components/RoutePanel'

const MapComponent = dynamic(() => import('./components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-100">
      <div className="flex flex-col items-center gap-3 text-slate-600">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
        </div>
        <p className="text-sm font-medium">Cargando mapa…</p>
      </div>
    </div>
  ),
})

export default function Home() {
  const [pickup, setPickup] = useState<LatLng | null>(null)
  const [delivery, setDelivery] = useState<LatLng | null>(null)
  const [selectionMode, setSelectionMode] = useState<PointSelectionMode>('pickup')
  const [route, setRoute] = useState<RouteInfo | null>(null)
  const [price, setPrice] = useState<PriceBreakdown | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePickupSelect = useCallback(
    (point: LatLng) => {
      setPickup(point)
      setRoute(null)
      setPrice(null)
      setError(null)
      if (!delivery) {
        setSelectionMode('delivery')
      }
    },
    [delivery]
  )

  const handleDeliverySelect = useCallback(
    (point: LatLng) => {
      setDelivery(point)
      setRoute(null)
      setPrice(null)
      setError(null)
      if (!pickup) {
        setSelectionMode('pickup')
      }
    },
    [pickup]
  )

  const handleCalculateRoute = useCallback(async () => {
    if (!pickup || !delivery) {
      setError('Selecciona ambos puntos en el mapa')
      return
    }

    setIsCalculating(true)
    setError(null)

    try {
      const routeInfo = await RouteService.getRoute(pickup, delivery)
      setRoute(routeInfo)

      const priceBreakdown = PriceService.calculatePrice(routeInfo.distance)
      setPrice(priceBreakdown)
    } catch (err) {
      console.error('Error calculando ruta:', err)
      setError('No se pudo calcular la ruta. Intenta con otros puntos.')
      setRoute(null)
      setPrice(null)
    } finally {
      setIsCalculating(false)
    }
  }, [pickup, delivery])

  const handleClearAll = useCallback(() => {
    setPickup(null)
    setDelivery(null)
    setSelectionMode('pickup')
    setRoute(null)
    setPrice(null)
    setError(null)
  }, [])

  const handleSwapPoints = useCallback(() => {
    if (!pickup || !delivery) return

    setPickup(delivery)
    setDelivery(pickup)
    setRoute(null)
    setPrice(null)
    setError(null)
  }, [pickup, delivery])

  const handleShareQuote = useCallback(() => {
    if (!route || !price) return

    const message = encodeURIComponent(
      `🚚 *Cotización de Transporte* 🚚\n\n` +
        `📍 *Distancia:* ${route.distance.toFixed(2)} km\n` +
        `⏱️ *Tiempo estimado:* ${Math.floor(route.duration / 60)} min\n\n` +
        `💰 *DESGLOSE:*\n` +
        `• Tarifa base: ${PriceService.formatCurrency(price.basePrice)}\n` +
        `• Costo por km: ${PriceService.formatCurrency(price.pricePerKm)} × ${price.distanceKm.toFixed(2)} km\n` +
        `• Subtotal: ${PriceService.formatCurrency(price.basePrice + price.distanceCost)}\n` +
        `• *TOTAL: ${PriceService.formatCurrency(price.total)}*\n\n` +
        `📱 Cotización generada en Aero\n` +
        `¡Contáctanos para más información!`
    )

    window.open(`https://wa.me/?text=${message}`, '_blank')
  }, [route, price])

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <div className="absolute inset-0 z-0">
        <MapComponent
          onPickupSelect={handlePickupSelect}
          onDeliverySelect={handleDeliverySelect}
          pickup={pickup}
          delivery={delivery}
          selectionMode={selectionMode}
          route={route}
          isCalculating={isCalculating}
        />
      </div>

      {/* Brand header */}
      <header className="pointer-events-none absolute left-0 right-0 top-0 z-10 p-4">
        <div className="pointer-events-auto inline-flex items-center gap-3 rounded-2xl border border-white/60 bg-white/80 px-4 py-2.5 shadow-soft backdrop-blur">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-[0_8px_20px_-8px_rgba(39,72,214,0.6)]">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 11l19-7-7 19-2-8-10-4z" />
            </svg>
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight text-slate-900">
              Aero
            </p>
            <p className="text-[11px] text-slate-500">Cotizador de fletes</p>
          </div>
        </div>
      </header>

      {/* Side panel */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="mx-auto flex h-full max-w-7xl items-start justify-end p-4 pt-20 md:pt-4">
          <div className="pointer-events-auto w-full md:w-auto">
            <RoutePanel
              pickup={pickup}
              delivery={delivery}
              route={route}
              price={price}
              selectionMode={selectionMode}
              onCalculateRoute={handleCalculateRoute}
              onSelectionModeChange={setSelectionMode}
              onSwapPoints={handleSwapPoints}
              onClearAll={handleClearAll}
              onShareQuote={handleShareQuote}
              isCalculating={isCalculating}
            />

            {error && (
              <div
                role="alert"
                className="mt-3 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-rose-800 shadow-soft animate-fadeUp"
              >
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3 1.5 21h21L12 3z" />
                  <path d="M12 10v5" />
                  <path d="M12 18h.01" />
                </svg>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">No se pudo completar</p>
                  <p className="text-xs text-rose-700/80">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Attribution footer */}
      <div className="absolute bottom-2 left-2 z-[5] rounded-md bg-white/75 px-2 py-1 text-[10px] text-slate-500 backdrop-blur md:hidden">
        © OpenStreetMap · OSRM
      </div>
    </main>
  )
}
