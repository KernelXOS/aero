'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  ZoomControl,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import L, { LeafletMouseEvent } from 'leaflet'
import { LatLng, PointSelectionMode, RouteInfo } from '../../types'

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
  selectionMode,
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
    },
  })
  return null
}

function MapEventsHandler({
  onMouseMove,
}: {
  onMouseMove: (pos: LatLng) => void
}) {
  useMapEvents({
    mousemove: (event: LeafletMouseEvent) => {
      onMouseMove({ lat: event.latlng.lat, lng: event.latlng.lng })
    },
  })
  return null
}

function RouteViewport({
  pickup,
  delivery,
  route,
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
        padding: [40, 40],
      })
      return
    }

    if (pickup && delivery) {
      const pointBounds = L.latLngBounds([
        [pickup.lat, pickup.lng],
        [delivery.lat, delivery.lng],
      ])
      map.fitBounds(pointBounds.pad(0.3), {
        animate: true,
        padding: [40, 40],
      })
    }
  }, [map, pickup, delivery, route])

  return null
}

const pickupIconHtml = `<div class="pin pin-pickup"><span class="pin-pulse"></span><span>A</span></div>`
const deliveryIconHtml = `<div class="pin pin-delivery"><span class="pin-pulse"></span><span>B</span></div>`

export default function MapComponent({
  onPickupSelect,
  onDeliverySelect,
  pickup,
  delivery,
  selectionMode,
  route,
  isCalculating,
}: MapComponentProps) {
  const [mousePosition, setMousePosition] = useState<LatLng | null>(null)
  const [truckIndex, setTruckIndex] = useState(0)
  const defaultCenter: LatLng = { lat: 19.4326, lng: -99.1332 }

  const pickupIcon = useMemo(
    () =>
      new L.DivIcon({
        html: pickupIconHtml,
        className: 'pin-marker-wrapper',
        iconSize: [36, 36],
        iconAnchor: [6, 36],
      }),
    []
  )

  const deliveryIcon = useMemo(
    () =>
      new L.DivIcon({
        html: deliveryIconHtml,
        className: 'pin-marker-wrapper',
        iconSize: [36, 36],
        iconAnchor: [6, 36],
      }),
    []
  )

  const truckIcon = useMemo(
    () =>
      new L.DivIcon({
        html: '<div class="truck-marker">🚚</div>',
        className: 'truck-marker-wrapper',
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      }),
    []
  )

  const pickupDragHandlers = useMemo<L.LeafletEventHandlerFnMap>(
    () => ({
      dragend: (event) => {
        const marker = event.target as L.Marker
        const position = marker.getLatLng()
        onPickupSelect({ lat: position.lat, lng: position.lng })
      },
    }),
    [onPickupSelect]
  )

  const deliveryDragHandlers = useMemo<L.LeafletEventHandlerFnMap>(
    () => ({
      dragend: (event) => {
        const marker = event.target as L.Marker
        const position = marker.getLatLng()
        onDeliverySelect({ lat: position.lat, lng: position.lng })
      },
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

  const modeLabel = selectionMode === 'pickup' ? 'Origen' : 'Destino'
  const modeAccent =
    selectionMode === 'pickup'
      ? { dot: 'bg-emerald-500', text: 'text-emerald-700' }
      : { dot: 'bg-rose-500', text: 'text-rose-700' }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[defaultCenter.lat, defaultCenter.lng]}
        zoom={12}
        minZoom={4}
        maxZoom={19}
        zoomControl={false}
        scrollWheelZoom
        dragging
        touchZoom
        doubleClickZoom
        boxZoom
        keyboard
        className="h-full w-full"
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
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
            icon={pickupIcon}
            draggable
            eventHandlers={pickupDragHandlers}
          />
        )}

        {delivery && (
          <Marker
            position={[delivery.lat, delivery.lng]}
            icon={deliveryIcon}
            draggable
            eventHandlers={deliveryDragHandlers}
          />
        )}

        {route && route.coordinates.length > 0 && !isCalculating && (
          <>
            <Polyline
              positions={route.coordinates.map(
                (coord) => [coord.lat, coord.lng] as [number, number]
              )}
              color="#ffffff"
              weight={8}
              opacity={0.9}
            />
            <Polyline
              positions={route.coordinates.map(
                (coord) => [coord.lat, coord.lng] as [number, number]
              )}
              color="#2748d6"
              weight={4.5}
              opacity={0.95}
              smoothFactor={1}
            />
          </>
        )}

        {truckPosition && route && route.coordinates.length > 1 && !isCalculating && (
          <Marker position={[truckPosition.lat, truckPosition.lng]} icon={truckIcon} />
        )}

        <MapEventsHandler onMouseMove={setMousePosition} />
      </MapContainer>

      {/* Mode chip */}
      <div className="pointer-events-none absolute left-4 top-4 z-[1000]">
        <div className="glass pointer-events-auto inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-slate-700">
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${modeAccent.dot}`}
          >
            <span
              className={`absolute inset-0 rounded-full ${modeAccent.dot} opacity-60 animate-pingSoft`}
            />
          </span>
          <span className="font-semibold">Colocando:</span>
          <span className={`font-semibold ${modeAccent.text}`}>{modeLabel}</span>
        </div>
      </div>

      {/* Coordinates pill */}
      {mousePosition && (
        <div className="pointer-events-none absolute bottom-4 left-4 z-[1000] hidden md:block">
          <div className="glass-dark inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[11px] text-white/90">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-400" />
            {mousePosition.lat.toFixed(5)}°, {mousePosition.lng.toFixed(5)}°
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {isCalculating && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px]">
          <div className="glass flex flex-col items-center gap-3 rounded-2xl px-6 py-5">
            <div className="relative h-10 w-10">
              <div className="absolute inset-0 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
              <div className="absolute inset-2 rounded-full bg-brand-50" />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              Trazando la ruta óptima…
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
