'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import {
  LatLng,
  RouteInfo,
  PriceBreakdown,
  PointSelectionMode
} from '../types'
import { RouteService } from './lib/routeService'
import { PriceService } from './lib/priceService'
import RoutePanel from './components/RoutePanel'

// Importar dinámicamente el mapa para evitar errores de SSR
const MapComponent = dynamic(() => import('./components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando mapa...</p>
      </div>
    </div>
  )
})

export default function Home() {
  const [pickup, setPickup] = useState<LatLng | null>(null)
  const [delivery, setDelivery] = useState<LatLng | null>(null)
  const [selectionMode, setSelectionMode] = useState<PointSelectionMode>('pickup')
  const [route, setRoute] = useState<RouteInfo | null>(null)
  const [price, setPrice] = useState<PriceBreakdown | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handlePickupSelect = useCallback((point: LatLng) => {
    setPickup(point)
    setRoute(null)
    setPrice(null)
    setError(null)
    if (!delivery) {
      setSelectionMode('delivery')
    }
  }, [delivery])
  
  const handleDeliverySelect = useCallback((point: LatLng) => {
    setDelivery(point)
    setRoute(null)
    setPrice(null)
    setError(null)
    if (!pickup) {
      setSelectionMode('pickup')
    }
  }, [pickup])
  
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
      `📱 Cotización generada en TransporteApp\n` +
      `¡Contáctanos para más información!`
    )
    
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }, [route, price])
  
  return (
    <main className="relative w-screen h-screen overflow-hidden">
      {/* Mapa de fondo */}
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
      
      {/* Panel lateral/central */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="container mx-auto h-full flex items-start justify-end p-4 pointer-events-none">
          <div className="w-full md:w-auto pointer-events-auto">
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
            
            {/* Mensaje de error */}
            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-lg">
                <p className="font-semibold">⚠️ Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer con créditos */}
      <div className="absolute bottom-2 left-2 z-10 text-xs text-gray-500 bg-white/70 px-2 py-1 rounded">
        Datos de mapa © OpenStreetMap | Rutas por OSRM
      </div>
    </main>
  )
}