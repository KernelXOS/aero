'use client'

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
  isCalculating
}: RoutePanelProps) {
  const formatDistance = (km: number) => {
    return `${km.toFixed(2)} km`
  }
  
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`
    }
    return `${minutes} min`
  }
  
  return (
    <div className="glassmorphism panel-shell p-6 w-full md:w-[27rem] space-y-6 shadow-xl">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">💰 Cotización de Flete</h2>
        <p className="text-sm text-gray-600 mt-1">Selecciona puntos en el mapa y calcula tu ruta</p>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-2">
        <button
          onClick={() => onSelectionModeChange('pickup')}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
            selectionMode === 'pickup'
              ? 'bg-emerald-600 text-white shadow'
              : 'bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          Editar Inicio
        </button>
        <button
          onClick={() => onSelectionModeChange('delivery')}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
            selectionMode === 'delivery'
              ? 'bg-rose-600 text-white shadow'
              : 'bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          Editar Destino
        </button>
      </div>
      
      {/* Estado de puntos seleccionados */}
      <div className="space-y-3">
        <div
          className={`flex items-start gap-3 p-3 bg-green-50 rounded-lg border transition ${
            selectionMode === 'pickup' ? 'border-emerald-400 ring-2 ring-emerald-200' : 'border-transparent'
          }`}
        >
          <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-700">Punto de Inicio</p>
            {pickup ? (
              <p className="text-xs text-gray-600 font-mono">
                {pickup.lat.toFixed(6)}°, {pickup.lng.toFixed(6)}°
              </p>
            ) : (
              <p className="text-xs text-gray-400">No seleccionado</p>
            )}
          </div>
        </div>
        
        <div
          className={`flex items-start gap-3 p-3 bg-red-50 rounded-lg border transition ${
            selectionMode === 'delivery' ? 'border-rose-400 ring-2 ring-rose-200' : 'border-transparent'
          }`}
        >
          <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5"></div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-700">Punto de Destino</p>
            {delivery ? (
              <p className="text-xs text-gray-600 font-mono">
                {delivery.lat.toFixed(6)}°, {delivery.lng.toFixed(6)}°
              </p>
            ) : (
              <p className="text-xs text-gray-400">No seleccionado</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Botones de acción */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onCalculateRoute}
          disabled={!pickup || !delivery || isCalculating}
          className="col-span-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none"
        >
          🗺️ Calcular Ruta
        </button>
        <button
          onClick={onSwapPoints}
          disabled={!pickup || !delivery || isCalculating}
          className="bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 text-slate-700 font-semibold py-3 rounded-lg transition"
          title="Intercambiar inicio y destino"
        >
          ⇄
        </button>
        <button
          onClick={onClearAll}
          disabled={isCalculating}
          className="col-span-3 px-4 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg transition-all duration-200"
        >
          🧹 Limpiar
        </button>
      </div>
      
      {/* Información de la ruta */}
      {route && price && !isCalculating && (
        <div className="space-y-4 animate-fadeIn">
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-bold text-gray-800 mb-3">📊 Detalles de la Ruta</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Distancia total:</span>
                <span className="font-semibold text-blue-600">{formatDistance(route.distance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tiempo estimado:</span>
                <span className="font-semibold text-blue-600">{formatDuration(route.duration)}</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-bold text-gray-800 mb-3">💰 Desglose de Precio</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tarifa base:</span>
                <span className="font-semibold">{PriceService.formatCurrency(price.basePrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Por distancia ({price.distanceKm.toFixed(2)} km × {PriceService.formatCurrency(price.pricePerKm)}):</span>
                <span className="font-semibold">{PriceService.formatCurrency(price.distanceCost)}</span>
              </div>
              {price.total === price.minimumCharge && price.distanceCost + price.basePrice < price.minimumCharge && (
                <div className="flex justify-between text-orange-600">
                  <span>Cargo mínimo aplicado:</span>
                  <span className="font-semibold">{PriceService.formatCurrency(price.minimumCharge)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-800">TOTAL A PAGAR:</span>
                  <span className="text-green-600">{PriceService.formatCurrency(price.total)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={onShareQuote}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            📱 Compartir por WhatsApp
          </button>
        </div>
      )}
      
      {/* Mensaje cuando falta seleccionar puntos */}
      {(!pickup || !delivery) && (
        <div className="text-center text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
          💡 Haz clic en el mapa para seleccionar:
          <br />
          <span className="text-green-600">1° Inicio (verde)</span>
          <br />
          <span className="text-red-600">2° Destino (rojo)</span>
        </div>
      )}
    </div>
  )
}