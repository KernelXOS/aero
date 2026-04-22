'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  ZoomControl,
  useMap,
  useMapEvents
} from 'react-leaflet'
import L, { LeafletMouseEvent } from 'leaflet'
import { LatLng, PointSelectionMode, RouteInfo } from '../../types'

// Configurar iconos de Leaflet para Next.js
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
})

interface MapComponentProps {
  onPickupSelect: (latlng: LatLng) => void
  onDeliverySelect: (latlng: LatLng) => void
  pickup: LatLng | null
  delivery: LatLng | null
  selectionMode: PointSelectionMode
  route: RouteInfo | null
  isCalculating: boolean
}

interface MapClickHandlerProps {
  onPickupSelect: (latlng: LatLng) => void
  onDeliverySelect: (latlng: LatLng) => void
  selectionMode: PointSelectionMode
}

function MapClickHandler({
  onPickupSelect,
  onDeliverySelect,
  selectionMode
}: MapClickHandlerProps) {
  useMapEvents({
    click: (event: LeafletMouseEvent) => {
      const { lat, lng } = event.latlng
      const newPoint = { lat, lng }

      if (selectionMode === 'pickup') {
        onPickupSelect(newPoint)
        return
      }

      onDeliverySelect(newPoint)
    }
  })

  return null
}

function MapEventsHandler({ onMouseMove }: { onMouseMove: (pos: LatLng) => void }) {
  useMapEvents({
    mousemove: (event: LeafletMouseEvent) => {
      onMouseMove({ lat: event.latlng.lat, lng: event.latlng.lng })
    }
  })

  return null
}

function RouteViewport({
  pickup,
  delivery,
  route
}: {
  pickup: LatLng | null
  delivery: LatLng | null
  route: RouteInfo | null
}) {
  const map = useMap()

  useEffect(() => {
    if (route && route.coordinates.length > 1) {
      const routeBounds = L.latLngBounds(
        route.coordinates.map((coord) => [coord.lat, coord.lng] as [number, number])
      )

      map.fitBounds(routeBounds.pad(0.2), {
        animate: true,
        padding: [24, 24]
      })
      return
    }

    if (pickup && delivery) {
      const pointBounds = L.latLngBounds([
        [pickup.lat, pickup.lng],
        [delivery.lat, delivery.lng]
      ])

      map.fitBounds(pointBounds.pad(0.3), {
        animate: true,
        padding: [24, 24]
      })
    }
  }, [map, pickup, delivery, route])

  return null
}

export default function MapComponent({
  onPickupSelect,
  onDeliverySelect,
  pickup,
  delivery,
  selectionMode,
  route,
  isCalculating
}: MapComponentProps) {
  const [mousePosition, setMousePosition] = useState<LatLng | null>(null)
  const [truckIndex, setTruckIndex] = useState(0)
  const defaultCenter: LatLng = { lat: 19.4326, lng: -99.1332 }

  const greenIcon = useMemo(
    () =>
      new L.Icon({
        iconUrl:
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      }),
    []
  )

  const redIcon = useMemo(
    () =>
      new L.Icon({
        iconUrl:
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      }),
    []
  )

  const truckIcon = useMemo(
    () =>
      new L.DivIcon({
        html: '<div class="truck-marker">🚚</div>',
        className: 'truck-marker-wrapper',
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      }),
    []
  )

  const pickupDragHandlers = useMemo<L.LeafletEventHandlerFnMap>(
    () => ({
      dragend: (event) => {
        const marker = event.target as L.Marker
        const position = marker.getLatLng()
        onPickupSelect({ lat: position.lat, lng: position.lng })
      }
    }),
    [onPickupSelect]
  )

  const deliveryDragHandlers = useMemo<L.LeafletEventHandlerFnMap>(
    () => ({
      dragend: (event) => {
        const marker = event.target as L.Marker
        const position = marker.getLatLng()
        onDeliverySelect({ lat: position.lat, lng: position.lng })
      }
    }),
    [onDeliverySelect]
  )

  useEffect(() => {
    setTruckIndex(0)
  }, [route])

  useEffect(() => {
    if (!route || route.coordinates.length < 2 || isCalculating) {
      return
    }

    const totalPoints = route.coordinates.length
    const step = Math.max(1, Math.floor(totalPoints / 220))
    const interval = window.setInterval(() => {
      setTruckIndex((currentIndex) => {
        if (currentIndex + step >= totalPoints) {
          return 0
        }

        return currentIndex + step
      })
    }, 80)

    return () => {
      window.clearInterval(interval)
    }
  }, [route, isCalculating])

  const truckPosition = route?.coordinates.length
    ? route.coordinates[Math.min(truckIndex, route.coordinates.length - 1)]
    : null

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[defaultCenter.lat, defaultCenter.lng]}
        zoom={12}
        minZoom={4}
        maxZoom={19}
        zoomControl={false}
        scrollWheelZoom={true}
        dragging={true}
        touchZoom={true}
        doubleClickZoom={true}
        boxZoom={true}
        keyboard={true}
        className="h-full w-full"
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <MapClickHandler
          onPickupSelect={onPickupSelect}
          onDeliverySelect={onDeliverySelect}
          selectionMode={selectionMode}
        />

        <RouteViewport pickup={pickup} delivery={delivery} route={route} />

        {pickup && (
          <Marker
            position={[pickup.lat, pickup.lng]}
            icon={greenIcon}
            draggable={true}
            eventHandlers={pickupDragHandlers}
          >
            <Popup>Punto de inicio</Popup>
          </Marker>
        )}

        {delivery && (
          <Marker
            position={[delivery.lat, delivery.lng]}
            icon={redIcon}
            draggable={true}
            eventHandlers={deliveryDragHandlers}
          >
            <Popup>Punto de destino</Popup>
          </Marker>
        )}

        {route && route.coordinates.length > 0 && !isCalculating && (
          <Polyline
            positions={route.coordinates.map((coord) => [coord.lat, coord.lng] as [number, number])}
            color="#3B82F6"
            weight={4}
            opacity={0.85}
            smoothFactor={1}
          />
        )}

        {truckPosition && route && route.coordinates.length > 1 && !isCalculating && (
          <Marker position={[truckPosition.lat, truckPosition.lng]} icon={truckIcon}>
            <Popup>Carrito en ruta</Popup>
          </Marker>
        )}

        <MapEventsHandler onMouseMove={setMousePosition} />
      </MapContainer>

      <div className="absolute left-4 top-4 z-[1000] rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs text-slate-700 shadow-md">
        <p className="font-semibold text-slate-800">
          Modo actual: {selectionMode === 'pickup' ? 'Inicio' : 'Destino'}
        </p>
        <p>Haz clic para colocar el punto seleccionado.</p>
        <p>Tambien puedes arrastrar marcadores para ajustar.</p>
      </div>

      {mousePosition && (
        <div className="absolute bottom-4 left-4 z-[1000] rounded-lg bg-black/70 px-3 py-1 font-mono text-sm text-white">
          📍 {mousePosition.lat.toFixed(6)}°, {mousePosition.lng.toFixed(6)}°
        </div>
      )}

      {isCalculating && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/50">
          <div className="glassmorphism flex flex-col items-center gap-4 p-6">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="font-semibold text-gray-700">Calculando ruta optima...</p>
          </div>
        </div>
      )}
    </div>
  )
}
